"use client";
import { Text, Button } from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useRef, useState } from "react";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";
import usePMWReader from "@/hooks/sc-fns/usePMWReader";
import useUserTickets from "@/hooks/sc-fns/useUserTickets";
import useCurrentRound from "@/hooks/sc-fns/useCurrentRound";
import usePrizes from "@/hooks/sc-fns/usePrizes";
import { extractRoundsPrizes } from "../utils";
import Header from "../Components/Header";
import PMWTitle from "../Components/PMWTitle";
import ConnectWallet from "../Components/ConnectWallet";
import EnterGameScreen from "../Components/EnterGameScreen";
import WinnerHistoryTable from "../Components/WinnerHistoryTable";
import YourTicketsContainer from "../Components/YourTicketsContainer";

type PrizeArrays = [bigint[], bigint[], boolean[], string[], bigint[]];

export default function PMWGame() {
  const account = useAccount();
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

  const isAccountConnected = account.isConnected;
  return (
    <div className="min-h-screen p-8 flex flex-col box-border items-center">
      <PMWTitle />
      <Header
        activeTicketsCount={userActiveTicketCount || 0}
        currentRoundId={Number(currentRoundId)}
        isAccountConnected={isAccountConnected}
      />
      <div className="flex items-start justify-between w-full">
        <YourTicketsContainer
          userAllTickets={userAllTickets}
          userAllTicketsCount={userActiveTicketCount}
        />
        {isAccountConnected ? (
          isRegistrationOpen ? (
            <EnterGameScreen
              currentRoundPrize={currentRoundPrize}
              activeTicketsCount={currentActiveTicketsCount}
              totalParticipants={totalParticipants}
              userTickets={userTickets}
              setUserTickets={setUserTickets}
              renderEnterGameButtonState={renderEnterGameButtonState}
              maxTickets={maxTickets}
              isEnterGameTransactionLoading={isEnterGameTransactionLoading}
              enterGame={enterGame}
              userAllTicketsCount={userAllTicketsCount}
              userAllTickets={userAllTickets}
              lastRoundsPrizes={lastRoundsPrizes}
              currentRoundId={currentRoundId}
              isRegistrationOpen={isRegistrationOpen}
            />
          ) : (
            <div className="flex flex-col items-center justify-center mt-[16px] gap-[16px] w-full">
              <Button
                color="primary"
                onClick={eliminateUser}
                disabled={isEliminateUserTransactionLoading}
                size="large"
              >
                <Text size="large">{renderEliminateUserButtonState()}</Text>
              </Button>
              <Grid
                currentParticipatedList={currentParticipatedList}
                activeTicketCount={currentActiveTicketsCount}
              />
            </div>
          )
        ) : (
          <ConnectWallet />
        )}
        <WinnerHistoryTable lastRoundsPrizes={lastRoundsPrizes} />
      </div>
    </div>
  );
}
