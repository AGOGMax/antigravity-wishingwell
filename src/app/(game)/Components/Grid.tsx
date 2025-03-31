"use client";
import Cell from "./Cell";

interface GridProps {
  currentParticipated: number;
}

export default function Grid({ currentParticipated }: GridProps) {
  return (
    <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] md:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))] m-auto w-fit">
      {Array.from({ length: currentParticipated }).map((_, index) => (
        <Cell key={index} cellNumber={index + 1} />
      ))}
    </div>
  );
}
