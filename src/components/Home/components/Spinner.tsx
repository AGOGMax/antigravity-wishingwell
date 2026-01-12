"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { MotionValue, motion, useTransform } from "framer-motion";
import DynamicNumberCounter from "../../DynamicNumberCounter";
import AutomaticIncreamentalNumberCounter from "../../AutomaticIncreamentalNumberCounter";
import useTimer, { calculateTimeDifference } from "@/hooks/frontend/useTimer";
import { IMAGEKIT_IMAGES } from "@/assets/imageKit";
import { useRestPost } from "@/hooks/useRestClient";
import { getEra } from "@/utils";
import If from "@/components/If";
import useLotteryTimerData from "@/components/useLotteryTimerData";

let globalDelay = 0;

type SpinnerProps = {
  era: "wishwell" | "mining" | "minting" | "journey1" | "journey2" | "journey3";
  stage: 1 | 2 | 3 | 4;
  bonus: number;
  days: number;
  hours: number;
  mins: number;
  secs: number;
};

const styles = {
  "era-styles": {
    parent:
      "absolute flex justify-center items-center top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[470px] w-[2em] z-10 pt-24",
    active: "uppercase text-center text-black font-sans font-black text-3xl",
    passive:
      "uppercase text-center from-white to-[#999999] bg-gradient-to-b text-transparent bg-clip-text font-sans font-black text-3xl whitespace-nowrap",
  },
  "border-styles": {
    era: "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom w-[3px] h-[490px] bg-black",
    stage:
      "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[300px] w-[3px] bg-black z-10",
  },
  "stage-styles": {
    parent:
      "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[180px] w-[2em] z-10",
    active: "uppercase text-center bg-clip-text font-sans font-black text-4xl",
    passive:
      "uppercase text-center from-white to-[#999999] bg-gradient-to-b text-transparent bg-clip-text font-sans font-black text-4xl",
  },
  "timer-styles": {
    parent: "flex-col justify-center items-center gap-0",
    number: "font-sans text-agyellow text-5xl font-extrabold text-center",
    label:
      "uppercase text-sm text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text",
  },
};

function H1({
  className,
  era,
  stage,
  parentClassName,
  isEraLetter,
}: {
  className?: string;
  era: SpinnerProps["era"];
  stage: SpinnerProps["stage"];
  parentClassName: string;
  isEraLetter?: React.ReactNode;
}) {
  const timer = useTimer();
  const currentEra = timer.isMintingActive
    ? (`journey${timer.journey}` as SpinnerProps["era"])
    : timer.era;
  const currentPhase = timer.isMintingActive ? timer.phaseNumber : timer.phase;
  const active = currentEra === era && currentPhase === stage;
  return (
    <>
      {isEraLetter !== undefined ? (
        <div className={twMerge(styles["era-styles"].parent, parentClassName)}>
          {currentEra === era ? (
            <motion.h1
              whileInView={{ color: "black" }}
              initial={{ color: "white" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: globalDelay + 1 }}
              className={twMerge(styles["era-styles"].active)}
            >
              {isEraLetter}
            </motion.h1>
          ) : (
            <h1 className={twMerge(styles["era-styles"].passive)}>
              {isEraLetter}
            </h1>
          )}
        </div>
      ) : (
        <div className={twMerge(parentClassName, styles["stage-styles"].parent)}>
          {active ? (
            <motion.h1
              whileInView={{ color: "black" }}
              initial={{ color: "white" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: globalDelay + 1 }}
              className={twMerge(styles["stage-styles"].active, className)}
            >
              {stage}
            </motion.h1>
          ) : (
            <h1 className={twMerge(styles["stage-styles"].passive, className)}>
              {stage}
            </h1>
          )}
        </div>
      )}
    </>
  );
}

function Border({ eraBorder, className }: { eraBorder: boolean; className: string }) {
  return (
    <div
      className={twMerge(
        eraBorder ? styles["border-styles"].era : styles["border-styles"].stage,
        className,
      )}
    ></div>
  );
}

function decideActiveStageLocation({
  activePhase,
  activeEra,
  mintingActive = false,
}: {
  activePhase: SpinnerProps["stage"];
  activeEra: SpinnerProps["era"];
  mintingActive?: boolean;
}) {
  const eras = {
    era1: mintingActive ? "journey1" : "wishwell",
    era2: mintingActive ? "journey2" : "mining",
    era3: mintingActive ? "journey3" : "minting",
  };
  switch (activeEra) {
    case eras.era1:
      switch (activePhase) {
        case 1: return -100;
        case 2: return -75;
        case 3: return -50;
        default: return 180;
      }
    case eras.era2:
      switch (activePhase) {
        case 1: return -25;
        case 2: return 0;
        case 3: return 25;
        default: return 180;
      }
    case eras.era3:
      switch (activePhase) {
        case 1: return 50;
        case 2: return 75;
        case 3: return 100;
        default: return 180;
      }
    default:
      return 180;
  }
}

