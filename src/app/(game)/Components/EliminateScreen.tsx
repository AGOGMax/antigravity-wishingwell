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

  const soundMap = {
    1: "/burstSounds/snipe1.wav",
    5: "/burstSounds/snipe5.mp3",
    10: "/burstSounds/snipe10.mp3",
    20: "/burstSounds/snipe20.mp3",
  };

  const [playSnipe1] = useSound(soundMap[1]);
  const [playSnipe5] = useSound(soundMap[5]);
  const [playSnipe10] = useSound(soundMap[10]);
  const [playSnipe20] = useSound(soundMap[20]);

  const soundFunctionMap = {
    1: playSnipe1,
    5: playSnipe5,
    10: playSnipe10,
    20: playSnipe20,
  };

  const generateEliminateButtonClass = (isDisabled: boolean) => {
    return `p-4 !text-[16px] rounded-[10px] border-[4px] border-[#FDC62C] 
    ${isDisabled ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-[#003678] to-[#0087e7]"}
  `;
  };

  const [eliminateCount, setEliminateCount] = useState<Number | null>(null);

  const eliminationOptions = [
    {
      count: 1,
      isDisabled:
        isEliminateUserTransactionLoading || currentActiveTicketsCount <= 1,
      renderLabel: () =>
        isEliminateUserTransactionLoading && eliminateCount === 1
          ? "Sniping 1X..."
          : "Snipe 1X",
    },
    {
      count: 5,
      isDisabled:
        isEliminateUserTransactionLoading || currentActiveTicketsCount <= 5,
      renderLabel: () =>
        isEliminateUserTransactionLoading && eliminateCount === 5
          ? "Sniping 5X..."
          : "Snipe 5X",
    },
    {
      count: 10,
      isDisabled:
        isEliminateUserTransactionLoading || currentActiveTicketsCount <= 10,
      renderLabel: () =>
        isEliminateUserTransactionLoading && eliminateCount === 10
          ? "Sniping 10X..."
          : "Snipe 10X",
    },
    {
      count: 20,
      isDisabled:
        isEliminateUserTransactionLoading || currentActiveTicketsCount <= 20,
      renderLabel: () =>
        isEliminateUserTransactionLoading && eliminateCount === 20
          ? "Sniping 20X..."
          : "Snipe 20X",
    },
  ];

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
          {eliminationOptions.map(({ count, isDisabled, renderLabel }) => (
            <button
              key={count}
              onClick={() => {
                setEliminateCount(count);
                soundFunctionMap[count as 1 | 5 | 10 | 20]?.();
                eliminateUser(count);
              }}
              disabled={isDisabled}
              className={generateEliminateButtonClass(isDisabled)}
            >
              {renderLabel()}
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
