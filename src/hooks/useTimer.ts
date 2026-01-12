import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

// Define the Timer type - Added claimStarted to satisfy the Leaderboard
type Timer = {
  countdown: ReturnType<typeof useCountdownTimer>[0];
  currentJourney: number;
  currentPhase: number;
  claimStarted: boolean; 
};

export default function useTimer(
  timestamp?: "mintEndTimestamp" | "nextJourneyTimestamp",
): Timer {
  const [countdown, setInitialCountdown] = useCountdownTimer(0);
  const [details, setDetails] = useState({
    currentJourney: 0,
    currentPhase: 0,
    claimStarted: false,
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

      setDetails({
        currentJourney: journey,
        currentPhase: phase,
        // If phase is greater than 0, we consider claiming/journey started
        claimStarted: phase > 0, 
      });

      setInitialCountdown(nextTimestamp * 1000);
      console.log("Timer Synced with Blockchain:", { journey, phase, nextTimestamp });
    }
  }, [JPMReadData, setInitialCountdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    currentPhase: details.currentPhase,
    claimStarted: details.claimStarted,
  };
}

export const calculateTimeDifference = (target: number) => {
  const now = Date.now();
  const diff = target - now;
  return diff > 0 ? diff : 0;
};
