import { Button, Container, Input, Progress, Table, Text } from "nes-ui-react";
import JackpotDisplay from "../pmwgame/JackpotDisplay";

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
}) {
  function handleChange(value: string) {
    setUserTickets(value === "" ? 0 : Number(value));
  }

  return (
    <>
      <div className="flex flex-row space-between">
        <JackpotDisplay
          daiAmount={Number((currentRoundPrize as any).daiAmount || 0)}
          darkAmount={Number((currentRoundPrize as any).darkAmount || 0)}
        />

        {lastRoundsPrizes.length !== 0 ? (
          <div className="mt-16 w-fit">
            <Table>
              <thead>
                <tr>
                  <th>ROUND ID</th>
                  <th>WINNER</th>
                  <th>AMOUNT WON</th>
                  <th>TICKET NUMBER</th>
                </tr>
              </thead>
              <tbody>
                {lastRoundsPrizes?.map((roundPrize) => {
                  return (
                    <tr key={roundPrize?.roundId}>
                      <td>{roundPrize?.roundId}</td>
                      <td>
                        0x...
                        {String(roundPrize?._winner)?.slice(-3)}
                      </td>
                      <td>{`${Number(roundPrize?.daiAmount)} $DAI + ${Number(roundPrize?.darkAmount)} $DARK`}</td>
                      <td>{Number(roundPrize?.winningTicket)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : null}
      </div>

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

      <div className="mb-8">
        <Container
          align="left"
          title="&lt;Your Tickets&gt;"
          roundedCorners
          alignTitle="center"
          style={{ width: "fit-content" }}
        >
          <div className="flex gap-[10px] mt-5 items-center justify-start">
            {userAllTicketsCount === 0 ? (
              <span className="!text-[16px] !text-pretty">
                {`Hit 'Enter Game' to buy Tickets!`}
              </span>
            ) : (
              (userAllTickets as [number[], boolean[]])?.[0]?.map(
                (ticket, index) => {
                  return (
                    <span
                      key={index}
                      className={`${
                        (userAllTickets as [number[], boolean[]])?.[1]?.[index]
                          ? "text-successgreen"
                          : "text-brred"
                      } !text-[16px]`}
                    >
                      {Number(ticket) + 1}
                    </span>
                  );
                },
              )
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
