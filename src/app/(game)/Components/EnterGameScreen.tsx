import { Button, Input, Progress, Text } from "nes-ui-react";
import YourTicketsContainer from "./YourTicketsContainer";
import WinnerHistoryTable from "./WinnerHistoryTable";
import GlobeRoulette from "./GlobeDisplay";
import { useMemo } from "react";

interface EnterGameScreenProps {
  activeTicketsCount: number;
  totalParticipants: number;
  userTickets: number;
  setUserTickets: Function;
  renderEnterGameButtonState: Function;
  maxTickets: number;
  isEnterGameTransactionLoading: boolean;
  enterGame: () => void;
  userAllTickets: (boolean[] | number[])[];
  lastRoundsPrizes:
    | {
        roundId: number;
        darkAmount: string;
        _winner: string;
        winningTicket: number;
      }[]
    | [];
  currentParticipatedList: {
    ticketNumber: number;
    walletAddress: string;
    isUserCell: boolean;
    isBurst: boolean;
  }[];
}

export default function EnterGameScreen({
  activeTicketsCount,
  totalParticipants,
  userTickets,
  setUserTickets,
  renderEnterGameButtonState,
  maxTickets,
  isEnterGameTransactionLoading,
  enterGame,
  userAllTickets,
  lastRoundsPrizes,
  currentParticipatedList,
}: EnterGameScreenProps) {
  function handleChange(value: string) {
    setUserTickets(value === "" ? 0 : Number(value));
  }

  const globeNumbers = useMemo(() => {
    return currentParticipatedList
      .filter((ticket) => !ticket.isBurst)
      .map((ticket) => ticket.ticketNumber);
  }, [currentParticipatedList]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start gap-4 lg:gap-6 w-full px-4 mt-8">
      <div className="w-full lg:w-[fit-content] flex justify-center">
        <YourTicketsContainer
          userAllTickets={userAllTickets}
          altText="Hit 'Enter Game' to buy Tickets!"
        />
      </div>
      <div className="w-full lg:w-2/4 flex flex-col items-center gap-6">
        <div className="text-center w-full">
          <p className="text-white mb-2">
            {`${activeTicketsCount} out of ${totalParticipants}`}
          </p>
          <div className="w-full lg:w-[90%] mx-auto">
            <Progress
              value={activeTicketsCount}
              max={totalParticipants}
              color="pattern"
              className="w-full h-3"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <div className="w-full sm:w-auto min-w-[200px]">
            <Input
              type="number"
              name="userTickets"
              value={userTickets.toString()}
              label="Number Of Tickets: "
              className="w-full"
              onChange={handleChange}
              color={
                userTickets < 0 || userTickets > maxTickets ? "error" : "none"
              }
            />
            <p className="text-white text-sm mt-1">Max Tickets: {maxTickets}</p>
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
        </div>

        <div className="w-full flex justify-center mt-4">
          <div
            className="relative w-full max-w-[500px]"
            style={{ aspectRatio: "1/1" }}
          >
            <GlobeRoulette
              numbers={globeNumbers}
              isSpinning={false}
              totalParticipants={totalParticipants}
              eliminations={[]}
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
        </div>
      </div>
      <WinnerHistoryTable lastRoundsPrizes={lastRoundsPrizes} />
    </div>
  );
}
