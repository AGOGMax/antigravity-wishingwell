"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PiSkullFill } from "react-icons/pi";

interface CellProps {
  cellNumber: number;
  isUserCell: boolean;
  isBurst: boolean;
}

export default function Cell({ cellNumber, isUserCell, isBurst }: CellProps) {
  const [showSkull, setShowSkull] = useState(false);

  return (
    <div
      className={`sm:w-[40px] sm:h-[40px] sm:!text-[8px] md:w-[56px] md:h-[56px] md:!text-[10px] lg:w-[64px] lg:h-[64px] lg:!text-[16px] border-[1px] p-2 bg-transparent flex items-center justify-center border-${isUserCell ? "agyellow" : "aggray"}`}
    >
      {!isBurst ? (
        cellNumber
      ) : (
        <>
          <motion.img
            src="https://i.ibb.co/Mkv8HsBB/pink-mist-cloud-removebg-preview.png"
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
          {showSkull && <PiSkullFill className="!text-[36px] text-aggray" />}
        </>
      )}
    </div>
  );
}
