import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

export interface CountdownType {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  phase: number;
  era: "wishwell" | "mining" | "minting" | "journey1" | "journey2" | "journey3";
  journey: number;
  claimStarted: boolean;
  isMintingActive: boolean;
  claimTransition?: boolean;
  mintingTransition?: boolean;
  isJourneyPaused?: boolean;
  phaseNumber?: number;
  nextJourneyTimeStamp?: number;
  currentMintEndTimestamp?: number;
  nextPhaseStartTimestamp?: number;
}

export default function useTimer(
  timestamp?: "mintEndTimestamp" | "nextJourneyTimestamp",
): CountdownType {
  const [countdown, setInitialCountdown] = useCountdownTimer(0);
  
  const [details, setDetails] = useState({
    journey: 0,
    phase: 0,
    claimStarted: false,
    isMintingActive: false,
    era: "wishwell" as CountdownType["era"], 
  });

  const JPMContract = useJPMContract();
  
  const { data: JPMReadData } = useReadContracts({
    contracts: [
      { ...JPMContract, functionName: "currentJourney" },
      { ...JPMContract, functionName: "currentPhase" },
      { ...JPMContract, functionName: "getNextPhaseTimestamp" },
    ].map((call) => ({
      ...call,
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
    })),
  });

  useEffect(() => {
    if (JPMReadData && JPMReadData[0]?.result !== undefined) {
      const journey = Number(JPMReadData[0].result);
      const phaseNum = Number(JPMReadData[1].result);
      const nextTimestamp = Number(JPMReadData[2].result);

      let currentEra: CountdownType["era"] = "wishwell";
      
      if (journey > 0) {
        currentEra = `journey${journey}` as CountdownType["era"];
      } else {
        if (phaseNum === 1) currentEra = "mining";
        if (phaseNum >= 2) currentEra = "minting";
      }

      setDetails({
        journey: journey,
        phase: phaseNum,
        claimStarted: phaseNum > 0,
        isMintingActive: journey > 0 || phaseNum >= 2,
        era: currentEra,
      });

      setInitialCountdown(nextTimestamp * 1000);
    }
  }, [JPMReadData, setInitialCountdown]);

  // FINAL CLEAN RETURN
  return {
    ...countdown,
    // Ensure naming matches the interface (mins/secs)
    mins: countdown.mins ?? 0,
    secs: countdown.secs ?? 0,
    phase: details.phase,
    era: details.era,
    journey: details.journey,
    claimStarted: details.claimStarted,
    isMintingActive: details.isMintingActive,
    claimTransition: false,
    mintingTransition: false,
    isJourneyPaused: false,
    phaseNumber: details.phase,
    nextJourneyTimeStamp: 0,
    currentMintEndTimestamp: 0,
    nextPhaseStartTimestamp: 0,
  };
}

export const calculateTimeDifference = (targetTimestamp: number) => {
  const diff = targetTimestamp - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return { days, hours, mins, secs };
};
