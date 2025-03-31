"use client";
import Cell from "./Cell";

interface GridProps {
  totalParticipants: number;
}

export default function Grid({ totalParticipants }: GridProps) {
  return (
    <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] grid-rows-[repeat(41,minmax(0,1fr))] md:grid-cols-[repeat(15,minmax(0,1fr))] md:grid-rows-[repeat(25,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))] lg:grid-rows-[repeat(20,minmax(0,1fr))] m-auto w-fit">
      {Array.from({ length: totalParticipants }).map((_, index) => (
        <Cell key={index} cellNumber={index + 1} />
      ))}
    </div>
  );
}
