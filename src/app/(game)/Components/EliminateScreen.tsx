import GlobeRoulette from "./GlobeDisplay";
import { useMemo } from "react";
import YourTicketsContainer from "./YourTicketsContainer";
import WinnerHistoryTable from "./WinnerHistoryTable";
import useSound from "use-sound";

interface EliminateScreenProps {
  eliminateUser: (ticketCount: number) => void;
  isEliminateUserTransactionLoading: boolean;
  renderEliminateUserButtonState: Function;
  currentParticipatedList: {
    ticketNumber: number;
    walletAddress: string;
    isUserCell: boolean;
    isBurst: boolean;
  }[];
  totalParticipants: number;
  userAllTickets: (boolean[] | number[])[];
  lastRoundsPrizes:
    | {
        roundId: number;
        daiAmount: string;
        darkAmount: string;
        _winner: string;
        winningTicket: number;
      }[]
    | [];
  currentRoundPrize:
    | {
        daiAmount: string;
        darkAmount: string;
      }
    | {};
}

export default function EliminateScreen({
  eliminateUser,
  isEliminateUserTransactionLoading,
  renderEliminateUserButtonState,
  currentParticipatedList,
  totalParticipants,
  userAllTickets,
  lastRoundsPrizes,
  currentRoundPrize,
}: EliminateScreenProps) {
  const [globeNumbers, eliminatedNumbers, currentActiveTicketsCount] =
    useMemo(() => {
      const currentActiveTickets = currentParticipatedList
        .filter((ticket) => !ticket.isBurst)
        .map((ticket) => ticket.ticketNumber);
      const eliminatedNumbers = currentParticipatedList
        .filter((ticket) => ticket.isBurst)
        .map((ticket) => ticket.ticketNumber);
      return [
        currentActiveTickets,
        eliminatedNumbers,
        currentParticipatedList?.length || 0,
      ];
    }, [currentParticipatedList]);

  const burstSound = "/burstSound.wav";
  const [playBurst] = useSound(burstSound);

  const generateEliminateButtonClass = (isDisabled: boolean) => {
    return `p-4 !text-[16px] rounded-[10px] border-[4px] border-[#FDC62C] 
    ${isDisabled ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-[#003678] to-[#0087e7]"}
  `;
  };

  const isSingleEliminationButtonDisabled =
    isEliminateUserTransactionLoading || currentActiveTicketsCount < 1;
  const isFiveEliminationButtonDisabled =
    isEliminateUserTransactionLoading || currentActiveTicketsCount < 5;
  const isTenEliminationButtionDisabled =
    isEliminateUserTransactionLoading || currentActiveTicketsCount < 10;

  return (
    <div className="flex flex-row items-start gap-x-8 mt-8 justify-between w-full">
      <YourTicketsContainer userAllTickets={userAllTickets} />
      <div className="flex flex-col items-center justify-center mt-[16px] gap-[16px] w-full">
        <div className="flex flex-row justify-around w-full">
          <button
            onClick={() => (playBurst(), eliminateUser(1))}
            disabled={isSingleEliminationButtonDisabled}
            className={generateEliminateButtonClass(
              isSingleEliminationButtonDisabled,
            )}
          >
            {renderEliminateUserButtonState("1X")}
          </button>
          <button
            onClick={() => (playBurst(), eliminateUser(5))}
            disabled={isFiveEliminationButtonDisabled}
            className={generateEliminateButtonClass(
              isFiveEliminationButtonDisabled,
            )}
          >
            {renderEliminateUserButtonState("5X")}
          </button>
          <button
            onClick={() => (playBurst(), eliminateUser(10))}
            disabled={isTenEliminationButtionDisabled}
            className={generateEliminateButtonClass(
              isTenEliminationButtionDisabled,
            )}
          >
            {renderEliminateUserButtonState("10X")}
          </button>
        </div>
        <GlobeRoulette
          numbers={globeNumbers}
          isSpinning={isEliminateUserTransactionLoading}
          eliminations={eliminatedNumbers}
          totalParticipants={totalParticipants}
        />
      </div>
      <WinnerHistoryTable lastRoundsPrizes={lastRoundsPrizes} />
    </div>
  );
}
