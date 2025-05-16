"use client";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";
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
import toast, { ToastOptions } from "react-hot-toast";
import CongratulationsPage from "../Components/CongratulationsPage";
import useWinner from "@/hooks/sc-fns/useWinner";
import Confetti from "react-confetti";

const TOAST_SETTINGS: ToastOptions = {
  duration: 20000,
  position: "top-center",
  style: {
    fontSize: "16px",
    width: "auto",
    maxWidth: "90vw",
    padding: "12px 16px",
  },
  icon: "💀",
};

type PrizeArrays = [bigint[], boolean[], string[], bigint[]];

export default function PMWGame() {
  const account = useAccount();
  const userAddress = account?.address as `0x${string}`;
  const isAccountConnected = account.isConnected;

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true); //Used to render enter game or eliminate screen.
  const [isCongratulating, setIsCongratulating] = useState(false);
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
  const [currentRoundId, setCurrentRoundId] = useState(
    (PMWReader?.[2].result as bigint) ?? 0,
  ); //Round ID which is going on.

  const { roundsDataReader, isRoundsFetched, refetchRounds } =
    useCurrentRound(currentRoundId); //Rounds Data Reader (Used to change enter/eliminate screen)
  const { prizesReader, isPrizesFetched, refetchPrizes } = usePrizes(); //Used to fetch current round prize, and previous rounds prizes.
  const { currentRoundPrize, lastRoundsPrizes } = useMemo(() => {
    return extractRoundsPrizes(
      //Util to convert into usable data
      prizesReader as PrizeArrays,
    );
  }, [prizesReader]);

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
    enterGameReceipt,
  } = useEnterGame(BigInt(userTickets));

  const {
    // Eliminate User Hook
    eliminateUser,
    transactionLoading: isEliminateUserTransactionLoading,
    eliminateUserReceipt,
  } = useEliminateUser();

  const { winnerReader = {}, refetchWinner } = useWinner(
    BigInt(Number(currentRoundId) - 1),
  );

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
      const newRoundId = (PMWReader?.[2].result as bigint) ?? 0;

      if (currentRoundId != BigInt(0) && newRoundId > currentRoundId) {
        refetchWinner();
        setIsCongratulating(true);
        setTimeout(() => {
          setIsCongratulating(false);
          setCurrentRoundId(newRoundId);
        }, 30000);
      } else {
        setCurrentRoundId((PMWReader?.[2].result as bigint) ?? 0);
      }
      const eliminatedParticipants = currentParticipatedList
        ?.filter(
          (participant) =>
            !newParticipantsList.some(
              (newParticipant) =>
                newParticipant.ticketNumber === participant.ticketNumber,
            ),
        )
        .map((eliminatedParticipant) => eliminatedParticipant.ticketNumber);

      if (eliminatedParticipants?.length === 0) {
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
      if (
        currentParticipatedList?.length !== eliminatedParticipants?.length &&
        isAccountConnected
      ) {
        toast(`Eliminated ${eliminatedParticipants}`, TOAST_SETTINGS);
      }

      setTimeout(() => {
        setcurrentParticipatedList(newParticipantsList);
      }, 2000);
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
    if (isEnterGameTransactionLoading) {
      return "Entering Game...";
    }
    return "Enter Game";
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 mx-auto box-border max-w-[1800px] flex flex-col items-center gap-6">
      {isRegistrationOpen || !isAccountConnected ? (
        <PMWTitle />
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-4 max-w-[1800px] mx-auto">
          <div className="flex justify-center items-center">
            <div className="p-4 border-4 border-yellow-400 rounded-lg bg-[#00224E] text-center w-full max-w-xs">
              <p
                className="text-lg font-bold text-[gold] mb-0"
                style={{ fontSize: "1.5rem" }}
              >
                PLAYERS LEFT: {currentParticipatedList?.length}
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <PMWTitle isTrioLayout />
          </div>

          <div className="flex justify-center items-center">
            <JackpotDisplay
              darkAmount={
                "darkAmount" in currentRoundPrize
                  ? currentRoundPrize.darkAmount
                  : "0"
              }
            />
          </div>
        </div>
      )}

      <Header
        activeTicketsCount={userActiveTicketCount || 0}
        currentRoundId={Number(currentRoundId)}
        isAccountConnected={isAccountConnected}
      />
      <WalletGate>
        {isCongratulating ? (
          <>
            <Confetti width={window.innerWidth} height={window.innerHeight} />

            <CongratulationsPage
              winnerDetails={
                winnerReader as [bigint, string, bigint, bigint, bigint]
              }
            />
          </>
        ) : isRegistrationOpen ? (
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
            currentParticipatedList={currentParticipatedList}
            totalParticipants={totalParticipants}
            userAllTickets={userAllTickets}
            lastRoundsPrizes={lastRoundsPrizes}
          />
        )}
      </WalletGate>
    </div>
  );
}
