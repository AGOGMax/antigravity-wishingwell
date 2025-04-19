"use client";
import Cell from "./Cell";

interface GridProps {
  currentParticipatedList: {
    ticketNumber: number;
    walletAddress: string;
    isUserCell: boolean;
    isBurst: boolean;
  }[];
  activeTicketCount: number;
}

export default function Grid({
  currentParticipatedList,
  activeTicketCount,
}: GridProps) {
  return (
    <div className="grid grid-cols-10  gap-0">
      {currentParticipatedList?.map((participant, index) => (
        <Cell
          key={index}
          cellNumber={participant?.ticketNumber}
          isUserCell={participant?.isUserCell}
          isBurst={participant?.isBurst}
          activeTicketCount={activeTicketCount}
        />
      ))}
    </div>
  );
}
