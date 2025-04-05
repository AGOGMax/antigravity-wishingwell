"use client";
import Cell from "./Cell";

interface GridProps {
  currentParticipatedList: Array<Array<string>>;
}

export default function Grid({ currentParticipatedList }: GridProps) {
  return (
    <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] md:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))] m-auto w-fit">
      {currentParticipatedList?.map((participant, index) => (
        <Cell
          key={index}
          cellNumber={participant?.ticketNumber}
          isUserCell={participant?.isUserCell}
          isBurst={participant?.isBurst}
        />
      ))}
    </div>
  );
}
