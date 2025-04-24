import { Table } from "nes-ui-react";

interface historyTableProps {
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

export default function WinnerHistoryTable({
  lastRoundsPrizes,
}: historyTableProps) {
  return lastRoundsPrizes.length !== 0 ? (
    <div className="w-fit">
      <Table>
        <thead>
          <tr>
            <th className="text-center">ROUND</th>
            <th className="text-center">WINNER</th>
            <th className="text-center">TICKET#</th>
            <th className="text-center">AMOUNT WON</th>
          </tr>
        </thead>
        <tbody>
          {lastRoundsPrizes?.map((roundPrize) => {
            return (
              <tr key={roundPrize?.roundId}>
                <td className="text-center">{roundPrize?.roundId}</td>
                <td className="text-center">
                  .{String(roundPrize?._winner)?.slice(-4)}
                </td>
                {/* <td>{`${Number(roundPrize?.daiAmount)} $DAI + ${Number(roundPrize?.darkAmount)} $DARK`}</td> */}
                <td
                  style={{ fontSize: "20px", color: "successgreen" }}
                  className=" !text-successgreen text-center"
                >
                  {Number(roundPrize?.winningTicket)}
                </td>
                <td className="text-center">
                  <span className="text-[#E49006]">
                    {roundPrize?.daiAmount}
                  </span>{" "}
                  +{" "}
                  <span className="text-[#4A1B78]">
                    {roundPrize.darkAmount}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  ) : null;
}
