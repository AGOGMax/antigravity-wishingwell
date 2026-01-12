import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

// Matches the imports in the rest of your app
export type CountdownType = ReturnType<typeof useCountdownTimer>[0];

export type Timer = {
  countdown: CountdownType;
  currentJourney: number;
  phase: number;           // Changed from currentPhase to phase
  claimStarted: boolean;
  isMintingActive: boolean; // Added this property
  era: "wishwell" | "mining" | "minting"; 
};

export default function useTimer(
  timestamp?: "mintEndTimestamp" | "nextJourneyTimestamp",
): Timer {
  const [countdown, setInitialCountdown] = useCountdownTimer(0);
  const [details, setDetails] = useState({
    currentJourney: 0,
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
      const phase = Number(JPMReadData[1].result);
      const nextTimestamp = Number(JPMReadData[2].result);

      let currentEra: "wishwell" | "mining" | "minting" = "wishwell";
      if (phase === 1) currentEra = "mining";
      if (phase >= 2) currentEra = "minting";

      setDetails({
        currentJourney: journey,
        phase: phase,
        claimStarted: phase > 0,
        isMintingActive: phase >= 2, // Logic for the minting boolean
        era: currentEra,
      });

      setInitialCountdown(nextTimestamp * 1000);
    }
  }, [JPMReadData, setInitialCountdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    phase: details.phase,
    claimStarted: details.claimStarted,
    isMintingActive: details.isMintingActive,
    era: details.era,
  };
}

export const calculateTimeDifference = (target: number) => {
  const now = Date.now();
  const diff = target - now;
  return diff > 0 ? diff : 0;
};
