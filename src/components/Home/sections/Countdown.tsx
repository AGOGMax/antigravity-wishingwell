"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { CountdownType } from "../../../hooks/frontend/useTimer";
import CountdownTimer from "@/components/CountdownTimer";
import { IMAGEKIT_IMAGES } from "@/assets/imageKit";
import useLotteryTimerData from "@/components/useLotteryTimerData";
import { useEffect, useState } from "react";

type stateType = CountdownType & {
  era: "wishwell" | "mining" | "minting" | "journey1" | "journey2" | "journey3";
  journey: number; // Changed from literal to number for flexibility
  phaseNumber: number;
  // Added these to match the 'state' object you created below
  nextJourneyTimeStamp?: number;
  currentMintEndTimestamp?: number;
  nextPhaseStartTimestamp?: number;
};

function checkPhaseCompletedOrActive(
  activeState: stateType,
  currentPhase: stateType["phase"],
  currentEra: stateType["era"] | "journey1" | "journey2" | "journey3",
) {
  const eras = {
    era1:
      activeState.isMintingActive && activeState.journey === 1
        ? true
        : activeState.era === "wishwell"
          ? true
          : false,
    era2:
      activeState.isMintingActive && activeState.journey === 2
        ? true
        : activeState.era === "mining"
          ? true
          : false,
    era3:
      activeState.isMintingActive && activeState.journey === 3 ? true : false,
  };

  if (eras.era1) {
    if (currentEra === "wishwell" || currentEra === "journey1") {
      return currentPhase <= activeState.phase;
    }
    return false;
  }

  if (eras.era2) {
    if (currentEra === "mining" || currentEra === "journey2") {
      return currentPhase <= activeState.phase;
    }
    if (currentEra === "wishwell" || currentEra === "journey1") {
      return true;
    }
    return false;
  }

  if (eras.era3) {
    if (currentEra === "minting" || currentEra === "journey3") {
      return currentPhase <= activeState.phase;
    }
    return true;
  }
}

function Phase({
  activeState,
  era,
  phase,
}: {
  activeState: stateType;
  era: stateType["era"] | "journey1" | "journey2" | "journey3";
  phase: stateType["phase"];
}) {
  return (
    <motion.div
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 1 }}
      className={twMerge(
        "text-[36px] font-sans font-extrabold text-center",
        checkPhaseCompletedOrActive(activeState, phase, era)
          ? "text-black"
          : "from-white to-[#999999] bg-gradient-to-b text-transparent bg-clip-text",
      )}
    >
      {phase}
    </motion.div>
  );
}

function MobilePhase({
  activeState,
  era,
  phase,
}: {
  activeState: {
    era: stateType["era"] | "journey1" | "journey2" | "journey3";
    phase: stateType["phase"];
  };
  era: stateType["era"] | "journey1" | "journey2" | "journey3";
  phase: stateType["phase"];
}) {
  if (activeState.era === era && activeState.phase === phase) {
    return (
      <motion.div
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 1 }}
        className={twMerge(
          "relative text-[35.82px] leading-[35.82px] font-sans font-extrabold text-center bg-agyellow rounded-lg p-2 px-4 text-agblack",
        )}
      >
        {phase}
        <motion.div
          whileInView={{
            width: "100%",
          }}
          initial={{ width: "0%" }}
          transition={{
            duration: 1,
            ease: "easeIn",
          }}
          viewport={{ once: true }}
          className="absolute w-full h-full bottom-0 left-0 translate-y-[35%] translate-x-[2%] flex justify-center items-center "
        >
          <Image
            src={IMAGEKIT_IMAGES.TIMER_POINTER}
            alt="timer-pointer"
            width={13.05}
            height={11.54}
            className="mx-[8px] w-[13.05px] h-[11.54px]"
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        color: "transparent",
      }}
      className={twMerge(
        "text-5xl font-sans font-extrabold text-center",
        "from-white to-[#999999] bg-gradient-to-b text-transparent bg-clip-text rounded-lg p-2 px-4",
      )}
    >
      {phase}
    </motion.div>
  );
}

