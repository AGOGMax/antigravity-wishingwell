import GlobeRoulette from "./GlobeDisplay";
import { useMemo, useState } from "react";
import YourTicketsContainer from "./YourTicketsContainer";
import WinnerHistoryTable from "./WinnerHistoryTable";
import useSound from "use-sound";

interface EliminateScreenProps {
  eliminateUser: (ticketCount: number) => void;
  isEliminateUserTransactionLoading: boolean;
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
        darkAmount: string;
        _winner: string;
        winningTicket: number;
      }[]
    | [];
}

export default function EliminateScreen({
  eliminateUser,
  isEliminateUserTransactionLoading,
  currentParticipatedList,
  totalParticipants,
  userAllTickets,
  lastRoundsPrizes,
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
    isEliminateUserTransactionLoading || currentActiveTicketsCount <= 1;
  const isFiveEliminationButtonDisabled =
    isEliminateUserTransactionLoading || currentActiveTicketsCount <= 5;
  const isTenEliminationButtionDisabled =
    isEliminateUserTransactionLoading || currentActiveTicketsCount <= 10;

  const [eliminateCount, setEliminateCount] = useState<Number | null>(null);

  const renderEliminateSingleUserButtonState = () => {
    if (isEliminateUserTransactionLoading && eliminateCount === 1) {
      return `Sniping 1X...`;
    }
    return `Snipe 1X`;
  };

  const renderEliminateFiveUserButtonState = () => {
    if (isEliminateUserTransactionLoading && eliminateCount === 5) {
      return `Sniping 5X...`;
    }
    return `Snipe 5X`;
  };

  const renderEliminateTenUserButtonState = () => {
    if (isEliminateUserTransactionLoading && eliminateCount === 10) {
      return `Sniping 10x...`;
    }
    return `Snipe 10x`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start gap-6 w-full px-4 mt-8">
      <div className="w-full lg:w-[fit-content] flex justify-center">
        <YourTicketsContainer
          userAllTickets={userAllTickets}
          altText="Snipe 'em All And Enter the Next Round!"
        />
      </div>

      <div className="w-full lg:w-2/4 flex flex-col items-center gap-6">
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
          {[1, 5, 10].map((count) => (
            <button
              key={count}
              onClick={() => {
                setEliminateCount(count);
                playBurst();
                eliminateUser(count);
              }}
              disabled={
                count === 1
                  ? isSingleEliminationButtonDisabled
                  : count === 5
                    ? isFiveEliminationButtonDisabled
                    : isTenEliminationButtionDisabled
              }
              className={generateEliminateButtonClass(
                count === 1
                  ? isSingleEliminationButtonDisabled
                  : count === 5
                    ? isFiveEliminationButtonDisabled
                    : isTenEliminationButtionDisabled,
              )}
            >
              {count === 1
                ? renderEliminateSingleUserButtonState()
                : count === 5
                  ? renderEliminateFiveUserButtonState()
                  : renderEliminateTenUserButtonState()}
            </button>
          ))}
        </div>

        <div className="w-full flex justify-center">
          <div
            className="relative w-full max-w-[500px]"
            style={{ aspectRatio: "1/1" }}
          >
            <GlobeRoulette
              numbers={globeNumbers}
              isSpinning={isEliminateUserTransactionLoading}
              eliminations={eliminatedNumbers}
              totalParticipants={totalParticipants}
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
        </div>
      </div>

      {/* <div className="w-full lg:w-1/4"> */}
      <WinnerHistoryTable lastRoundsPrizes={lastRoundsPrizes} />
      {/* </div> */}
    </div>
  );
}
