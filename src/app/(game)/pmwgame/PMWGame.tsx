"use client";
import { useAccount } from "wagmi";
import { useEffect, useRef, useState } from "react";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";
import usePMWReader from "@/hooks/sc-fns/usePMWReader";
import useUserTickets from "@/hooks/sc-fns/useUserTickets";
import useCurrentRound from "@/hooks/sc-fns/useCurrentRound";
import usePrizes from "@/hooks/sc-fns/usePrizes";
import { extractRoundsPrizes, generateTicketMapping } from "../utils";
import Header from "../Components/Header";
import PMWTitle from "../Components/PMWTitle";
import EnterGameScreen from "../Components/EnterGameScreen";
import EliminateScreen from "../Components/EliminateScreen";
import JackpotDisplay from "./JackpotDisplay";
import WalletGate from "./WalletGate";

type PrizeArrays = [bigint[], bigint[], boolean[], string[], bigint[]];

export default function PMWGame() {
  const account = useAccount();
  const userAddress = account?.address as `0x${string}`;
  const isAccountConnected = account.isConnected;

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true); //Used to render enter game or eliminate screen.
  const [userTickets, setUserTickets] = useState(0); //Input to handle enter game user input.
  const [maxTickets, setMaxTickets] = useState(0); //Used to handle the number of tickets that can be bought.
  const [currentParticipatedList, setcurrentParticipatedList] = useState([
    //Mapping to handle current tickets with user info.
    {
      ticketNumber: 0,
      walletAddress: "",
      isUserCell: false,
      isBurst: false,
    },
  ]);
  const [userAllTickets, setUserAllTickets] = useState(
    //User's tickets including eliminated and active tickets.
    [] as Array<boolean[] | number[]>,
  );
  const [userActiveTicketCount, setUserActiveTicketCount] = useState(0); //Used to render header active tickets count.
  const loadingRef = useRef({
    //Used to track the current loading state.
    isEnterGameTransactionLoading: false,
    isEliminateUserTransactionLoading: false,
  });
  const currentActiveTicketsCount = currentParticipatedList?.length; //Length of current participated list.

  const { PMWReader, PMWFetched, refetchPMWReader } = usePMWReader(); //PMW Contract Reader
  const totalParticipants = Number(PMWReader?.[1].result) || 0; //Pool size of the game MAX_TICKETS.
  const currentRoundId = (PMWReader?.[2].result as bigint) ?? 0; //Round ID which is going on.

  const { roundsDataReader, isRoundsFetched, refetchRounds } =
    useCurrentRound(currentRoundId); //Rounds Data Reader (Used to change enter/eliminate screen)
  const { prizesReader, isPrizesFetched, refetchPrizes } = usePrizes(); //Used to fetch current round prize, and previous rounds prizes.
  const { currentRoundPrize, lastRoundsPrizes } = extractRoundsPrizes(
    //Util to convert into usable data
    prizesReader as PrizeArrays,
  );

  const {
    getUserTicketsReader,
    isUserTicketsFetched,
    refetchUserTickets,
  } = //User Tickets Reader
    useUserTickets(currentRoundId, userAddress);
  const {
    //Enter Game Hook
    enterGame,
    transactionLoading: isEnterGameTransactionLoading,
    approveIsLoading: isEnterGameTokenApprovalLoading,
    enterGameReceipt,
  } = useEnterGame(BigInt(userTickets));

  const {
    // Eliminate User Hook
    eliminateUser,
    transactionLoading: isEliminateUserTransactionLoading,
    eliminateUserReceipt,
  } = useEliminateUser();

  useEffect(() => {
    //Change loading ref value to support polling refetches.
    loadingRef.current = {
      isEnterGameTransactionLoading,
      isEliminateUserTransactionLoading,
    };
  }, [isEnterGameTransactionLoading, isEliminateUserTransactionLoading]);

  useEffect(() => {
    //Whenever enter game is successful, refetch the needed data.
    if (!isEnterGameTransactionLoading && enterGameReceipt) {
      refetchPMWReader();
      refetchUserTickets();
      refetchRounds();
    }
  }, [isEnterGameTransactionLoading, enterGameReceipt]);

  useEffect(() => {
    //Whenever eliminate user is successful, refetch the needed data.
    if (!isEliminateUserTransactionLoading && eliminateUserReceipt) {
      refetchPMWReader();
      refetchUserTickets();
      refetchRounds();
      refetchPrizes();
    }
  }, [isEliminateUserTransactionLoading, eliminateUserReceipt]);

  useEffect(() => {
    //Whenever rounds is fetched, we change registration status.
    if (isRoundsFetched) {
      const isRoundClosed = (roundsDataReader as Array<boolean>)?.[3];
      if (isRoundClosed) {
        setIsRegistrationOpen(false);
        setUserTickets(0);
      } else {
        setIsRegistrationOpen(true);
      }
    }
  }, [roundsDataReader]);

  useEffect(() => {
    //Whenever we refetch user tickets, we use this to update your tickets section
    if (isUserTicketsFetched) {
      setUserAllTickets(
        getUserTicketsReader?.[0].result as Array<Array<number>>,
      );
      setUserActiveTicketCount(Number(getUserTicketsReader?.[1].result));
    }
  }, [getUserTicketsReader]);

  useEffect(() => {
    //Update max tickets, to ensure input validation.
    setMaxTickets(totalParticipants - currentActiveTicketsCount);
  }, [currentActiveTicketsCount, totalParticipants]);

  useEffect(() => {
    //We keep refetching data to keep the UI updated even if user is idle.
    const interval = setInterval(() => {
      const {
        isEnterGameTransactionLoading,
        isEliminateUserTransactionLoading,
      } = loadingRef.current;

      if (
        !(isEnterGameTransactionLoading || isEliminateUserTransactionLoading)
      ) {
        refetchPMWReader();
        refetchRounds();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (PMWFetched) {
      const [tickets, addresses] = (PMWReader?.[0].result ?? [[], []]) as [
        number[],
        string[],
      ];
      const newParticipantsList = generateTicketMapping(
        [tickets, addresses],
        userAddress,
      );

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
        //This means when enter game is going on or elimination is going on but eliminated participants are 0 (at the moment, not in real).
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
      }, 5500);
    } else {
      const [tickets, addresses] = (PMWReader?.[0].result ?? [[], []]) as [
        number[],
        string[],
      ];
      setcurrentParticipatedList(
        generateTicketMapping([tickets, addresses], userAddress),
      );
    }
  }, [PMWReader?.[0].result]);

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
      return "Sniping 'em...";
    }
    return "Snipe 'em";
  };

  return (
    <div className="min-h-screen p-5 flex flex-col box-border items-center">
      {isRegistrationOpen ? (
        <PMWTitle />
      ) : (
        <div className="grid grid-cols-[32vw_32vw_32vw] max-w-[100vw] items-center">
          <div className="w-full flex justify-center items-center">
            <div className="flex justify-center items-center p-5 h-fit border-4 border-[#FDC62C] rounded-[10px] w-[50%] bg-[#005004] !text-[18px]">
              PLAYERS LEFT: {currentParticipatedList?.length}
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <PMWTitle />
          </div>
          <JackpotDisplay
            daiAmount={
              "daiAmount" in currentRoundPrize
                ? currentRoundPrize.daiAmount
                : "0"
            }
            darkAmount={
              "darkAmount" in currentRoundPrize
                ? currentRoundPrize.darkAmount
                : "0"
            }
          />
        </div>
      )}

      <Header
        activeTicketsCount={userActiveTicketCount || 0}
        currentRoundId={Number(currentRoundId)}
        isAccountConnected={isAccountConnected}
      />
      <WalletGate>
        {isRegistrationOpen ? (
          <EnterGameScreen
            activeTicketsCount={currentActiveTicketsCount}
            totalParticipants={totalParticipants}
            userTickets={userTickets}
            setUserTickets={setUserTickets}
            renderEnterGameButtonState={renderEnterGameButtonState}
            maxTickets={maxTickets}
            isEnterGameTransactionLoading={isEnterGameTransactionLoading}
            enterGame={enterGame}
            userAllTickets={userAllTickets}
            lastRoundsPrizes={lastRoundsPrizes}
            currentParticipatedList={currentParticipatedList}
          />
        ) : (
          <EliminateScreen
            eliminateUser={eliminateUser}
            isEliminateUserTransactionLoading={
              isEliminateUserTransactionLoading
            }
            renderEliminateUserButtonState={renderEliminateUserButtonState}
            currentParticipatedList={currentParticipatedList}
            totalParticipants={totalParticipants}
            userAllTickets={userAllTickets}
            lastRoundsPrizes={lastRoundsPrizes}
            currentRoundPrize={currentRoundPrize}
          />
        )}
      </WalletGate>
    </div>
  );
}
