"use client";

import Timer from "@/components/global/Timer";
import Button from "@/components/HTML/Button";
import useLottery from "@/hooks/core/useLottery";
import { IMAGEKIT_ICONS } from "@/images";
import { Gradients, Shapes } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  PiTrophyDuotone,
  PiWrenchDuotone,
  PiArrowFatDownFill,
} from "react-icons/pi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { HoverTextAnimation } from "@/components/animation/SeparateText";
import { BACKGROUNDS } from "@/constants";
import ProgressingStates, { STEPPERS } from "./ProgressingStates";
import Table from "@/components/HTML/Table";
import useLotteryData from "@/hooks/core/useLotteryData";
import { useAccount } from "wagmi";

export default function LotteryPage() {
  const [lotteryState, setLotteryState] = useState<STEPPERS>({
    big: "success",
    bigger: "pending",
    biggest: "pending",
  });
  const account = useAccount();

  const {
    nextLotteryTimestamp,
    lotteryPayout,
    fuelCellsWon,
    pruneBatch,
    pruneLoading,
    currentJourney,
    lotteriesInfo,
    batchPrune,
  } = useLottery();

  const { jackpotMintedInJourney, totalFuelCellsInJourney, tableData } =
    useLotteryData();

  const handlePruneWinnings = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    batchPrune();
  };

  useEffect(() => {
    const lotteryIdAnnounced = lotteriesInfo?.lotteryId;

    switch (lotteryIdAnnounced) {
      case "1": {
        setLotteryState({
          big: "success",
          bigger: "progress",
          biggest: "pending",
        });
        return;
      }
      case "2": {
        setLotteryState({
          big: "success",
          bigger: "success",
          biggest: "progress",
        });
        return;
      }
      case "3": {
        setLotteryState(
          currentJourney === Number(lotteriesInfo?.journeyId)
            ? {
                big: "success",
                bigger: "success",
                biggest: "success",
              }
            : { big: "progress", bigger: "pending", biggest: "pending" },
        );
        return;
      }
      default: {
        setLotteryState({
          big: "progress",
          bigger: "pending",
          biggest: "pending",
        });
        return;
      }
    }
  }, [lotteriesInfo]);

  const tableConfig = {
    header: [
      <div
        key="lottery header"
        className="flex flex-col justify-center items-center"
      >
        Lottery <br />
      </div>,
      <div
        key="$Dark header"
        className="flex flex-col justify-center items-center"
      >
        $Dark
      </div>,
      <div
        key="Evil bonus header"
        className="flex flex-col justify-center items-center"
      >
        Evil Bonus
      </div>,
      <div
        key="Total payout header"
        className="flex flex-col justify-center items-center"
      >
        Next Jackpot
      </div>,
    ],
    data: tableData.map((row) => {
      return row.map((cell, i) => {
        if (typeof cell === "object" && "sticker" in cell && "value" in cell) {
          return {
            value: `${cell.value}`,
            sticker: (
              <div className="absolute text-successgreen font-bold uppercase text-[10px] left-0 top-1/2 -translate-y-1/2 -rotate-45 p-[8px]">
                <div className="w-full h-[1px] bg-successgreen"></div>
                {cell.sticker}
                <div className="w-full h-[1px] bg-successgreen"></div>
              </div>
            ),
          };
        }
        return cell;
      });
    }),
  };

  return (
    <div
      style={{
        backgroundImage: `url('${BACKGROUNDS.LOTTERY ?? ""}')`,
      }}
      className="relative flex justify-center items-center min-h-screen bg-center bg-cover bg-no-repeat pt-[180px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[black] via-[#0000] to-[black]"></div>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-[50px] z-[1] lg:mt-[32px]",
          "lg:flex lg:flex-row lg:justify-start lg:items-start gap-[30px]",
        )}
      >
        {/* Left side */}
        <div className="flex flex-col gap-[8px] w-full lg:max-w-[40vw]">
          <div
            className={cn(
              "flex flex-row justify-start items-center gap-[8px]",
              "p-[8px] rounded-[6px]",
              "bg-agblack/30 backdrop-blur-lg",
              "text-agwhite",
            )}
          >
            <h1 className="text-[32px] text-center leading-[32px] lg:text-[64px] lg:leading-[64px] font-sans font-extrabold text-agwhite">
              Check To See If You&apos;ve Won!
              <PiArrowFatDownFill className="lg:-rotate-90 text-[32px] lg:text-[72px] font-extrabold inline mb-2 ml-[20px]  stroke-[10px] stroke-agyellow" />
            </h1>
          </div>
          <div className="grid grid-flow-row md:grid-flow-col place-items-center gap-2 w-full">
            <div className="bg-gradient-to-b from-[#B4EBF8] to-[#789DFA] p-[1px] rounded-[3px] w-full">
              <div
                className={cn(
                  Gradients.tableBlue,
                  "relative border border-1 border-agyellow rounded-[3px] px-[16px] py-[8px]",
                )}
              >
                <h3 className="uppercase font-sans tracking-widest text-[12px] text-agwhite">
                  Active Fuel Cells in Journey {currentJourney}:
                </h3>
                <p className="font-general-sans font-bold text-[18px] text-agwhite">
                  {Number(totalFuelCellsInJourney).toLocaleString("en-US")} Fuel
                  Cells
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-b from-[#B4EBF8] to-[#789DFA] p-[1px] rounded-[3px] w-full">
              <div
                className={cn(
                  Gradients.tableBlue,
                  "relative border border-1 border-agyellow rounded-[3px] px-[16px] py-[8px]",
                )}
              >
                <h3 className="uppercase font-sans tracking-widest text-[12px] text-agwhite">
                  Jackpot minted in journey {currentJourney}:
                </h3>
                <p className="font-general-sans font-bold text-[18px] text-agwhite">
                  {Number(jackpotMintedInJourney).toLocaleString("en-US")} $Dark
                  Tokens
                </p>
              </div>
            </div>
          </div>
          <Table
            header={tableConfig.header}
            body={tableConfig.data}
            className="hidden lg:block lg:w-full max-w-full"
            headerClassName="font-sans tracking-widest text-[12px]"
            bodyClassName="text-center flex justify-center items-center font-general-sans font-bold text-[18px]"
          />
        </div>

        {/* Right side */}
        <div className="lg:w-[400px] flex flex-col justify-center items-center gap-[24px] mb-[16px] lg:mb-0 w-full">
          <form
            className={cn(
              "flex flex-col justify-center items-center gap-[8px] ",
              "w-full",
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
                "relative",
              )}
            >
              <div className="flex flex-col justify-end items-center gap-[8px]">
                <div className="flex justify-center items-center gap-[8px]">
                  <PiTrophyDuotone className="text-[20px] text-agwhite" />
                  <h3 className="uppercase font-sans tracking-widest text-[16px] uppercase text-agwhite">
                    Total Amount Won:
                  </h3>
                </div>
                <div className="flex flex-col justify-center items-center gap-y-[8px] text-[16px] leading-[12px] font-general-sans py-3 font-extrabold w-full">
                  <div className="flex justify-around items-center w-full">
                    <p className="font-sans font-extrabold text-[32px] text-agwhite">
                      {fuelCellsWon}
                    </p>

                    <motion.div
                      initial="initial"
                      whileHover="hover"
                      className={cn(
                        Gradients.lightBlue,
                        Shapes.pill,
                        "text-agblack font-semibold font-general-sans !text-[16px]",
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

                <div className="w-[70%] m-auto h-[1px] bg-agyellow"></div>

                <div className="flex justify-around items-center w-full py-3">
                  <p className="text-agwhite text-[32px] leading-[32px] font-sans">
                    {Number(
                      formatUnits(BigInt(lotteryPayout), 18),
                    ).toLocaleString("en-US")}
                  </p>
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
                      alt="Fuel Cell"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] rounded-full"
                    />
                    <HoverTextAnimation.Fading text="Dark Matter" />
                  </motion.div>
                </div>

                <Button
                  onClick={handlePruneWinnings}
                  initial="initial"
                  whileHover="hover"
                  loading={pruneLoading}
                  disabled={fuelCellsWon < 1 || !account.isConnected}
                  loadingText={`${pruneBatch.from}-${pruneBatch.to}/${pruneBatch.total}`}
                  className={cn(
                    "text-[24px] border-[1px] border-agyellow mb-3",
                    Gradients.blueToRed,
                  )}
                >
                  <motion.div
                    variants={{
                      initial: { rotate: 0 },
                      hover: {
                        rotate: [
                          0, -10, -10, -10, -20, -20, -20, -30, -30, -30, 0,
                        ],
                        transition: { duration: 1 },
                      },
                    }}
                    className="origin-top-right"
                  >
                    <PiWrenchDuotone />
                  </motion.div>
                  {fuelCellsWon < 1 || !account.isConnected ? (
                    "Scrape"
                  ) : (
                    <HoverTextAnimation.RollingIn text="Scrape" />
                  )}
                </Button>
              </div>
            </div>
          </form>
          <div
            className={cn(
              "flex flex-col justify-start items-start gap-[8px]",
              "p-[8px] rounded-[6px]",
              "bg-agblack/30 backdrop-blur-lg",
              "font-extrabold",
              "w-full",
            )}
          >
            <Timer label="Next Lottery in:" timestamp={nextLotteryTimestamp} />
          </div>
          <div
            className={cn(
              "flex flex-col justify-start items-start gap-[8px] w-full",
              "px-[16px] py-[16px] rounded-[6px]",
              "bg-agblack/30 backdrop-blur-lg",
              "font-extrabold",
            )}
          >
            <ProgressingStates
              states={lotteryState}
              journeyId={`${currentJourney}`}
            />
          </div>

          <Table
            header={tableConfig.header}
            body={tableConfig.data}
            className="block lg:hidden"
            headerClassName="font-sans tracking-widest text-[12px] text-agwhite"
            bodyClassName="text-center flex justify-center items-center font-general-sans font-bold text-[18px] text-agwhite"
          />
        </div>
      </div>
    </div>
  );
}
