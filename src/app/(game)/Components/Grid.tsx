"use client";
import Cell from "./Cell";

interface GridProps {
  currentParticipatedList: Array<Array<string>>;
  userAddress: `0x${string}` | undefined;
}

export default function Grid({
  currentParticipatedList,
  userAddress,
}: GridProps) {
  const activeTicketNumberArray = currentParticipatedList?.[0]?.map(
    (ticket) => Number(ticket) + 1,
  );
  console.log(
    "current aprticipated ticket number array",
    activeTicketNumberArray,
  );
  return (
    <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] md:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))] m-auto w-fit">
      {currentParticipatedList?.[1]?.map((walletAddress, index) => (
        <Cell
          key={index}
          cellNumber={activeTicketNumberArray[index]}
          isUserCell={walletAddress === userAddress}
        />
      ))}
    </div>
  );
}
