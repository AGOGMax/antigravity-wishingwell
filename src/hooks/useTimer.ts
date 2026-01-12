import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

// Added "minting" to the era type to satisfy the compiler
export type Timer = {
  countdown: ReturnType<typeof useCountdownTimer>[0];
  currentJourney: number;
  currentPhase: number;
  claimStarted: boolean;
  era: "wishwell" | "mining" | "minting"; 
};

export default function useTimer(
  timestamp?: "mintEndTimestamp" | "nextJourneyTimestamp",
): Timer {
  const [countdown, setInitialCountdown] = useCountdownTimer(0);
  const [details, setDetails] = useState({
    currentJourney: 0,
    currentPhase: 0,
    claimStarted: false,
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

      // Determine era based on contract phase
      // Phase 0: Wishwell | Phase 1: Mining | Phase 2+: Minting
      let currentEra: "wishwell" | "mining" | "minting" = "wishwell";
      if (phase === 1) currentEra = "mining";
      if (phase >= 2) currentEra = "minting";

      setDetails({
        currentJourney: journey,
        currentPhase: phase,
        claimStarted: phase > 0,
        era: currentEra,
      });

      setInitialCountdown(nextTimestamp * 1000);
    }
  }, [JPMReadData, setInitialCountdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    currentPhase: details.currentPhase,
    claimStarted: details.claimStarted,
    era: details.era,
  };
}

export const calculateTimeDifference = (target: number) => {
  const now = Date.now();
  const diff = target - now;
  return diff > 0 ? diff : 0;
};
