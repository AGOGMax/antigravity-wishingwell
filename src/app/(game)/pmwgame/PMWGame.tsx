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
} from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useRef, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { useReadContracts, useReadContract } from "wagmi";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";

export default function PMWGame() {
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const PMWContract = usePinkMistWellContract();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [userTickets, setUserTickets] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [currentParticipatedCount, setcurrentParticipatedCount] = useState(0);
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

  const {
    data: PMWReader,
    error: PMWError,
    isFetched: PMWFetched,
    refetch: refetchPMWReader,
  } = useReadContracts({
    contracts: [
      "getCurrentRoundActiveTickets",
      "MAX_ENTRIES",
      "currentRoundId",
    ].map((functionName) => ({
      address: PMWContract.address as `0x${string}`,
      abi: PMWContract.abi,
      functionName,
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
    })),
  });

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
  const currentRoundId = PMWReader?.[2].result;

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
        return (
          setcurrentParticipatedList(newParticipantsList),
          setcurrentParticipatedCount(newParticipantsList?.length)
        );
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
        setcurrentParticipatedCount(newParticipantsList?.length);
      }, 8000);
    } else {
      const [tickets, addresses] = (PMWReader?.[0].result ?? [[], []]) as [
        number[],
        string[],
      ];
      setcurrentParticipatedList(generateTicketMapping([tickets, addresses]));
      setcurrentParticipatedCount(
        (PMWReader?.[0].result as Array<Array<string>>)?.[0]?.length,
      );
    }
  }, [PMWReader?.[0].result]);

  const {
    data: getUserTicketsReader,
    isFetched: isUserTicketsFetched,
    refetch: refetchUserTickets,
  } = useReadContracts({
    contracts: ["getUserTickets", "getUserActiveTicketCount"].map(
      (functionName) => ({
        address: PMWContract.address as `0x${string}`,
        abi: PMWContract.abi,
        functionName,
        args: [currentRoundId, userAddress],
      }),
    ),
  });

  const {
    data: roundsDataReader,
    isFetched: isRoundsFetched,
    refetch: refetchRounds,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "rounds",
    args: [currentRoundId],
  });

  useEffect(() => {
    if (isRoundsFetched) {
      const isRoundClosed = (roundsDataReader as Array<boolean>)?.[3];
      if (isRoundClosed) {
        setIsRegistrationOpen(false);
      } else {
        setIsRegistrationOpen(true);
      }
    }
  }, [roundsDataReader]);

  useEffect(() => {
    if (isUserTicketsFetched) {
      setUserAllTickets(
        getUserTicketsReader?.[0].result as Array<Array<number>>,
      );
      setUserActiveTicketCount(Number(getUserTicketsReader?.[1].result));
    }
  }, [getUserTicketsReader]);

  useEffect(() => {
    setMaxTickets(totalParticipants - currentParticipatedCount);
  }, [currentParticipatedCount, totalParticipants]);

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
              <Text size="large" style={{ marginBottom: "0" }}>
                0x...{String(userAddress)?.slice(-3)}
              </Text>
            </div>
          </>
        )}
      </Toolbar>
      {account.isConnected ? (
        <>
          <div className="flex flex-col items-center">
            <Text>
              {isRegistrationOpen
                ? `${currentParticipatedCount} out of 
            ${totalParticipants}...`
                : ""}
            </Text>
            {isRegistrationOpen && (
              <Progress
                value={currentParticipatedCount}
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
            <div className="w-[65%] min-w-max flex justify-center">
              <Grid currentParticipatedList={currentParticipatedList} />
            </div>
            <div className="w-[20%] max-w-[20%]">
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
                        : "Wait for the next round to start to buy Tickets!"}
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
