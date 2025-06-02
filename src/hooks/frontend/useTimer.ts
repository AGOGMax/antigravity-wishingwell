"use client";

import { useEffect, useState } from "react";
import { client } from "../../../sanity/lib/client";
import { useAccount } from "wagmi";
import { useRestPost } from "../useRestClient";

export type CountdownType = {
  era: "wishwell" | "mining" | "minting";
  phase: 1 | 2 | 3;
  days: number;
  hours: number;
  mins: number;
  secs: number;
  claimStarted: boolean;
  claimTransition: boolean;
  mintingTransition: boolean;
  isMintingActive: boolean;
  journey: 1 | 2 | 3;
  phaseNumber: 1 | 2 | 3;
  isJourneyPaused: boolean;
  nextJourneyTimeStamp: number;
  currentMintEndTimestamp: number | null | undefined;
  nextPhaseStartTimestamp: number | null | undefined;
};

const DEFAULT: CountdownType = {
  era: "mining",
  phase: 2,
  days: 0,
  hours: 0,
  mins: 0,
  secs: 0,
  claimStarted: false,
  claimTransition: false,
  mintingTransition: false,
  isMintingActive: true,
  journey: 2,
  phaseNumber: 2,
  isJourneyPaused: true,
  nextJourneyTimeStamp: 0,
  currentMintEndTimestamp: null,
  nextPhaseStartTimestamp: null,
};

let timer: CountdownType = { ...DEFAULT };

function setTimer(newTimer: CountdownType) {
  timer = newTimer;
}

export function calculateTimeDifference(endTime: string) {
  const endDate = new Date(endTime).getTime();
  if (isNaN(endDate)) return { days: 0, hours: 0, mins: 0, secs: 0 };

  const now = new Date().getTime();
  const diff = endDate - now;

  if (diff < 0) return { days: 0, hours: 0, mins: 0, secs: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, mins, secs };
}

function getCurrentEraAndPhase(timestamps: any) {
  const now = new Date().getTime();

  // Check each phase start and end time to determine the current era and phase
  for (let era = 1; era <= 3; era++) {
    for (let phase = 1; phase <= 3; phase++) {
      const startKey = `era_${era}_phase_${phase}_start`;
      const endKey = `era_${era}_phase_${phase}_end`;

      const startTime = new Date(timestamps?.[startKey]).getTime();
      const endTime = new Date(timestamps?.[endKey]).getTime();

      if (now >= startTime && now < endTime) {
        return {
          era: `era_${era}` as "era_1" | "era_2" | "era_3",
          phase: phase as 1 | 2 | 3,
        };
      }
    }
  }

  // If no phase is active, default to the first phase of the first era
  return { era: "era_3" as "era_1" | "era_2" | "era_3", phase: 3 };
}

let timestamps: any = null;
function setTimestamps(newTimestamps: any) {
  timestamps = newTimestamps;
}

function createDummyTimestamps() {
  const now = new Date().getTime();
  const timegap = 0; // 5 seconds
  const dummyTimestamps: any = {
    era_1_phase_1_start: new Date(now).toLocaleString(),
    era_1_phase_1_end: new Date(now + timegap).toLocaleString(),
    era_1_phase_2_start: new Date(now + timegap).toLocaleString(),
    era_1_phase_2_end: new Date(now + timegap * 2).toLocaleString(),
    era_1_phase_3_start: new Date(now + timegap * 2).toLocaleString(),
    era_1_phase_3_end: new Date(now + timegap * 3).toLocaleString(),
    era_2_phase_1_start: new Date(now + timegap * 3).toLocaleString(),
    era_2_phase_1_end: new Date(now + timegap * 4).toLocaleString(),
    era_2_phase_2_start: new Date(now + timegap * 4).toLocaleString(),
    era_2_phase_2_end: new Date(now + timegap * 5).toLocaleString(),
    era_2_phase_3_start: new Date(now + timegap * 5).toLocaleString(),
    era_2_phase_3_end: new Date(now + timegap * 6).toLocaleString(),
    claim_starts: new Date(now + timegap * 7).toLocaleString(),
    claim_ends: new Date(now + timegap * 8).toLocaleString(),
    era_3_phase_1_start: new Date(now + timegap * 10).toLocaleString(),
    era_3_phase_1_end: new Date(now + timegap * 11 + 210000).toLocaleString(),
    era_3_phase_2_start: new Date(now + timegap * 11 + 210000).toLocaleString(),
    era_3_phase_2_end: new Date(now + timegap * 12 + 220000).toLocaleString(),
    era_3_phase_3_start: new Date(now + timegap * 12 + 220000).toLocaleString(),
    era_3_phase_3_end: new Date(now + timegap * 13 + 230000).toLocaleString(),
  };

  return dummyTimestamps;
}

