"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PiSkullFill } from "react-icons/pi";
import useSound from "use-sound";

interface CellProps {
  cellNumber: number;
  isUserCell: boolean;
  isBurst: boolean;
}

export default function Cell({ cellNumber, isUserCell, isBurst }: CellProps) {
  const burstSound = "/burstSound.mp3";
  const [playBurst] = useSound(burstSound);
  const [showSkull, setShowSkull] = useState(false);

  useEffect(() => {
    if (isBurst) {
      playBurst();
    }
  }, [isBurst]);

  return (
    <div
      className={`w-[32px] h-[32px] !text-[8px] border-[1px] p-2 bg-transparent flex items-center justify-center border-${isUserCell ? "agyellow" : "aggray"}`}
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
