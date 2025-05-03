interface historyTableProps {
  lastRoundsPrizes:
    | {
        roundId: number;
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
    <div className="w-fit rounded-2xl border-[4px] border-[#FDC62C]">
      <table className="table w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="text-center bg-[#810031] p-3 border-b-[4px] border-b-[#FDC62C] border-l-[2px] border-l-[#9f0d39] first:rounded-tl-2xl last:rounded-tr-2xl">
              ROUND
            </th>
            <th className="text-center bg-[#810031] p-3 border-b-[4px] border-b-[#FDC62C] border-l-[2px] border-l-[#9f0d39]">
              WINNER
            </th>
            <th className="text-center bg-[#810031] p-3 border-b-[4px] border-b-[#FDC62C] border-l-[2px] border-l-[#9f0d39]">
              TICKET#
            </th>
            <th className="text-center bg-[#810031] p-3 border-b-[4px] border-b-[#FDC62C] border-l-[2px] border-l-[#9f0d39]">
              AMOUNT WON
            </th>
          </tr>
        </thead>
        <tbody className="table-row-group">
          {lastRoundsPrizes?.map((roundPrize, idx) => {
            return (
              <tr
                key={roundPrize?.roundId}
                className={`${
                  idx % 2 === 0 ? "bg-[#95002b]" : "bg-[#7a001f]"
                } hover:bg-yellow-100 hover:text-[#7a001f]`}
              >
                <td className="text-center p-2 border-l-2 border-l-[#3f0009] border-b-2 border-b-[#ca0d2c]">
                  {roundPrize?.roundId}
                </td>
                <td className="text-center p-2 border-l-2 border-l-[#3f0009] border-b-2 border-b-[#ca0d2c]">
                  .{String(roundPrize?._winner)?.slice(-4)}
                </td>
                <td
                  style={{ fontSize: "20px" }}
                  className=" text-[#f7da06] text-center p-2 border-l-2 border-l-[#3f0009] border-b-2 border-b-[#ca0d2c]"
                >
                  {Number(roundPrize?.winningTicket)}
                </td>
                <td className="text-center p-2 border-l-2 border-l-[#3f0009] border-b-2 border-b-[#ca0d2c]">
                  <span className="text-[#FF69B4]">
                    {roundPrize.darkAmount}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : null;
}
