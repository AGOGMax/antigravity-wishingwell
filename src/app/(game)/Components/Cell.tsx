"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PiSkullFill } from "react-icons/pi";

interface CellProps {
  cellNumber: number;
}

export default function Cell({ cellNumber }: CellProps) {
  const [isBurst, setIsBurst] = useState(false);
  const [showSkull, setShowSkull] = useState(false);

  return (
    <div
      className="sm:w-[40px] sm:h-[40px] sm:!text-[8px] md:w-[56px] md:h-[56px] md:!text-[10px] lg:w-[64px] lg:h-[64px] lg:!text-[16px] border-[1px] p-2 border-agyellow bg-transparent flex items-center justify-center"
      onClick={() => {
        setIsBurst((prev) => !prev);
        console.log("burst clicked");
      }}
    >
      {!isBurst ? (
        cellNumber
      ) : (
        <>
          <motion.img
            src="https://i.ibb.co/fd8z8pq5/pink-explosion-without-bottom.png"
            alt="Pink Mist"
            className={`${!isBurst ? "invisible " : "visible"}`}
            initial={{ opacity: 1, scale: 1, width: "30px" }}
            animate={
              isBurst
                ? { opacity: 0, scale: 10, width: "300px", display: "none" }
                : {}
            }
            transition={{ duration: 5, ease: "easeOut" }}
            style={{ pointerEvents: "none" }}
            onAnimationComplete={() => setShowSkull(true)}
          />
          {showSkull && <PiSkullFill className="!text-[36px]" />}
        </>
      )}
    </div>
  );
}
