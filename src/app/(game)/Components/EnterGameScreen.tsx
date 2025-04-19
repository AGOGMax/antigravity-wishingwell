import { Button, Input, Progress, Text } from "nes-ui-react";
import JackpotDisplay from "../pmwgame/JackpotDisplay";
import YourTicketsContainer from "./YourTicketsContainer";
import WinnerHistoryTable from "./WinnerHistoryTable";

type PrizeType = {
  roundId: Number;
  daiAmount: bigint;
  darkAmount: bigint;
};

interface EnterGameScreenProps {
  currentRoundPrize: PrizeType | {};
  activeTicketsCount: number;
  totalParticipants: number;
  userTickets: number;
  setUserTickets: Function;
  renderEnterGameButtonState: Function;
  maxTickets: number;
  isEnterGameTransactionLoading: boolean;
  enterGame: () => void;
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
  currentRoundId: bigint;
  isRegistrationOpen: boolean;
}

export default function EnterGameScreen({
  currentRoundPrize,
  activeTicketsCount,
  totalParticipants,
  userTickets,
  setUserTickets,
  renderEnterGameButtonState,
  maxTickets,
  isEnterGameTransactionLoading,
  enterGame,
  userAllTickets,
  userAllTicketsCount,
  lastRoundsPrizes,
  currentRoundId,
  isRegistrationOpen,
}: EnterGameScreenProps) {
  function handleChange(value: string) {
    setUserTickets(value === "" ? 0 : Number(value));
  }

  return (
    <div className="flex flex-row items-start gap-x-8 mt-8">
      <YourTicketsContainer
        userAllTickets={userAllTickets}
        userAllTicketsCount={userAllTicketsCount}
      />
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center mb-12">
          <Text>
            {`${activeTicketsCount} out of 
            ${totalParticipants}...`}
          </Text>
          <Progress
            value={activeTicketsCount}
            max={totalParticipants}
            color="pattern"
            style={{ width: "40vw" }}
          />
        </div>

        <div className="flex flex-row items-center gap-8 my-8">
          <div className="flex flex-col">
            <Input
              type="number"
              name="userTickets"
              value={userTickets.toString()}
              label="Number Of Tickets: "
              style={{ height: "32px", fontSize: "16px" }}
              onChange={handleChange}
              color={
                userTickets < 0 || userTickets > maxTickets ? "error" : "none"
              }
            />
            <Text size="medium" color="warning">
              Max Tickets: {maxTickets}
            </Text>
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
      </div>
      <WinnerHistoryTable lastRoundsPrizes={lastRoundsPrizes} />
    </div>
  );
}
