import { Button, Text } from "nes-ui-react";
import GlobeRoulette from "./GlobeDisplay";
import { useMemo } from "react";
import YourTicketsContainer from "./YourTicketsContainer";
import WinnerHistoryTable from "./WinnerHistoryTable";
import useSound from "use-sound";

interface EliminateScreenProps {
  eliminateUser: () => void;
  isEliminateUserTransactionLoading: boolean;
  renderEliminateUserButtonState: Function;
  currentParticipatedList: {
    ticketNumber: number;
    walletAddress: string;
    isUserCell: boolean;
    isBurst: boolean;
  }[];
  currentActiveTicketsCount: number;
  totalParticipants: number;
  userAllTicketsCount: number;
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
  currentActiveTicketsCount,
  totalParticipants,
  userAllTickets,
  userAllTicketsCount,
  lastRoundsPrizes,
  currentRoundPrize,
}: EliminateScreenProps) {
  const [globeNumbers, eliminatedNumbers] = useMemo(() => {
    const currentActiveTickets = currentParticipatedList
      .filter((ticket) => !ticket.isBurst)
      .map((ticket) => ticket.ticketNumber);
    const eliminatedNumbers = currentParticipatedList
      .filter((ticket) => ticket.isBurst)
      .map((ticket) => ticket.ticketNumber);
    return [currentActiveTickets, eliminatedNumbers];
  }, [currentParticipatedList]);

  const burstSound = "/burstSound.wav";
  const [playBurst] = useSound(burstSound);
  return (
    <div className="flex flex-row items-start gap-x-8 mt-8 justify-between w-full">
      <YourTicketsContainer
        userAllTickets={userAllTickets}
        userAllTicketsCount={userAllTicketsCount}
      />
      <div className="flex flex-col items-center justify-center mt-[16px] gap-[16px] w-full">
        <Button
          color="primary"
          onClick={() => (playBurst(), eliminateUser())}
          disabled={isEliminateUserTransactionLoading}
          size="large"
        >
          <Text size="large">{renderEliminateUserButtonState()}</Text>
        </Button>
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
