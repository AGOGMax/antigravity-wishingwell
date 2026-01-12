// Tools Website

import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { TEST_NETWORK } from "@/constants";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useCountdownTimer from "./useCountdownTimer";
// Define the Timer type to represent the state returned by the useTimer hook
type Timer = {
  countdown: ReturnType<typeof useCountdownTimer>[0];
  currentJourney: number;
  currentPhase: number;
};

// Cache for storing fetched timestamps data
let cachedTimestamps: null | Record<string, any> = null;

/**
 * Custom hook to manage timer state including countdown, journey, and phase.
 * @returns {Timer} The current state of the timer.
 */
export default function useTimer(
  timestamp: "mintEndTimestamp" | "nextJourneyTimestamp",
): Timer {
  // Initialize countdown timer with 0 seconds
  const [countdown, setInitialCountdown] = useCountdownTimer(0);

  // State to store journey and phase details
  const [details, setDetails] = useState<{
    currentJourney: number;
    currentPhase: number;
  }>({
    currentJourney: 0,
    currentPhase: 0,
  });

  // 1. We ask the Blockchain (JPM Contract) for the current status
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

  // 2. We take that data and format it so the timer understands it
  useEffect(() => {
    if (JPMReadData && JPMReadData[0]?.result !== undefined) {
      const journey = Number(JPMReadData[0].result);
      const phase = Number(JPMReadData[1].result);
      const timestamp = Number(JPMReadData[2].result);

      // We update the timer's "details" (Journey and Phase numbers)
      setDetails({
        currentJourney: journey,
        currentPhase: phase,
      });

      // We tell the countdown to start ticking toward the new timestamp
      // (* 1000 converts Blockchain Seconds to Website Milliseconds)
      setInitialCountdown(timestamp * 1000);

      console.log("Timer Synced with Blockchain:", { journey, phase, timestamp });
    }
  }, [JPMReadData, setInitialCountdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    currentPhase: details.currentPhase,
  };
}
