import { Button, Text } from "nes-ui-react";
import Grid from "./Grid";

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
  userAllTickets: (number[] | boolean[])[];
  userAllTicketsCount: number;
  lastRoundsPrizes:
    | {
        roundId: number;
        daiAmount: string;
        darkAmount: string;
        _winner: string;
        winningTicket: number;
      }[]
    | [];
}

export default function EliminateScreen({
  eliminateUser,
  isEliminateUserTransactionLoading,
  renderEliminateUserButtonState,
  currentParticipatedList,
  currentActiveTicketsCount,
  userAllTickets,
  userAllTicketsCount,
  lastRoundsPrizes,
}: EliminateScreenProps) {
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
      <Grid
        currentParticipatedList={currentParticipatedList}
        activeTicketCount={currentActiveTicketsCount}
      />
    </div>
  );
}