function StageHighlighter() {
  const activeState = useTimer();
  const rotation = decideActiveStageLocation({
    activeEra: activeState.isMintingActive
      ? (`journey${activeState.journey}` as any)
      : activeState.era,
    activePhase: activeState.isMintingActive
      ? (activeState.phaseNumber as any)
      : (activeState.phase as any),
    mintingActive: activeState.isMintingActive,
  });

  return (
    <motion.div
      whileInView={{ x: "-50%", y: "-50%", rotate: `${rotation}deg` }}
      initial={{ x: "-50%", y: "-50%", rotate: "180deg" }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[300px] w-[40px] bg-agyellow z-10",
      )}
    >
      <div className="absolute bottom-0 left-[50%] translate-x-[calc(-100%)] origin-bottom rotate-[12.5deg] h-[300px] w-[20px] bg-agyellow z-20"></div>
      <div className="absolute bottom-0 left-[50%] translate-x-[calc(100%_-_20px)] origin-bottom rotate-[-12.5deg] h-[300px] w-[20px] bg-agyellow z-20"></div>
    </motion.div>
  );
}

function EraHighlighter() {
  const timer = useTimer();
  const activeEra = timer.era;
  const eras = {
    era1: activeEra === "minting" && timer.journey === 1 ? true : activeEra === "wishwell" ? true : false,
    era2: activeEra === "minting" && timer.journey === 2 ? true : activeEra === "mining" ? true : false,
    era3: activeEra === "minting" && timer.journey === 3 ? true : false,
  };

  return (
    <motion.div
      whileInView={{
        x: "-50%",
        y: "-50%",
        rotate: eras.era1 ? -75 : eras.era3 ? 75 : eras.era2 ? 0 : -180,
      }}
      initial={{ x: "-50%", y: "-50%", rotate: -180 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[490px] w-[190px] bg-agyellow z-10",
      )}
    >
      <div className="absolute bottom-0 left-[50%] translate-x-[calc(-100%_-_10px)] origin-bottom rotate-[37.5deg] h-[490px] w-[90px] bg-agyellow z-20"></div>
      <div className="absolute bottom-0 left-[50%] translate-x-[calc(11px)] origin-bottom rotate-[-37.5deg] h-[490px] w-[90px] bg-agyellow z-20"></div>
    </motion.div>
  );
}

function Era() {
  return (
    <>
      <H1 era="minting" stage={1} parentClassName="rotate-[-90deg]" isEraLetter="Lottery 1" />
      <Border eraBorder className="rotate-[45deg]" />
      <H1 era="minting" stage={2} parentClassName="rotate-[0deg]" isEraLetter="Lottery 2" />
      <Border eraBorder className="rotate-[135deg]" />
      <H1 era="minting" stage={3} parentClassName="rotate-[90deg]" isEraLetter="Lottery 3" />
      <Border eraBorder className="rotate-[225deg]" />
      <H1
        era="minting"
        stage={4}
        parentClassName="rotate-[180deg]"
        isEraLetter={
          <span className="inline-block scale-y-[-1] scale-x-[-1] from-white to-[#999999] bg-gradient-to-b text-transparent bg-clip-text">
            Minting
          </span>
        }
      />
      <Border eraBorder className="rotate-[315deg]" />
    </>
  );
}

function EraOfEra2() {
  const activePhase = useTimer().phase as SpinnerProps["stage"];
  return (
    <>
      <EraHighlighter />
      <div id="wishwell">
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-96deg]" isEraLetter={"W"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-90deg]" isEraLetter={"i"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-85deg]" isEraLetter={"s"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-78deg]" isEraLetter={"h"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-70deg]" isEraLetter={"w"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-62deg]" isEraLetter={"e"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-56deg]" isEraLetter={"l"} />
        <H1 era="wishwell" stage={activePhase} parentClassName="rotate-[-50deg]" isEraLetter={"l"} />
      </div>
      <Border eraBorder className="rotate-[-37.5deg]" />
      <div id="mining">
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[-12deg]" isEraLetter={"M"} />
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[-6deg]" isEraLetter={"i"} />
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[-1deg]" isEraLetter={"n"} />
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[4deg]" isEraLetter={"i"} />
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[9deg]" isEraLetter={"n"} />
        <H1 era="mining" stage={activePhase} parentClassName="rotate-[16deg]" isEraLetter={"g"} />
      </div>
      <Border eraBorder className="rotate-[37.5deg]" />
      <div id="minting">
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[61deg]" isEraLetter={"M"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[67deg]" isEraLetter={"i"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[73deg]" isEraLetter={"n"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[79deg]" isEraLetter={"t"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[84deg]" isEraLetter={"i"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[89deg]" isEraLetter={"n"} />
        <H1 era="minting" stage={activePhase} parentClassName="rotate-[96deg]" isEraLetter={"g"} />
      </div>
    </>
  );
}

function Pointer() {
  const activeState = useTimer();
  const rotation = decideActiveStageLocation({
    activeEra: activeState.isMintingActive
      ? (`journey${activeState.journey}` as any)
      : activeState.era,
    activePhase: activeState.isMintingActive
      ? (activeState.phaseNumber as any)
      : (activeState.phase as any),
    mintingActive: activeState.isMintingActive,
  });
  return (
    <motion.div
      animate={{ rotate: `${rotation}deg` }}
      whileInView={{ x: "-50%", y: "-50%", rotate: `${rotation}deg` }}
      initial={{ x: "-50%", y: "-50%", rotate: "-180deg" }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[100px] w-[50px] z-10 pt-0",
      )}
    >
      <Image
        src={IMAGEKIT_IMAGES.COUNTER_POINTER}
        width={50}
        height={50}
        alt="Counter Pointer"
      />
    </motion.div>
  );
}

