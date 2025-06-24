"use client";

import Timer from "@/components/global/Timer";
import { IMAGEKIT_ICONS } from "@/images";
import { Gradients, Shapes } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HoverTextAnimation } from "@/components/animation/SeparateText";
import { AGPROJECT_LINK, BACKGROUNDS } from "@/constants";
import useTreasury from "@/hooks/core/useTreasury";
import { useAccount } from "wagmi";

export default function TreasuryPage() {
  const {
    fuelCellSupply,
    totalYieldDistributed,
    isMintActive,
    nextMintTimestamp,
    nextPhaseTimestamp,
    userMinted,
    onTimerEnd,
  } = useTreasury();

  const account = useAccount();
  return (
    <div
      style={{
        backgroundImage: `url('${BACKGROUNDS.TREASURY ?? ""}')`,
      }}
      className="relative flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[black] via-[#0000] to-[black]"></div>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-[50px] z-[1]",
          "lg:flex lg:flex-row lg:justify-start lg:items-start gap-[30px]",
          "md:mt-[32px] pt-[130px] md:pt-[80px]",
        )}
      >
        {/* Left side */}
        <div
          className={cn(
            "flex flex-col justify-start items-start gap-[8px]",
            "p-[16px] rounded-[6px]",
            "bg-agblack/70 backdrop-blur-lg",
            "text-agwhite",
          )}
        >
          <h1 className="text-[64px] leading-[64px] font-sans font-extrabold text-agwhite">
            Treasury
          </h1>
          <div
            className={cn(
              Shapes.dataCard,
              "border-[1px] border-agyellow px-[24px] px-[16px] w-full",
            )}
          >
            <h4 className="uppercase font-bold text-agyellow text-[16px] leading-[24px] font-sans font-extrabold">
              Total Fuel Cells:
            </h4>
            {account.isConnected ? (
              <div className="flex items-center justify-between">
                <span className="text-agwhite text-[32px] font-extrabold text-agwhite">
                  {userMinted}
                </span>
                <motion.div
                  initial="initial"
                  whileHover="hover"
                  className={cn(
                    Gradients.lightBlue,
                    Shapes.pill,
                    "text-agblack font-semibold font-general-sans",
                  )}
                >
                  <Image
                    src={IMAGEKIT_ICONS.FUEL_CELL}
                    alt="Fuel Cell"
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px] mix-blend-multiply rounded-full"
                  />
                  <HoverTextAnimation.Fading text="Fuel Cells" />
                </motion.div>
              </div>
            ) : (
              <span className="text-agwhite text-[16px] font-semibold">
                Connect your wallet to check your Fuel Cell balance
              </span>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex flex-col justify-center items-center gap-[24px]">
          <div
            className={cn(
              "flex flex-col justify-center items-center gap-[8px] ",
              "w-full md:w-[400px]",
            )}
          >
            <div
              className={cn(
                Gradients.tableBlue,
                Shapes.dataCard,
                "border-[1px] border-agyellow",
                "grid grid-flow-col gap-[8px]",
                "font-extrabold",
                "w-full",
                "flex justify-between items-center",
              )}
            >
              <div className="flex flex-col justify-start items-start">
                <small className="uppercase font-semibold text-agwhite">
                  YIELD PAID OUT SO FAR:
                </small>
                <p className="text-[32px] text-agwhite">
                  {Number(totalYieldDistributed.toFixed(2)).toLocaleString(
                    "en-US",
                  )}
                </p>
              </div>
              <motion.div
                initial="initial"
                whileHover="hover"
                className={cn(
                  Gradients.lightBlue,
                  Shapes.pill,
                  "text-agblack font-semibold font-general-sans",
                )}
              >
                <Image
                  src={IMAGEKIT_ICONS.PILL_DARK_X_CLAIMED}
                  alt="Unclaimed Dark X"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px] rounded-full"
                />
                <HoverTextAnimation.Fading text="Dark" />
              </motion.div>
            </div>
            <div
              className={cn(
                Gradients.tableBlue,
                Shapes.dataCard,
                "border-[1px] border-agyellow",
                "grid grid-flow-col gap-[8px]",
                "font-extrabold",
                "w-full",
                "flex justify-between items-center",
              )}
            >
              <div className="flex flex-col justify-start items-start">
                <small className="uppercase font-semibold text-agwhite">
                  TOTAL ACTIVE FUEL CELLS:
                </small>
                <p className="text-[32px] text-agwhite">
                  {fuelCellSupply?.toLocaleString("en-US")}
                </p>
              </div>
              <motion.div
                initial="initial"
                whileHover="hover"
                className={cn(
                  Gradients.lightBlue,
                  Shapes.pill,
                  "text-agblack font-semibold font-general-sans",
                )}
              >
                <Image
                  src={IMAGEKIT_ICONS.FUEL_CELL}
                  alt="Fuel Cell"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px] mix-blend-multiply rounded-full"
                />
                <HoverTextAnimation.Fading text="Fuel Cells" />
              </motion.div>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col justify-start items-start gap-[8px]",
              "p-[8px] rounded-[6px]",
              "bg-agblack/70 backdrop-blur-lg",
              "font-extrabold",
            )}
          >
            <Timer
              label={
                isMintActive ? "Minting Active for:" : "NEXT MINT STARTS IN:"
              }
              timestamp={
                isMintActive
                  ? Number(nextPhaseTimestamp)
                  : Number(nextMintTimestamp)
              }
              onTimerEnd={onTimerEnd}
            />
          </div>
          {isMintActive && (
            <Link
              href={AGPROJECT_LINK + "/minting"}
              target="_blank"
              className={cn(
                Gradients.redToBlue,
                "relative rounded-[8px] p-[2px] w-fit",
              )}
            >
              <motion.div
                initial="initial"
                whileHover="hover"
                className="underline underline-offset-2 text-agwhite font-sans font-semibold uppercase tracking-widest px-[16px] py-[8px] rounded-[6px] bg-agblack h-"
              >
                <HoverTextAnimation.RollingIn text="Mint Now!" />
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
