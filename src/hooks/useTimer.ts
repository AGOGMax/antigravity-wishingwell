// Tools Website

import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Fetch timestamps data if not already cached
    if (cachedTimestamps === null) {
      fetch(
        "https://ag-api-test.simplrhq.com/api/era-3-timestamps-multipliers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          // Cache the fetched data
          cachedTimestamps = data;
          // Update countdown timer and details state with fetched data
          setInitialCountdown(data[timestamp]);
          setDetails({
            currentJourney: data.currentJourney,
            currentPhase: data.currentPhase,
          });
        })
        .catch((error) => {
          console.error("Error fetching timestamps data:", error);
        });
    }
  }, [countdown]);

  return {
    countdown,
    currentJourney: details.currentJourney,
    currentPhase: details.currentPhase,
  };
}
