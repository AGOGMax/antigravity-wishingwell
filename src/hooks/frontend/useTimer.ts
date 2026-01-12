import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

// This interface now perfectly matches what CountdownTimer.tsx expects
export interface CountdownType {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  phase: number;
  era: "wishwell" | "mining" | "minting";
  journey: number;
  claimStarted: boolean;
  isMintingActive: boolean;
  // Optional safety properties to prevent crashes on line 88-92
  claimTransition?: boolean;
  mintingTransition?: boolean;
  isJourneyPaused?: boolean;
  phaseNumber?: number;
}

export default function useTimer(
  timestamp?: "mintEndTimestamp" | "nextJourneyTimestamp",
): CountdownType {
  // 1. Get the time breakdown from the base hook
  const [countdown, setInitialCountdown] = useCountdownTimer(0);
  
  const [details, setDetails] = useState({
    journey: 0,
    phase: 0,
    claimStarted: false,
    isMintingActive: false,
    era: "wishwell" as "wishwell" | "mining" | "minting",
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

      let currentEra: "wishwell" | "mining" | "minting" = "wishwell";
      if (phaseNum === 1) currentEra = "mining";
      if (phaseNum >= 2) currentEra = "minting";

      setDetails({
        journey: journey,
        phase: phaseNum,
        claimStarted: phaseNum > 0,
        isMintingActive: phaseNum >= 2,
        era: currentEra,
      });

      setInitialCountdown(nextTimestamp * 1000);
    }
  }, [JPMReadData, setInitialCountdown]);

  // 2. Flatten everything into one object for the component
  return {
    ...countdown,         // Spreads days, hours, mins, secs
    phase: details.phase,
    era: details.era,
    journey: details.journey,
    claimStarted: details.claimStarted,
    isMintingActive: details.isMintingActive,
    claimTransition: false, // Defaulting to false to satisfy the UI logic
    mintingTransition: false,
    isJourneyPaused: false,
    phaseNumber: details.phase
  };
}