function Timer() {
  const timer = useTimer();
  const lotteryTimerData = useLotteryTimerData();

  let timerText = "";
  // @ts-ignore
  let timerTimestamp = timer?.nextJourneyTimeStamp;

  if (timer?.phaseNumber === 1) {
    timerText = "TIL Minting Ends";
    // @ts-ignore
    timerTimestamp = timer?.nextPhaseStartTimestamp ?? 0;
  } else if (timer?.phaseNumber === 2) {
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "3") {
      timerText = "TIL Lottery 1";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "1") {
      timerText = "TIL Lottery 2";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "2") {
      timerText = "TIL Lottery 3";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
    }
  } else {
    timerText = "TIL Next Journey";
    // @ts-ignore
    timerTimestamp = timer?.nextJourneyTimeStamp;
  }

  const newTimer = {
    ...timer,
    ...(timerTimestamp
      ? calculateTimeDifference(new Date(timerTimestamp).getTime())
      : { days: 0, hours: 0, mins: 0, secs: 0 }),
  };

  return (
    <div className="absolute flex flex-col justify-center items-center gap-2 z-[100] w-[400px] h-[200px] translate-y-[10%]">
      <div className="flex gap-2">
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter count={newTimer.days} setCount={() => {}} modulo={100000000} />
          </div>
          <div className={styles["timer-styles"].label}>Days</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter count={newTimer.hours} setCount={() => {}} modulo={24} />
          </div>
          <div className={styles["timer-styles"].label}>Hours</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter count={newTimer.mins} setCount={() => {}} modulo={60} />
          </div>
          <div className={styles["timer-styles"].label}>Mins</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter count={newTimer.secs} setCount={() => {}} modulo={60} />
          </div>
          <div className={styles["timer-styles"].label}>Secs</div>
        </div>
      </div>
      <div style={{ fontSize: "1.7rem", fontWeight: 900 }} className="font-sans text-agyellow text-2xl font-bold text-center uppercase tracking-widest">
        {timerText}
      </div>
    </div>
  );
}

const ArcSector = ({ fromDeg, toDeg, fromColor = "#3C00DC", toColor = "#FF5001", className = "" }: any) => {
  return (
    <div className={`absolute w-full h-full rounded-full z-0 ${className}`}>
      <div
        className="absolute w-full h-full rounded-full"
        style={{
          background: `conic-gradient(from ${fromDeg}deg, ${fromColor} 0deg, ${toColor} ${toDeg - fromDeg}deg, transparent ${toDeg - fromDeg}deg, transparent 360deg)`,
          zIndex: 0,
        }}
      />
    </div>
  );
};

const decideArcSectorAngles = (timer: any, lotteryTimerData: any) => {
  if (timer?.phaseNumber === 1) {
    return { startAngle: -135, endAngle: 225 };
  } else if (timer?.phaseNumber === 2) {
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "3") return { startAngle: 223, endAngle: 313 };
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "1") return { startAngle: -47, endAngle: 47 };
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "2") return { startAngle: 47, endAngle: 137 };
  }
  return { startAngle: 47, endAngle: 137 };
};

export default function Spinner({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const timer = useTimer();
  const lotteryTimerData = useLotteryTimerData();
  const opacity = useTransform(scrollYProgress, [1, 0], [0, 1]);

  const arcSectorAngles = useMemo(
    () => decideArcSectorAngles(timer, lotteryTimerData),
    [timer, lotteryTimerData],
  );

  return (
    <motion.div
      style={{ opacity }}
      className="absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-60%] md:translate-y-[-37%] w-[500px] h-[500px] bg-black rounded-full flex justify-center items-center scale-[0.7] sm:scale-[0.8] overflow-hidden z-[100]"
    >
      <div className="relative w-[470px] h-[470px] bg-[radial-gradient(circle_at_center,#B7A4EA,#1C0068_65%)] rounded-full flex justify-center items-center overflow-hidden">
        <If condition={timer.era !== "minting"} then={<EraOfEra2 />} else={<Era />} />
        <ArcSector fromDeg={arcSectorAngles?.startAngle} toDeg={arcSectorAngles?.endAngle} />
        <div className="relative w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,#B7A4EA,#1C0068_65%)] rounded-full border-[10px] border-agblack flex justify-center items-center overflow-hidden z-10">
          <Timer />
        </div>
      </div>
    </motion.div>
  );
}