function calculateActivePhasesSlider(activeState: stateType) {
  let activePhase = 0;
  if (activeState.era === "wishwell" || activeState.journey === 1) {
    activePhase = activeState.isMintingActive
      ? activeState.phaseNumber
      : activeState.phase;
  }
  if (activeState.era === "mining" || activeState.journey === 2) {
    activePhase = activeState.isMintingActive
      ? activeState.phaseNumber + 3
      : activeState.phase + 3;
  }
  if (activeState.isMintingActive && activeState.journey === 3) {
    activePhase = activeState.isMintingActive
      ? activeState.phaseNumber + 6
      : activeState.phase + 6;
  }
  return activePhase;
}

export default function Countdown() {
  // const state = useTimer();
  const fetchLotteryTimerData = useLotteryTimerData();
  const [LotteryTimerData, setLotteryTimerData] = useState<number>(0); // in secs
  const state: CountdownType = {
    // LotteryTimerData.nextLotteryTimestamp is in seconds
    era: "minting",
    phase: 3,
    journey: 3,
    phaseNumber: 3,
    claimStarted: false,
    claimTransition: false,
    mintingTransition: false,
    isMintingActive: true,
    isJourneyPaused: false,
    nextJourneyTimeStamp: 0 as any,
    currentMintEndTimestamp: 0 as any,
    nextPhaseStartTimestamp: 0 as any,
    secs: LotteryTimerData % 60,
    mins: Math.floor(LotteryTimerData / 60) % 60,
    hours: Math.floor(LotteryTimerData / 3600) % 24,
    days: Math.floor(LotteryTimerData / 86400),
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const nextLotteryTimestamp =
        fetchLotteryTimerData.nextLotteryTimestamp || 0;
      const time = nextLotteryTimestamp - now;
      if (time <= 0) {
        fetchLotteryTimerData.refreshTimer();
      } else {
        setLotteryTimerData(nextLotteryTimestamp - now);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchLotteryTimerData]);

  // const eras = {
  //   era1:
  //     state.isMintingActive && state.journey === 1
  //       ? true
  //       : state.era === "wishwell"
  //         ? true
  //         : false,
  //   era2:
  //     state.isMintingActive && state.journey === 2
  //       ? true
  //       : state.era === "mining"
  //         ? true
  //         : false,
  //   era3: state.isMintingActive && state.journey === 3 ? true : false,
  // };

  // const activeEraAndPhase: {
  //   era: stateType["era"] | "journey1" | "journey2" | "journey3";
  //   phase: stateType["phase"];
  // } = {
  //   era: state.isMintingActive
  //     ? `journey${state.journey as 1 | 2 | 3}`
  //     : state.era,
  //   phase: state.isMintingActive
  //     ? (state.phaseNumber as 1 | 2 | 3)
  //     : state.phase,
  // };

  return (
    <div
      // className="relative w-[calc(100%+3px)] border-t-4 border-b-4 max-w-[1200px] lg:translate-x-0 md:mx-auto bg-[#0A0025] lg:rounded-xl p-[16px] lg:p-8 border-transparent bg-clip-padding flex flex-col lg:flex-row justify-between gap-10 z-0
      //       before:content-[''] before:absolute before:inset-0 before:z-[-10] before:bg-gradient-to-bl before:from-[#5537A5] before:to-[#BF6841] before:rounded-[inherit] before:overflow-hidden before:m-[-1.5px]
      // after:content-[''] after:absolute after:inset-0 after:z-[-2] after:bg-[#0A0025] after:rounded-[inherit] after:overflow-hidden
      //   "
      className="relative w-[calc(100%+3px)] border-t-4 border-b-4 max-w-[1200px] lg:translate-x-0 md:mx-auto bg-[#0A0025] lg:rounded-xl p-[16px] lg:p-8 border-transparent bg-clip-padding flex flex-col lg:flex-row justify-between gap-10 z-0
            before:content-[''] before:absolute before:inset-0 before:z-[-10] before:bg-gradient-to-bl before:from-[#5537A5] before:to-[#BF6841] before:rounded-[inherit] before:overflow-hidden before:m-[-1.5px]
			after:content-[''] after:absolute after:inset-0 after:z-[-2] after:bg-[#0A0025] after:rounded-[inherit] after:overflow-hidden
        "
    >
      <Image
        src={IMAGEKIT_IMAGES.COUNTDOWN_BG_GRID}
        alt="countdown bg grid"
        width={800}
        height={800}
        className="absolute inset-0 z-[-1] w-full h-full object-cover user-select-none pointer-events-none opacity-[66%]"
      />
      <div className="flex justify-center items-center flex-col gap-4 w-full">
        <CountdownTimer state={state} overrideText="TIL NEXT LOTTERY" />
      </div>
      {/* 
      // Mobile View
      <div className="relative flex sm:hidden flex-col rounded bg-gradient-to-b from-[#5730BF] to-[#15004C] p-[7.46px,12.69px,7.46px,12.69px] z-0 overflow-hidden">
        <div className="grid grid-cols-1 gap-[16px]">
          <div className="relative h-full flex flex-col gap-[2.98px] p-2">
            <motion.div
              whileInView={{
                height: eras.era3
                  ? "calc(200%)"
                  : eras.era2
                    ? "calc(100%)"
                    : "calc(0%)",
                boxShadow: "0px 5px 0px 0px rgba(0,0,0,1)",
              }}
              initial={{
                height: "0%",
                boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
              }}
              style={{
                width: "calc(100%)",
              }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="absolute top-0 left-0 bg-gradient-to-b from-[#03040430] to-[#131A1A30] rounded-[6px] -z-10"
            ></motion.div>
            <div
              style={{
                color: eras.era1 ? "#f5eb00" : "transparent",
              }}
              className={twMerge(
                "text-[36px] leading-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text",
                eras.era1 && "text-agyellow",
              )}
            >
              {state.isMintingActive ? "Journey 1" : "Wishwell"}
            </div>
            <div className="tracking-widest uppercase text-[14px] leading-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
            <div className="flex justify-center items-center gap-2 relative z-0 px-auto">
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey1" : "wishwell"}
                phase={1}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey1" : "wishwell"}
                phase={2}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey1" : "wishwell"}
                phase={3}
              />
            </div>
          </div>
          <div className="flex flex-col gap-[2.98px] p-2">
            <div
              style={{
                color: state.era === "mining" ? "#f5eb00" : "transparent",
              }}
              className={twMerge(
                "text-[36px] leading-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text",
                state.era === "mining" && "text-agyellow",
              )}
            >
              {state.isMintingActive ? "Journey 2" : "Mining"}
            </div>
            <div className="tracking-widest uppercase text-[14px] leading-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
            <div className="flex justify-center items-center gap-2 relative z-0 px-auto">
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey2" : "mining"}
                phase={1}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey2" : "mining"}
                phase={2}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey2" : "mining"}
                phase={3}
              />
            </div>
          </div>
          <div className="relative flex flex-col gap-[2.98px] p-2">
            <motion.div
              whileInView={{
                height: eras.era1
                  ? "calc(210%)"
                  : state.era === "mining" || eras.era2
                    ? "calc(100%)"
                    : "calc(0%)",
                boxShadow: "0px -5px 0px 0px rgba(0,0,0,1)",
              }}
              initial={{
                height: "0%",
                boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
              }}
              style={{
                width: "calc(100%)",
              }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="absolute bottom-0 right-0 bg-gradient-to-b from-[#03040430] to-[#131A1A30] rounded-[6px] -z-10"
            ></motion.div>
            <div
              style={{
                color:
                  state.isMintingActive && state.journey === 3
                    ? "#f5eb00"
                    : "transparent",
              }}
              className={twMerge(
                "text-[36px] leadding-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text",
              )}
            >
              {state.isMintingActive ? "Journey 3" : "Minting"}
            </div>
            <div className="tracking-widest uppercase text-[14px] leading-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
            <div className="flex justify-center items-center gap-2 relative z-0 px-auto">
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey3" : "minting"}
                phase={1}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey3" : "minting"}
                phase={2}
              />
              <MobilePhase
                activeState={activeEraAndPhase}
                era={state.isMintingActive ? "journey3" : "minting"}
                phase={3}
              />
            </div>
          </div>
        </div>
      </div>

      // Desktop View
      <div className="hidden relative sm:flex flex-col rounded-[5px] bg-gradient-to-b from-[#5730BF] to-[#15004C] px-[12px] py-[8px] z-0 overflow-hidden">
        <div className="grid grid-cols-3 gap-14">
          <div className="h-full flex flex-col gap-2">
            <div
              style={{
                color: eras.era1 ? "#f5eb00" : "transparent",
              }}
              className="text-[36px] leading-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text"
            >
              {state.isMintingActive ? "Journey 1" : "Wishwell"}
            </div>
            <div className="tracking-widest uppercase text-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              style={{
                color: eras.era2 ? "#f5eb00" : "transparent",
              }}
              className="text-[36px] leading-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text"
            >
              {state.isMintingActive ? "Journey 2" : "Mining"}
            </div>
            <div className="tracking-widest uppercase text-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              style={{
                color: eras.era3 ? "#f5eb00" : "transparent",
              }}
              className="text-[36px] leading-[36px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text"
            >
              {state.isMintingActive ? "Journey 3" : "Minting"}
            </div>
            <div className="tracking-widest uppercase text-[14px] text-center from-white to-[#999999] font-sans font-extrabold bg-gradient-to-b text-transparent bg-clip-text">
              {"Phase"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-9 relative z-0">
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey1" : "wishwell"}
            phase={1}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey1" : "wishwell"}
            phase={2}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey1" : "wishwell"}
            phase={3}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey2" : "mining"}
            phase={1}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey2" : "mining"}
            phase={2}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey2" : "mining"}
            phase={3}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey3" : "minting"}
            phase={1}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey3" : "minting"}
            phase={2}
          />
          <Phase
            activeState={state as stateType}
            era={state.isMintingActive ? "journey3" : "minting"}
            phase={3}
          />
          <motion.div
            whileInView={{
              width: `calc(${(100 / 9) * calculateActivePhasesSlider(state as stateType)}% + 16px)`,
            }}
            // viewport={{ once: true }}
            initial={{ width: "1%" }}
            transition={{ duration: 1 }}
            style={{
              height: "calc(100% + 8px)",
              left: `calc(0% - 16px)`,
            }}
            className="absolute w-[calc((50*9)%/100%)] h-full bg-agyellow rounded z-[-1]"
          >
            <motion.div
              whileInView={{
                width: "100%",
              }}
              initial={{ width: "0%" }}
              transition={{
                duration: 1,
                ease: "easeIn",
              }}
              viewport={{ once: true }}
              className="w-full h-full flex justify-end items-end px-[16px]"
            >
              <Image
                src={IMAGEKIT_IMAGES.TIMER_POINTER}
                alt="timer-pointer"
                width={14}
                height={14}
                className="mx-[5px] my-[10px]"
              />
            </motion.div>
          </motion.div>
        </div>
        <motion.div
          whileInView={{
            width: eras.era1
              ? "0%"
              : eras.era2
                ? "33.33%"
                : eras.era3
                  ? "calc(66.66%)"
                  : "100%",
            boxShadow: "5px 0px 0px 0px rgba(0,0,0,1)",
          }}
          initial={{
            width: "0%",
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
          }}
          style={{
            height: "calc(100%)",
          }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute top-0 left-0 bg-gradient-to-b from-[#03040430] to-[#131a1a30] rounded-br-xl rounded-tr-xl z-1000"
        ></motion.div>
        <motion.div
          whileInView={{
            width: eras.era1
              ? "63.66%"
              : eras.era2
                ? "33.33%"
                : "0%",
            boxShadow: "-5px 0px 0px 0px rgba(0,0,0,1)",
          }}
          initial={{
            width: "0%",
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
          }}
          style={{
            height: "calc(100%)",
          }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute top-0 right-0 bg-gradient-to-b from-[#03040430] to-[#131a1a30] rounded-bl-xl rounded-tl-xl z-1000"
        ></motion.div>
      </div>
      */}
    </div>
  );
}
