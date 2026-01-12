import React, { useEffect, useMemo, useState } from "react";
import useTimer, { calculateTimeDifference } from "@/hooks/frontend/useTimer";
import DynamicNumberCounter from "../../DynamicNumberCounter";
import AutomaticIncreamentalNumberCounter from "../../AutomaticIncreamentalNumberCounter";
import { IMAGEKIT_IMAGES } from "@/assets/imageKit";
import { useRestPost } from "@/hooks/useRestClient";
import { getEra } from "@/utils";

// ... (Note: I am providing the logic part where the error occurs)
// To ensure the build passes, look for the 'activeState' section around line 210-225

export default function Spinner() {
  const activeState = useTimer();
  const [rotation, setRotation] = useState(0);

  // This is the specific block that was causing the "Type error"
  const spinnerProps = {
     era: activeState.era,
     journey: activeState.journey,
     // We add "as 1 | 2 | 3 | 4" to satisfy the strict TypeScript compiler
     activePhase: activeState.isMintingActive
       ? (activeState.phaseNumber as 1 | 2 | 3 | 4)
       : (activeState.phase as 1 | 2 | 3 | 4),
     mintingActive: activeState.isMintingActive,
  };

  // ... rest of your large Spinner component code continues here ...
  return (
    <div>
      {/* Your existing Spinner JSX code */}
    </div>
  );
}
