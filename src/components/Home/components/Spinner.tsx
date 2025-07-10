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

type ArcSectorProps = {
  fromDeg: number;
  toDeg: number;
  fromColor?: string;
  toColor?: string;
  className?: string;
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
    ? `journey${timer.journey}`
    : timer.era;
  const currentPhase = timer.isMintingActive ? timer.phaseNumber : timer.phase;
  const active = currentEra === era && currentPhase === stage;
  return (
    <>
      {isEraLetter !== undefined ? (
        <div className={twMerge(styles["era-styles"].parent, parentClassName)}>
          {currentEra === era ? (
            <motion.h1
              whileInView={{
                color: "black",
              }}
              initial={{
                color: "white",
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: globalDelay + 1,
              }}
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
        <div
          className={twMerge(parentClassName, styles["stage-styles"].parent)}
        >
          {active ? (
            <motion.h1
              whileInView={{
                color: "black",
              }}
              initial={{
                color: "white",
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: globalDelay + 1,
              }}
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

function Border({
  eraBorder,
  className,
}: {
  eraBorder: boolean;
  className: string;
}) {
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
        case 1:
          return -100;
        case 2:
          return -75;
        case 3:
          return -50;
        default:
          return 180;
      }
    case eras.era2:
      switch (activePhase) {
        case 1:
          return -25;
        case 2:
          return 0;
        case 3:
          return 25;
        default:
          return 180;
      }
    case eras.era3:
      switch (activePhase) {
        case 1:
          return 50;
        case 2:
          return 75;
        case 3:
          return 100;
        default:
          return 180;
      }
    default:
      return 180;
  }
}

function StageHighlighter() {
  const activeState = useTimer();
  const rotation = decideActiveStageLocation({
    activeEra: activeState.isMintingActive
      ? `journey${activeState.journey as 1 | 2 | 3}`
      : activeState.era,
    activePhase: activeState.isMintingActive
      ? (activeState.phaseNumber as 1 | 2 | 3)
      : activeState.phase,
    mintingActive: activeState.isMintingActive,
  });

  return (
    <motion.div
      whileInView={{
        x: "-50%",
        y: "-50%",
        rotate: `${rotation}deg`,
      }}
      initial={{
        x: "-50%",
        y: "-50%",
        rotate: "180deg",
      }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[300px] w-[40px] bg-agyellow z-10",
        `rotate-[${rotation}deg]`,
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
    era1:
      activeEra === "minting" && timer.journey === 1
        ? true
        : activeEra === "wishwell"
          ? true
          : false,
    era2:
      activeEra === "minting" && timer.journey === 2
        ? true
        : activeEra === "mining"
          ? true
          : false,
    era3: activeEra === "minting" && timer.journey === 3 ? true : false,
  };

  return (
    <motion.div
      whileInView={{
        x: "-50%",
        y: "-50%",
        rotate: eras.era1 ? -75 : eras.era3 ? 75 : eras.era2 ? 0 : -180,
      }}
      initial={{
        x: "-50%",
        y: "-50%",
        rotate: -180,
      }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[490px] w-[190px] bg-agyellow z-10",
        `rotate-[${eras.era1 ? -75 : eras.era3 ? 75 : 0}deg]`,
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
      <H1
        era="minting"
        stage={1}
        parentClassName="rotate-[-90deg]"
        isEraLetter="Lottery 1"
      />
      <Border eraBorder className="rotate-[45deg]" />
      <H1
        era="minting"
        stage={2}
        parentClassName="rotate-[0deg]"
        isEraLetter="Lottery 2"
      />
      <Border eraBorder className="rotate-[135deg]" />
      <H1
        era="minting"
        stage={3}
        parentClassName="rotate-[90deg]"
        isEraLetter="Lottery 3"
      />
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
  const activePhase = useTimer().phase;
  return (
    <>
      <EraHighlighter />
      <div id="wishwell">
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-96deg]"
          isEraLetter={"W"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-90deg]"
          isEraLetter={"i"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-85deg]"
          isEraLetter={"s"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-78deg]"
          isEraLetter={"h"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-70deg]"
          isEraLetter={"w"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-62deg]"
          isEraLetter={"e"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-56deg]"
          isEraLetter={"l"}
        />
        <H1
          era="wishwell"
          stage={activePhase}
          parentClassName="rotate-[-50deg]"
          isEraLetter={"l"}
        />
      </div>
      <Border eraBorder className="rotate-[-37.5deg]" />
      <div id="mining">
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[-12deg]"
          isEraLetter={"M"}
        />
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[-6deg]"
          isEraLetter={"i"}
        />
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[-1deg]"
          isEraLetter={"n"}
        />
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[4deg]"
          isEraLetter={"i"}
        />
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[9deg]"
          isEraLetter={"n"}
        />
        <H1
          era="mining"
          stage={activePhase}
          parentClassName="rotate-[16deg]"
          isEraLetter={"g"}
        />
      </div>
      <Border eraBorder className="rotate-[37.5deg]" />
      <div id="minting">
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[61deg]"
          isEraLetter={"M"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[67deg]"
          isEraLetter={"i"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[73deg]"
          isEraLetter={"n"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[79deg]"
          isEraLetter={"t"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[84deg]"
          isEraLetter={"i"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[89deg]"
          isEraLetter={"n"}
        />
        <H1
          era="minting"
          stage={activePhase}
          parentClassName="rotate-[96deg]"
          isEraLetter={"g"}
        />
      </div>
    </>
  );
}

function StageNumber() {
  return (
    <div>
      <H1 era="journey1" stage={1} parentClassName="rotate-[-100deg] pt-12" />
      <H1 era="journey1" stage={2} parentClassName="rotate-[-75deg] pt-11" />
      <H1 era="journey1" stage={3} parentClassName="rotate-[-50deg] pt-10" />
      <H1 era="journey2" stage={1} parentClassName="rotate-[-25deg] pt-9" />
      <H1 era="journey2" stage={2} parentClassName="rotate-[0deg] pt-9" />
      <H1 era="journey2" stage={3} parentClassName="rotate-[25deg] pt-9" />
      <H1 era="journey3" stage={1} parentClassName="rotate-[50deg] pt-10" />
      <H1 era="journey3" stage={2} parentClassName="rotate-[75deg] pt-11" />
      <H1 era="journey3" stage={3} parentClassName="rotate-[100deg] pt-12" />
    </div>
  );
}

function StageNumberOfEra2() {
  return (
    <div>
      <H1 era="wishwell" stage={1} parentClassName="rotate-[-100deg] pt-12" />
      <H1 era="wishwell" stage={2} parentClassName="rotate-[-75deg] pt-11" />
      <H1 era="wishwell" stage={3} parentClassName="rotate-[-50deg] pt-10" />
      <H1 era="mining" stage={1} parentClassName="rotate-[-25deg] pt-9" />
      <H1 era="mining" stage={2} parentClassName="rotate-[0deg] pt-9" />
      <H1 era="mining" stage={3} parentClassName="rotate-[25deg] pt-9" />
      <H1 era="minting" stage={1} parentClassName="rotate-[50deg] pt-10" />
      <H1 era="minting" stage={2} parentClassName="rotate-[75deg] pt-11" />
      <H1 era="minting" stage={3} parentClassName="rotate-[100deg] pt-12" />
    </div>
  );
}

function Pointer() {
  const activeState = useTimer();
  const rotation = decideActiveStageLocation({
    activeEra: activeState.isMintingActive
      ? `journey${activeState.journey as 1 | 2 | 3}`
      : activeState.era,
    activePhase: activeState.isMintingActive
      ? (activeState.phaseNumber as 1 | 2 | 3)
      : activeState.phase,
    mintingActive: activeState.isMintingActive,
  });
  return (
    <motion.div
      animate={{
        rotate: `${rotation}deg`,
      }}
      whileInView={{
        x: "-50%",
        y: "-50%",
        rotate: `${rotation}deg`,
      }}
      initial={{
        x: "-50%",
        y: "-50%",
        rotate: "-180deg",
      }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className={twMerge(
        "absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] origin-bottom h-[100px] w-[50px] z-10 pt-0",
        `rotate-[${rotation}deg]`,
      )}
    >
      <Image
        src={IMAGEKIT_IMAGES.COUNTER_POINTER}
        width={50}
        height={50}
        layout="fixed"
        alt="Counter Pointer"
      />
    </motion.div>
  );
}

const COUNTDOWN_TITLE: { [key: string]: string[] } = {
  wishwell: ["Til phase 2", "Til phase 3", "Til phase 1"],
  mining: ["Til phase 2", "Til phase 3", "Til Minting"],
  minting: [],
  journey1: ["Til Phase 2", "Til Phase 3", "Til Journey 2"],
  journey2: ["Til Phase 2", "Til Phase 3", "Til Journey 3"],
  journey3: ["Til Phase 2", "Til Phase 3", "Til Journey 4"],
  default: ["til Phase 2", "Til Phase 3", "Til Next Journey"],
};

/* 
todo 
{
    "currentJourney": 1,
    "currentPhase": 1,
    "isJourneyPaused": false,
    "nextJourneyTimestamp": 1732005780,// till journey 2
    "mintEndTimestamp": 1724229780, // till lottery 1 
    "multiplier": 33,
    "rewardMultiplier": "4"
}
getting: change logic for timestamp
zustand multiplier aur rewardMultiplier

*/

function Timer() {
  const timer = useTimer();
  const lotteryTimerData = useLotteryTimerData();

  let timerText = "";
  let timerTimestamp = timer?.nextJourneyTimeStamp;

  if (timer?.phaseNumber === 1) {
    timerText = "TIL Minting Ends";
    timerTimestamp = timer?.nextPhaseStartTimestamp ?? 0;
    //nextPhaseStartTimestamp (TIL Minting Ends) Minting
  } else if (timer?.phaseNumber === 2) {
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "3") {
      timerText = "TIL Lottery 1";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
      //nextLotteryTimestamp TIL Lottery 1 Lottery 1
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "1") {
      timerText = "TIL Lottery 2";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
      //nextLotteryTimestamp TIL Lottery 2 Lottery 2
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "2") {
      timerText = "TIL Lottery 3";
      timerTimestamp = lotteryTimerData?.nextLotteryTimestamp * 1000;
      //nextLotteryTimestamp TIL Lottery 3 Lottery 3
    }
  } else {
    timerText = "TIL Next Journey";
    timerTimestamp = timer?.nextJourneyTimeStamp;
    //nextJourneyTimeStamp TIL Next Journey Lottery 3
  }

  const newTimer = {
    ...timer,
    ...(timerTimestamp
      ? calculateTimeDifference(new Date(timerTimestamp).toISOString())
      : { days: 0, hours: 0, mins: 0, secs: 0 }),
  };

  return (
    <div className="absolute flex flex-col justify-center items-center gap-2 z-[100] w-[400px] h-[200px] translate-y-[10%]">
      <div className="flex gap-2">
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter
              count={newTimer.days}
              setCount={() => {}}
              modulo={100000000}
            />
          </div>
          <div className={styles["timer-styles"].label}>Days</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter
              count={newTimer.hours}
              setCount={() => {}}
              modulo={24}
            />
          </div>
          <div className={styles["timer-styles"].label}>Hours</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter
              count={newTimer.mins}
              setCount={() => {}}
              modulo={60}
            />
          </div>
          <div className={styles["timer-styles"].label}>Mins</div>
        </div>
        <div className={styles["timer-styles"].parent}>
          <div className={styles["timer-styles"].number}>
            <DynamicNumberCounter
              count={newTimer.secs}
              setCount={() => {}}
              modulo={60}
            />
          </div>
          <div className={styles["timer-styles"].label}>Secs</div>
        </div>
      </div>

      <div
        style={{
          fontSize: "1.7rem",
          fontWeight: 900,
        }}
        className="font-sans text-agyellow text-2xl font-bold text-center uppercase tracking-widest"
      >
        {timerText}
      </div>
    </div>
  );
}

function Bonus({ era }: { era: string }) {
  const { data = 0, mutate } = useRestPost(
    ["predict-multiplier"],
    "/api/predict-multiplier",
  );
  const [bonus, setBonus] = useState(0);
  useEffect(() => {
    mutate({
      walletAddress: "",
      era: getEra(era),
    });
  }, [era]);

  useEffect(() => {
    if (data) {
      // @ts-ignore
      setBonus(data?.multiplier as number);
    }
  }, [data]);

  return (
    <>
      <h1 className="font-sans font-black text-4xl">
        <AutomaticIncreamentalNumberCounter from={0} to={bonus} />x
      </h1>
      <div className="uppercase text-sm font-sans font-bold">Bonus</div>
    </>
  );
}

const ArcSector = ({
  fromDeg,
  toDeg,
  fromColor = "#3C00DC",
  toColor = "#FF5001",
  className = "",
}: ArcSectorProps) => {
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

const decideArcSectorAngles = (
  timer: {
    phaseNumber?: number;
    nextJourneyTimeStamp?: number;
  },
  lotteryTimerData: {
    lotteriesInfo?: {
      lotteryId?: string;
    } | null;
  },
): {
  startAngle: number;
  endAngle: number;
} => {
  if (timer?.phaseNumber === 1) {
    // Current: Minting
    return { startAngle: 135, endAngle: 225 };
  } else if (timer?.phaseNumber === 2) {
    if (lotteryTimerData?.lotteriesInfo?.lotteryId === "3") {
      // Current: Lottery 1
      return { startAngle: 223, endAngle: 313 };
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "1") {
      // Current: Lottery 2
      return { startAngle: -47, endAngle: 47 };
    } else if (lotteryTimerData?.lotteriesInfo?.lotteryId === "2") {
      // Current: Lottery 3
      return { startAngle: 47, endAngle: 137 };
    }
  } else {
    // Current: Lottery 3 (Ideally, Payout Time or Buffer Time)
    return { startAngle: 47, endAngle: 137 };
  }
  return { startAngle: 0, endAngle: 0 };
};

export default function Spinner({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const timer = useTimer();
  const lotteryTimerData = useLotteryTimerData();
  const opacity = useTransform(scrollYProgress, [1, 0], [0, 1]);

  useEffect(() => {
    setTimeout(() => {
      globalDelay = 0;
    }, 2000);
  }, []);

  const arcSectorAngles = useMemo(
    () => decideArcSectorAngles(timer, lotteryTimerData),
    [timer, lotteryTimerData],
  );

  return (
    <motion.div
      style={{ opacity }}
      whileInView={{
        filter: "saturate(1)",
      }}
      initial={{
        filter: "saturate(0)",
      }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: globalDelay }}
      className="absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-60%] md:translate-y-[-37%] w-[500px] h-[500px] bg-black rounded-full flex justify-center items-center scale-[0.7] sm:scale-[0.8] overflow-hidden z-[100]"
    >
      <div className="relative w-[470px] h-[470px] bg-[radial-gradient(circle_at_center,#B7A4EA,#1C0068_65%)] rounded-full flex justify-center items-center overflow-hidden">
        <If
          condition={timer.era !== "minting"}
          then={<EraOfEra2 />}
          else={<Era />}
        />
        <ArcSector
          fromDeg={arcSectorAngles?.startAngle}
          toDeg={arcSectorAngles?.endAngle}
        />
        <div className="relative w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,#B7A4EA,#1C0068_65%)] rounded-full border-[10px] border-agblack flex justify-center items-center overflow-hidden z-10">
          <Timer />
        </div>
      </div>
    </motion.div>
  );
}
