import { Button, Text } from "nes-ui-react";
import Grid from "./Grid";
import GlobeRoulette from "./GlobeDisplay";
import { useMemo } from "react";

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
}

export default function EliminateScreen({
  eliminateUser,
  isEliminateUserTransactionLoading,
  renderEliminateUserButtonState,
  currentParticipatedList,
  currentActiveTicketsCount,
  totalParticipants,
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

  return (
    <div className="flex flex-col items-center justify-center mt-[16px] gap-[16px] w-full">
      <Button
        color="primary"
        onClick={eliminateUser}
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
      <Grid
        currentParticipatedList={currentParticipatedList}
        activeTicketCount={currentActiveTicketsCount}
      />
    </div>
  );
}
