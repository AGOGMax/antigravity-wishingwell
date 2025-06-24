// Tools Website

"use client";

import { cn } from "@/lib/tailwindUtils";
import React from "react";
import { motion, MotionProps } from "framer-motion";
import { PiSpinnerDuotone } from "react-icons/pi";
import { AutomaticTextAnimation } from "../animation/SeparateText";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps & MotionProps> = ({
  className,
  loading = false,
  loadingText = "Loading",
  children,
  ...buttonProps
}) => {
  return (
    <motion.button
      className={cn(
        "px-[16px] py-[12px] rounded-[4px]",
        "bg-brblue shadow-[0_4px_0_black] hover:shadow-[0_0_0_black] hover:translate-y-[4px] transition-all duration-150",
        "text-agwhite font-sans font-extrabold text-[16px] leading-[16px] uppercase tracking-widest",
        "grid place-items-center grid-flow-col gap-[8px]",
        "[&_svg]:text-[24px]",
        "disabled:opacity-[0.5] disabled:cursor-not-allowed disabled:select-none",
        "active:bg-agblack",
        loading && "translate-y-[4px] cursor-wait",
        buttonProps.disabled && "cursor-not-allowed translate-y-[4px]",
        className, // Merge the passed className with the default classes
      )}
      {...buttonProps}
    >
      {loading ? (
        <>
          <motion.div
            initial={{ rotate: 0 }}
            animate={{
              rotate: 360,
              transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            <PiSpinnerDuotone />
          </motion.div>
          <AutomaticTextAnimation.TypingWithRandomDelay
            text={loadingText}
            loopDuration={2.5}
          />
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
