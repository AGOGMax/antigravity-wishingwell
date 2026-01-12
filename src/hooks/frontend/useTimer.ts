import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "../useCountdownTimer";

// Define the Timer type
type Timer = {
  countdown: ReturnType<typeof useCountdownTimer>[0];
  currentJourney: number;
  currentPhase: number;
};

export default function useTimer(
  timestamp: "mintEndTimestamp" | "nextJourneyTimestamp",
): Timer {
  // Initialize countdown timer
  const [countdown, setInitialCountdown] = useCountdownTimer(0);

  // State for journey and phase
  const [details, setDetails] = useState({
    currentJourney: 0,
    currentPhase: 0,
  });

  // 1. Connect to the Smart Contract
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

  // 2. Update the Timer when Blockchain data arrives
  useEffect(() => {
    if (JPMReadData && JPMReadData[0]?.result !== undefined) {
      const journey = Number(JPMReadData[0].result);
      const phase = Number(JPMReadData[1].result);
      const nextTimestamp = Number(JPMReadData[2].result);

      setDetails({
        currentJourney: journey,
        currentPhase: phase,
      });

      // Convert Blockchain seconds to Website milliseconds
      setInitialCountdown(nextTimestamp * 1000);
      
      console.log("Timer Synced with Blockchain:", { journey, phase, nextTimestamp });
    }
  }, [JPMReadData, setInitialCountdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    currentPhase: details.currentPhase,
  };
}
