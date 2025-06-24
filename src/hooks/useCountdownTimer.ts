// Tools Website

"use client";

import { useEffect, useState } from "react";

// Define the Timer type to represent the countdown timer state
type Timer = {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  remainingTime: number;
  isEnded: boolean;
};

// Custom hook to manage a countdown timer
export default function useCountdownTimer(
  initialTimeInSeconds: number,
  onTimerEnd?: () => void,
): [Timer, (newInitialTime: number) => void] {
  // State to store the initial time given for the countdown
  const [initialTime, setInitialTime] = useState<number>(initialTimeInSeconds);
  // State to store the remaining time
  const [remainingTime, setRemainingTime] = useState<number>(initialTime);

  useEffect(() => {
    // Calculate the current time in seconds
    const currentTime = Math.floor(new Date().getTime() / 1000);
    // Set the remaining time based on the initial time
    setRemainingTime(() => initialTime - currentTime);

    // Set up an interval to update the remaining time every second
    const timer = setInterval(() => {
      setRemainingTime((prevTime: number) => {
        if (prevTime <= 0) {
          if (onTimerEnd) {
            onTimerEnd();
          }
          return 0; // Stop the timer when it reaches zero
        }
        return prevTime - 1; // Decrease the remaining time by one second
      });
    }, 1000);

    // Clean up the interval when the component is unmounted or initialTime changes
    return () => clearInterval(timer);
  }, [initialTime]);

  return [
    {
      seconds: remainingTime % 60,
      minutes: Math.floor((remainingTime / 60) % 60),
      hours: Math.floor((remainingTime / 3600) % 24),
      days: Math.floor(remainingTime / 86400),
      remainingTime: remainingTime,
      isEnded: remainingTime <= 0,
    },
    setInitialTime,
  ];
}
