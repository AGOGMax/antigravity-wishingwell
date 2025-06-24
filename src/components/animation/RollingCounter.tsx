"use client";

import { cn } from "@/lib/tailwindUtils";
import { motion, MotionProps } from "framer-motion";
import React, { useEffect, useState } from "react";

interface RollingCounterProps extends React.HTMLProps<HTMLDivElement> {
  num: number;
}

export default function RollingCounter({
  num,
  ...divProps
}: RollingCounterProps & MotionProps) {
  const [currentNum, setCurrentNum] = useState(0);

  useEffect(() => {
    if (num === currentNum) return;
    setCurrentNum(num);
  }, [num]);

  return (
    <>
      {num === currentNum ? (
        <motion.div
          initial={{
            opacity: 0,
            y: "1em",
          }}
          animate={{ opacity: 1, y: "0em" }}
          {...divProps}
        >
          {currentNum}
        </motion.div>
      ) : (
        <div className={cn("opacity-0", divProps.className)} {...divProps}>
          {currentNum}
        </div>
      )}
    </>
  );
}