export default function useTimer() {
  const [currentTimer, setCurrentTimer] = useState<CountdownType>(timer);

  const account = useAccount();

  const { mutateAsync: fetchEra3 } = useRestPost(
    ["era-3-timestamps-multipliers"],
    "/api/era-3-timestamps-multipliers",
  );

  useEffect(() => {
    if (timestamps === null) {
      async function fetchData() {
        let timeData,
          journeyData: {
            currentJourney: number;
            currentPhase: number;
            isJourneyPaused: boolean;
            nextJourneyTimestamp: number;
            mintEndTimestamp: number;
            nextPhaseStartTimestamp: string;
          };
        try {
          timeData = await client.fetch(`*[_type=="timestamps"][0]`);
          journeyData = (await fetchEra3({
            walletAddress: account.address,
          })) as {
            currentJourney: number;
            currentPhase: number;
            isJourneyPaused: boolean;
            nextJourneyTimestamp: number;
            mintEndTimestamp: number;
            nextPhaseStartTimestamp: string;
          };
        } catch (e) {
          timeData = createDummyTimestamps();
          journeyData = {
            currentJourney: 2,
            currentPhase: 2,
            isJourneyPaused: false,
            nextJourneyTimestamp: 0,
            mintEndTimestamp: 0,
            nextPhaseStartTimestamp: new Date().toLocaleString(),
          };
        }

        const mintingTimestamps = {
          currentJourney: Number(journeyData?.currentJourney),
          currentPhase: Number(journeyData?.currentPhase),
          isJourneyPaused: journeyData?.isJourneyPaused,
          nextJourneyTimestamp: journeyData?.nextJourneyTimestamp * 1000,
          mintEndTimestamp: journeyData?.mintEndTimestamp * 1000,
          nextPhaseStartTimestamp:
            Number(journeyData?.nextPhaseStartTimestamp) * 1000,
        };
        const now = new Date().getTime();
        const era2End = new Date(
          timeData?.["era_2_phase_3_end"] || "",
        ).getTime();
        const claimStart = new Date(timeData?.["claim_starts"] || "").getTime();
        const claimEnd = new Date(timeData?.["claim_ends"] || "").getTime();
        const mintStarted = new Date(
          timeData?.["era_3_phase_1_start"] || "",
        ).getTime();

        let initialTimer: CountdownType;

        if (now >= era2End && now < claimStart) {
          const claimTime = calculateTimeDifference(
            timeData?.["claim_starts"] || "",
          );
          initialTimer = {
            era: "mining",
            phase: 3,
            ...claimTime,
            claimStarted: false,
            claimTransition: true,
            mintingTransition: false,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else if (now >= claimStart && now <= claimEnd) {
          const claimTime = calculateTimeDifference(
            timeData?.["claim_ends"] || "",
          );
          initialTimer = {
            era: "mining",
            phase: 3,
            ...claimTime,
            claimStarted: true,
            claimTransition: false,
            mintingTransition: false,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else if (now >= claimEnd && now <= mintStarted) {
          const mintTime = calculateTimeDifference(
            timeData?.["era_3_phase_1_start"] || "",
          );
          initialTimer = {
            era: "mining",
            phase: 3,
            ...mintTime,
            claimStarted: false,
            claimTransition: false,
            mintingTransition: true,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else {
          const { era, phase } = getCurrentEraAndPhase(timeData);
          if (era === "era_3") {
            if (mintingTimestamps.isJourneyPaused) {
              initialTimer = {
                era: "minting",
                phase: Number(mintingTimestamps.currentJourney) as 1 | 2 | 3,
                days: 0,
                hours: 0,
                mins: 0,
                secs: 0,
                claimStarted: false,
                claimTransition: false,
                mintingTransition: false,
                isMintingActive: true,
                journey: Number(mintingTimestamps.currentJourney) as 1 | 2 | 3,
                phaseNumber: Number(mintingTimestamps.currentPhase) as
                  | 1
                  | 2
                  | 3,
                isJourneyPaused: mintingTimestamps.isJourneyPaused,
                nextJourneyTimeStamp: mintingTimestamps.nextJourneyTimestamp,
                currentMintEndTimestamp: mintingTimestamps.mintEndTimestamp,
                nextPhaseStartTimestamp:
                  mintingTimestamps.nextPhaseStartTimestamp,
              };
            } else {
              initialTimer = {
                era: "minting",
                phase: Number(mintingTimestamps.currentJourney) as 1 | 2 | 3,
                ...calculateTimeDifference(
                  new Date(
                    mintingTimestamps.nextPhaseStartTimestamp,
                  ).toLocaleString(),
                ),
                claimStarted: false,
                claimTransition: false,
                mintingTransition: false,
                isMintingActive: true,
                journey: Number(mintingTimestamps.currentJourney) as 1 | 2 | 3,
                phaseNumber: Number(mintingTimestamps.currentPhase) as
                  | 1
                  | 2
                  | 3,
                isJourneyPaused: mintingTimestamps.isJourneyPaused,
                nextJourneyTimeStamp: mintingTimestamps.nextJourneyTimestamp,
                currentMintEndTimestamp:
                  mintingTimestamps.nextPhaseStartTimestamp,
                nextPhaseStartTimestamp:
                  mintingTimestamps.nextPhaseStartTimestamp,
              };
            }
          } else {
            const phaseEndKey = `${era}_phase_${phase}_end`;
            // @ts-ignore
            const endTime = timeData[phaseEndKey];
            const initialTime = calculateTimeDifference(endTime);

            initialTimer = {
              era: era === "era_1" ? "wishwell" : "mining",
              phase: phase as 1 | 2 | 3,
              ...initialTime,
              claimStarted: false,
              claimTransition: false,
              mintingTransition: false,
              isMintingActive: false,
              isJourneyPaused: false,
              journey: 1,
              phaseNumber: 1,
              nextJourneyTimeStamp: 0,
              currentMintEndTimestamp: null,
              nextPhaseStartTimestamp: null,
            };
          }
        }
        setTimer(initialTimer);
        setCurrentTimer(initialTimer);
        setTimestamps({ timeData, mintingTimestamps });
        localStorage?.setItem("timestamps", JSON.stringify(timeData));
        localStorage?.setItem(
          "current-timestamp",
          JSON.stringify(initialTimer),
        );
      }
      fetchData();
    }

    const interval = setInterval(() => {
      setCurrentTimer((prevTimer) => {
        if (!prevTimer) return prevTimer;

        const now = new Date().getTime();
        const era2End = new Date(
          timestamps?.timeData?.["era_2_phase_3_end"],
        ).getTime();
        const claimStart = new Date(
          timestamps?.timeData?.["claim_starts"],
        ).getTime();
        const claimEnd = new Date(
          timestamps?.timeData?.["claim_ends"],
        ).getTime();
        const mintStarted = new Date(
          timestamps?.timeData?.["era_3_phase_1_start"],
        ).getTime();

        if (now >= era2End && now < claimStart) {
          const claimTime = calculateTimeDifference(
            timestamps?.timeData?.["claim_starts"],
          );
          return {
            era: "mining",
            phase: 3,
            ...claimTime,
            claimStarted: false,
            claimTransition: true,
            mintingTransition: false,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else if (now >= claimStart && now <= claimEnd) {
          const claimTime = calculateTimeDifference(
            timestamps.timeData["claim_ends"],
          );
          return {
            era: "mining",
            phase: 3,
            ...claimTime,
            claimStarted: true,
            claimTransition: false,
            mintingTransition: false,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else if (now >= claimEnd && now <= mintStarted) {
          const mintTime = calculateTimeDifference(
            timestamps.timeData["era_3_phase_1_start"],
          );
          return {
            era: "mining",
            phase: 3,
            ...mintTime,
            claimStarted: false,
            claimTransition: false,
            mintingTransition: true,
            isMintingActive: false,
            isJourneyPaused: false,
            journey: 1,
            phaseNumber: 1,
            nextJourneyTimeStamp: 0,
            currentMintEndTimestamp: null,
            nextPhaseStartTimestamp: null,
          };
        } else {
          const { era: currentEra, phase: currentPhase } =
            getCurrentEraAndPhase(timestamps?.timeData);
          const claimTime = calculateTimeDifference(
            timestamps?.timeData?.[`${currentEra}_phase_${currentPhase}_end`],
          );
          let currentTimer;
          if (currentEra === "era_3") {
            if (timestamps?.mintingTimestamps.isJourneyPaused) {
              currentTimer = {
                era: "minting",
                phase: timestamps?.mintingTimestamps.currentJourney as
                  | 1
                  | 2
                  | 3,
                days: 0,
                hours: 0,
                mins: 0,
                secs: 0,
                claimStarted: false,
                claimTransition: false,
                mintingTransition: false,
                isMintingActive: true,
                journey: Number(
                  timestamps?.mintingTimestamps.currentJourney,
                ) as 1 | 2 | 3,
                phaseNumber: Number(
                  timestamps?.mintingTimestamps.currentPhase,
                ) as 1 | 2 | 3,
                isJourneyPaused: timestamps?.mintingTimestamps.isJourneyPaused,
                nextJourneyTimeStamp:
                  timestamps?.mintingTimestamps.nextJourneyTimestamp,
                currentMintEndTimestamp:
                  timestamps?.mintingTimestamps.nextPhaseStartTimestamp,
                nextPhaseStartTimestamp:
                  timestamps?.mintingTimestamps.nextPhaseStartTimestamp,
              };
            } else {
              currentTimer = {
                era: "minting",
                phase: Number(timestamps?.mintingTimestamps.currentJourney) as
                  | 1
                  | 2
                  | 3,
                ...calculateTimeDifference(
                  new Date(
                    timestamps?.mintingTimestamps.nextPhaseStartTimestamp ??
                      "2025-12-31",
                  ).toString(),
                ),
                claimStarted: false,
                claimTransition: false,
                mintingTransition: false,
                isMintingActive: true,
                journey: Number(
                  Number(timestamps?.mintingTimestamps.currentJourney),
                ) as 1 | 2 | 3,
                phaseNumber: Number(
                  Number(timestamps?.mintingTimestamps.currentPhase),
                ) as 1 | 2 | 3,
                isJourneyPaused: timestamps?.mintingTimestamps.isJourneyPaused,
                nextJourneyTimeStamp:
                  timestamps?.mintingTimestamps.nextJourneyTimestamp,
                currentMintEndTimestamp:
                  timestamps?.mintingTimestamps.nextPhaseStartTimestamp,
                nextPhaseStartTimestamp:
                  timestamps?.mintingTimestamps.nextPhaseStartTimestamp,
              };
            }
          } else {
            // @ts-ignore
            currentTimer = {
              era:
                currentEra === "era_1"
                  ? "wishwell"
                  : currentEra === "era_2"
                    ? "mining"
                    : ("minting" as "wishwell" | "mining" | "minting"),
              phase: currentPhase as 1 | 2 | 3,
              ...claimTime,
              claimStarted: false,
              claimTransition: false,
              mintingTransition: false,
              isMintingActive: false,
              isJourneyPaused: false,
              journey: 1,
              phaseNumber: 1,
              nextJourneyTimeStamp: 0,
              currentMintEndTimestamp: null,
              nextPhaseStartTimestamp: null,
            };
          }
          setTimer(currentTimer as CountdownType);
          return currentTimer as CountdownType;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentTimer;
}
