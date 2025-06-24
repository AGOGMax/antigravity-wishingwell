// Tools Websit
"use client";

import { cn } from "@/lib/tailwindUtils";
import RollingCounter from "../animation/RollingCounter";
import useCountdownTimer from "../../hooks/useCountdownTimer";
import { useEffect } from "react";

function NumberAndLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-[4px] px-[8px]">
      <RollingCounter num={number} className="text-[40px] leading-[40px]" />
      <div>{label}</div>
    </div>
  );
}

export default function Timer({
  label,
  timestamp,
  onTimerEnd,
}: {
  label: string;
  timestamp: number;
  onTimerEnd?: () => void;
}) {
  const time = useCountdownTimer(timestamp, onTimerEnd);
  useEffect(() => {
    time[1](timestamp);
  }, [timestamp, time]);

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-[8px]",
        "text-agwhite uppercase font-sans tracking-widest text-[12px] lg:text-[16px] font-extrabold",
        "w-full",
      )}
    >
      <div>{label}</div>
      <div className="grid grid-flow-col gap-[8px]">
        <NumberAndLabel number={time[0].days} label="Days" />
        <div className="h-full w-[1px] bg-agwhite"></div>
        <NumberAndLabel number={time[0].hours} label="Hours" />
        <div className="h-full w-[1px] bg-agwhite"></div>
        <NumberAndLabel number={time[0].minutes} label="Minutes" />
        <div className="h-full w-[1px] bg-agwhite"></div>
        <NumberAndLabel number={time[0].seconds} label="Seconds" />
      </div>
    </div>
  );
}
