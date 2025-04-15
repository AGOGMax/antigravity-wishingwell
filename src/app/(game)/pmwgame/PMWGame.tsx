"use client";
import {
  Text,
  PixelBorder,
  Progress,
  Button,
  Input,
  Toolbar,
  Separator,
  Container,
  Table,
} from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useRef, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";
import { UserWalletAddress } from "./UserWalletAddress";
import usePMWReader from "@/hooks/sc-fns/usePMWReader";
import useUserTickets from "@/hooks/sc-fns/useUserTickets";
import useCurrentRound from "@/hooks/sc-fns/useCurrentRound";
import usePrizes from "@/hooks/sc-fns/usePrizes";
import { extractRoundsPrizes } from "../utils";

type PrizeArrays = [number[], number[], boolean[], string[], number[]];

export default function PMWGame() {
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const { PMWReader, PMWError, PMWFetched, refetchPMWReader } = usePMWReader();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [userTickets, setUserTickets] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [currentActiveTicketsCount, setcurrentActiveTicketsCount] = useState(0);
  const [currentParticipatedList, setcurrentParticipatedList] = useState([
    {
      ticketNumber: 0,
      walletAddress: "",
      isUserCell: false,
      isBurst: false,
    },
  ]);
  const [userAllTickets, setUserAllTickets] = useState(
    [] as Array<boolean[] | number[]>,
  );
  const [userActiveTicketCount, setUserActiveTicketCount] = useState(0);
  const loadingRef = useRef({
    isEnterGameTransactionLoading: false,
    isEliminateUserTransactionLoading: false,
  });

  const userAddress = account?.address as `0x${string}`;

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        isEnterGameTransactionLoading,
        isEliminateUserTransactionLoading,
      } = loadingRef.current;

      if (
        !(isEnterGameTransactionLoading || isEliminateUserTransactionLoading)
      ) {
        refetchPMWReader();
        refetchUserTickets();
        refetchRounds();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refetchPMWReader]);

  const totalParticipants = Number(PMWReader?.[1].result) || 0;
  const currentRoundId = (PMWReader?.[2].result as bigint) ?? 0;

  const { getUserTicketsReader, isUserTicketsFetched, refetchUserTickets } =
    useUserTickets(currentRoundId, userAddress);

  const generateTicketMapping = (participants: [number[], string[]]) => {
    const participantsTickets = participants?.[0] ?? [];
    const participantsAddress = participants?.[1] ?? [];
    return participantsTickets.map((participant, index) => {
      return {
        ticketNumber: Number(participant) + 1,
        walletAddress: participantsAddress?.[index],
        isUserCell: participantsAddress?.[index] === userAddress,
        isBurst: false,
      };
    });
  };

  useEffect(() => {
    if (PMWFetched) {
      const [tickets, addresses] = (PMWReader?.[0].result ?? [[], []]) as [
        number[],
        string[],
      ];
      const newParticipantsList = generateTicketMapping([tickets, addresses]);

      const eliminatedParticipants = currentParticipatedList
        ?.filter(
          (participant) =>
            !newParticipantsList.some(
              (newParticipant) =>
                newParticipant.ticketNumber === participant.ticketNumber,
            ),
        )
        .map((eliminatedParticipant) => eliminatedParticipant.ticketNumber);

      if (eliminatedParticipants.length === 0) {
        return setcurrentParticipatedList(newParticipantsList);
      }

      const participantsListWithEliminatedTickets: {
        ticketNumber: number;
        walletAddress: string;
        isUserCell: boolean;
        isBurst: boolean;
      }[] = currentParticipatedList.map((participant) => {
        if (eliminatedParticipants.includes(participant.ticketNumber)) {
          return { ...participant, isBurst: true };
        }
        return participant;
      });

      setcurrentParticipatedList(participantsListWithEliminatedTickets);

      setTimeout(() => {
        setcurrentParticipatedList(newParticipantsList);
      }, 8000);
    } else {
      const [tickets, addresses] = (PMWReader?.[0].result ?? [[], []]) as [
        number[],
        string[],
      ];
      setcurrentParticipatedList(generateTicketMapping([tickets, addresses]));
    }
  }, [PMWReader?.[0].result]);

  const { roundsDataReader, isRoundsFetched, refetchRounds } =
    useCurrentRound(currentRoundId);

  useEffect(() => {
    if (isRoundsFetched) {
      const isRoundClosed = (roundsDataReader as Array<boolean>)?.[3];
      if (isRoundClosed) {
        setIsRegistrationOpen(false);
        setUserTickets(0);
      } else {
        setIsRegistrationOpen(true);
      }
      setcurrentActiveTicketsCount(
        Number((roundsDataReader as Array<number>)?.[2]),
      );
    }
  }, [roundsDataReader]);

  const { prizesReader, isPrizesFetched, refetchPrizes } = usePrizes();

  const { currentRoundPrize, lastRoundsPrizes } = extractRoundsPrizes(
    prizesReader as PrizeArrays,
  );

  useEffect(() => {
    if (isUserTicketsFetched) {
      setUserAllTickets(
        getUserTicketsReader?.[0].result as Array<Array<number>>,
      );
      setUserActiveTicketCount(Number(getUserTicketsReader?.[1].result));
    }
  }, [getUserTicketsReader]);

  useEffect(() => {
    setMaxTickets(totalParticipants - currentActiveTicketsCount);
  }, [currentActiveTicketsCount, totalParticipants]);

  const userAllTicketsCount = (userAllTickets as [number[], boolean[]])?.[0]
    ?.length;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openConnectModal) {
      openConnectModal();
    }
  };

  function handleChange(value: string) {
    setUserTickets(value === "" ? 0 : Number(value));
  }

  const {
    enterGame,
    transactionLoading: isEnterGameTransactionLoading,
    approveIsLoading: isEnterGameTokenApprovalLoading,
    enterGameReceipt,
  } = useEnterGame(BigInt(userTickets));

  const {
    eliminateUser,
    transactionLoading: isEliminateUserTransactionLoading,
    eliminateUserReceipt,
  } = useEliminateUser();

  useEffect(() => {
    loadingRef.current = {
      isEnterGameTransactionLoading,
      isEliminateUserTransactionLoading,
    };
  }, [isEnterGameTransactionLoading, isEliminateUserTransactionLoading]);

  useEffect(() => {
    if (
      !isEnterGameTransactionLoading &&
      (enterGameReceipt || eliminateUserReceipt)
    ) {
      refetchPMWReader();
      refetchUserTickets();
      refetchRounds();
      refetchPrizes();
    }
  }, [isEnterGameTransactionLoading, enterGameReceipt, eliminateUserReceipt]);

  const renderEnterGameButtonState = () => {
    if (isEnterGameTokenApprovalLoading) {
      return "Approving...";
    } else if (isEnterGameTransactionLoading) {
      return "Entering Game...";
    }
    return "Enter Game";
  };

  const renderEliminateUserButtonState = () => {
    if (isEliminateUserTransactionLoading) {
      return "Misting 'em...";
    }
    return "Mist 'em";
  };
  return (
    <div className="m-8 flex flex-col justify-center items-center gap-[1rem] box-border">
      <PixelBorder
        doubleSize
        doubleRoundCorners
        style={{
          width: "max-content",
          padding: "8px 16px",
          marginBottom: "16px",
        }}
      >
        <Text size="large" centered>
          <br />
          Pink Mist Whale
        </Text>
      </PixelBorder>
      <Toolbar
        style={{
          padding: "10px 15px",
          width: "80vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="w-[33%] flex justify-center items-center">
          <Text size="large" style={{ marginBottom: "0" }}>
            Your Active Tickets: {userActiveTicketCount || 0}
          </Text>
        </div>
        <Separator />
        <div className="w-[33%] flex justify-center items-center">
          <Text size="large" style={{ marginBottom: "0" }}>
            ROUND-{Number(currentRoundId)}
          </Text>
        </div>
        {account.isConnected && (
          <>
            <Separator />
            <div className="w-[33%] flex justify-center items-center">
              <UserWalletAddress />
            </div>
          </>
        )}
      </Toolbar>
      {account.isConnected ? (
        <>
          <div className="flex flex-col items-center">
            <Text>
              {isRegistrationOpen
                ? `${currentActiveTicketsCount} out of 
            ${totalParticipants}...`
                : ""}
            </Text>
            {isRegistrationOpen && (
              <Progress
                value={currentActiveTicketsCount}
                max={totalParticipants}
                color="pattern"
                style={{ width: "40vw" }}
              />
            )}
          </div>

          <div className="flex items-center justify-center">
            {isRegistrationOpen ? (
              <>
                <div className="flex flex-col">
                  <Input
                    type="number"
                    name="userTickets"
                    value={userTickets.toString()}
                    label="Number Of Tickets: "
                    style={{ height: "32px", fontSize: "16px" }}
                    onChange={handleChange}
                    color={
                      userTickets < 0 || userTickets > maxTickets
                        ? "error"
                        : "none"
                    }
                  />
                  <Text size="medium" color="warning">
                    Max Tickets: {maxTickets}
                  </Text>
                </div>
                <Button
                  color="primary"
                  size="large"
                  disabled={
                    userTickets <= 0 ||
                    userTickets > maxTickets ||
                    isEnterGameTransactionLoading
                  }
                  onClick={enterGame}
                >
                  {renderEnterGameButtonState()}
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                onClick={eliminateUser}
                disabled={isEliminateUserTransactionLoading}
                size="large"
              >
                <Text size="large">{renderEliminateUserButtonState()}</Text>
              </Button>
            )}
          </div>

          <div className="flex w-full max-w-full box-border gap-[8px]">
            {!isRegistrationOpen ? (
              <div className="w-[65%] min-w-max flex justify-center">
                <Grid
                  currentParticipatedList={currentParticipatedList}
                  activeTicketCount={currentActiveTicketsCount}
                />
              </div>
            ) : (
              <div>
                {lastRoundsPrizes.length !== 0
                  ? `Congratulations ${lastRoundsPrizes?.[0]?._winner} for winning
              Round-${Number(currentRoundId) - 1}`
                  : null}
              </div>
            )}
            <div className="w-[25%] max-w-[25%] flex flex-col gap-[20px]">
              <Container
                align="left"
                title="&lt;Your Tickets&gt;"
                roundedCorners
                alignTitle="center"
                style={{ width: "fit-content" }}
              >
                <div className="flex gap-[10px] mt-5 items-center justify-start">
                  {userAllTicketsCount === 0 ? (
                    <span className="!text-[16px] !text-pretty">
                      {isRegistrationOpen
                        ? "Hit 'Enter Game' to buy Tickets! "
                        : "Mist 'em all to participate in the next round!"}
                    </span>
                  ) : (
                    (userAllTickets as [number[], boolean[]])?.[0]?.map(
                      (ticket, index) => {
                        return (
                          <span
                            key={index}
                            className={`${
                              (userAllTickets as [number[], boolean[]])?.[1]?.[
                                index
                              ]
                                ? "text-successgreen"
                                : "text-brred"
                            } !text-[16px]`}
                          >
                            {Number(ticket) + 1}
                          </span>
                        );
                      },
                    )
                  )}
                </div>
              </Container>
              {lastRoundsPrizes.length !== 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <th>ROUND ID</th>
                      <th>WINNER</th>
                      <th>AMOUNT WON</th>
                      <th>TICKET NUMBER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastRoundsPrizes?.map((roundPrize) => {
                      return (
                        <tr key={roundPrize?.roundId}>
                          <td>{roundPrize?.roundId}</td>
                          <td>
                            0x...
                            {String(roundPrize?._winner)?.slice(-3)}
                          </td>
                          <td>{`${Number(roundPrize?.daiAmount)} $DAI + ${Number(roundPrize?.darkAmount)} $DARK`}</td>
                          <td>{Number(roundPrize?.winningTicket)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[100%] mt-[100px]">
          <Text size="large">Please Connect Your Wallet to Play The Game.</Text>
          <Button color="primary" size="large" onClick={handleLogin}>
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
