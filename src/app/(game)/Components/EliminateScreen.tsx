import { Button, Text } from "nes-ui-react";
import Grid from "./Grid";

export default function EliminateScreen({
  eliminateUser,
  isEliminateUserTransactionLoading,
  renderEliminateUserButtonState,
  currentParticipatedList,
  currentActiveTicketsCount,
  userAllTickets,
  userAllTicketsCount,
  lastRoundsPrizes,
}) {
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
