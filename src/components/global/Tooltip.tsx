import { Gradients } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface TooltipProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  positionClassName: Parameters<typeof cn>[0];
  action?: "hover" | "click";
  timeOut?: number;
}

export default function Tooltip({
  trigger,
  children,
  positionClassName,
  action = "hover",
  timeOut = 2000,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        onMouseOver={() => action == "hover" && setOpen(true)}
        onMouseLeave={() => action == "hover" && setOpen(false)}
        onClick={() => {
          action == "click" && setOpen(true);
          action == "click" &&
            setTimeout(() => {
              setOpen(false);
            }, timeOut);
        }}
      >
        {trigger}
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              Gradients.redToBlue,
              `z-[100] ${positionClassName}`,
              "rounded-[8px] p-[2px] w-fit",
            )}
          >
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                `${action == "click" ? "flex" : "hidden lg:flex"}`,
                "justify-between items-center",
                "bg-agblack rounded-[inherit]",
                "px-[16px] py-[8px]",
              )}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
