"use client";

import { HoverTextAnimation } from "@/components/animation/SeparateText";
import Timer from "@/components/global/Timer";
import Button from "@/components/HTML/Button";
import {
  BACKGROUNDS,
  EVIL_ADDRESS_AVAILABLE,
  EVIL_ADDRESS_PRUNE_AVAILABLE,
} from "@/constants";
import { Gradients, Shapes } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import { notFound } from "next/navigation";
import {
  PiCubeDuotone,
  PiLockKeyDuotone,
  PiWrenchDuotone,
} from "react-icons/pi";
import { motion } from "framer-motion";
import useEvilAddress from "@/hooks/core/useEvilAddress";
import { useEffect } from "react";

function ScrapeAndRollOver({
  data,
  evilPrune,
  evilPruneLoading,
}: {
  data: number;
  evilPrune: () => void;
  evilPruneLoading: boolean;
}) {
  // make this false to remove the blur
  const sectionBluredAndCommingSoon = !EVIL_ADDRESS_PRUNE_AVAILABLE;
  return (
    <div
      className={cn(
        "relative border-[1px] border-agorange rounded-[6px] p-[8px] pb-[32px] bg-agwhite/30 backdrop-blur-lg w-full",
        // sectionBluredAndCommingSoon && "blur-lg select-none",
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center w-full gap-[8px] -translate-y-[calc(50%+8px)]",
          // sectionBluredAndCommingSoon && "blur-sm select-none",
        )}
      >
        <motion.div
          initial="initial"
          whileHover="hover"
          className={cn(
            Gradients.darkBlue,
            "relative flex justify-center items-center gap-[8px]",
            "font-bold text-[14px] text-agwhite font-sans text-nowrap",
            "px-[8px] py-[4px] rounded-[6px]",
          )}
        >
          <HoverTextAnimation.Fading text="Scrape and Roll Over To Next Jackpot" />{" "}
          {/* <Tooltip
            trigger={<PiInfoDuotone />}
            positionClassName="absolute top-[calc(100%_+_8px)] right-0"
          >
            hello
          </Tooltip> */}
        </motion.div>
      </div>
      <form
        className={cn(
          "flex flex-col justify-center items-center gap-[8px] ",
          "w-full md:w-[400px]",
          sectionBluredAndCommingSoon && "blur-lg select-none",
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
          <p className="text-agwhite text-[32px] leading-[32px] font-sans w-full">
            {data.toLocaleString("en-US")}
          </p>
          <Button
            initial="initial"
            whileHover="hover"
            onClick={(e) => {
              e.preventDefault();
              evilPrune();
            }}
            loading={evilPruneLoading}
            loadingText="Scraping...."
            disabled={!EVIL_ADDRESS_PRUNE_AVAILABLE || evilPruneLoading}
          >
            <motion.div
              variants={{
                initial: { rotate: 0 },
                hover: {
                  rotate: [0, -10, -10, -10, -20, -20, -20, -30, -30, -30, 0],
                  transition: { duration: 1 },
                },
              }}
              className="origin-top-right"
            >
              {!EVIL_ADDRESS_PRUNE_AVAILABLE || evilPruneLoading ? (
                <PiLockKeyDuotone />
              ) : (
                <PiWrenchDuotone />
              )}
            </motion.div>
            <HoverTextAnimation.RollingIn
              text={
                !EVIL_ADDRESS_PRUNE_AVAILABLE ? "Scrape Inactive" : "Scrape"
              }
            />
          </Button>
        </div>
      </form>
      {sectionBluredAndCommingSoon && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2",
            "flex flex-col justify-start items-start gap-[8px]",
            "p-[8px] rounded-[6px]",
            "bg-agblack/30 backdrop-blur-lg",
            "font-extrabold z-10",
          )}
        >
          <p className="text-agwhite text-[16px] font-sans">Coming Soon</p>
        </div>
      )}
    </div>
  );
}

function MintFromEvilAddress({
  data,
  evilMint,
  evilMintLoading,
  isMintActive,
  mintedOut,
}: {
  data: number;
  evilMint: () => void;
  evilMintLoading: boolean;
  isMintActive: boolean;
  mintedOut: boolean;
}) {
  return (
    <div
      className={cn(
        "border-[1px] border-agorange rounded-[6px] p-[8px] pb-[32px] bg-agwhite/30 backdrop-blur-lg w-full",
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center w-full gap-[8px] -translate-y-[calc(50%+8px)]",
          // isFetched && !mintsAllowed && "blur-sm select-none",
        )}
      >
        <motion.div
          initial="initial"
          whileHover="hover"
          className={cn(
            Gradients.darkBlue,
            "relative flex justify-center items-center gap-[8px]",
            "font-bold text-[14px] text-agwhite font-sans text-nowrap",
            "px-[8px] py-[4px] rounded-[6px]",
          )}
        >
          <HoverTextAnimation.Fading text="Mint For Evil Address" />{" "}
          {/* if u want to add tooltip replace hello to that tooltip  */}
          {/* <Tooltip
            trigger={<PiInfoDuotone />}
            positionClassName="absolute top-[calc(100%_+_8px)] right-0"
          >
            hello
          </Tooltip> */}
        </motion.div>
      </div>
      <form
        className={cn(
          "flex flex-col justify-center items-center gap-[8px] ",
          "w-full md:w-[400px]",
          mintedOut && "blur-lg select-none",
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
          <p className="text-agwhite text-[32px] leading-[32px] font-sans w-full">
            {data.toLocaleString("en-US")}
          </p>
          <Button
            initial="initial"
            whileHover="hover"
            onClick={(e) => {
              e.preventDefault();
              evilMint();
            }}
            disabled={evilMintLoading || !isMintActive}
            loading={evilMintLoading}
            loadingText="Minting..."
          >
            <motion.div
              variants={{
                initial: { scale: 1 },
                hover: {
                  scale: 1.25,
                  transition: { duration: 0.25 },
                },
              }}
            >
              {evilMintLoading || !isMintActive ? (
                <PiLockKeyDuotone />
              ) : (
                <PiCubeDuotone />
              )}
            </motion.div>
            <HoverTextAnimation.RollingIn
              text={!isMintActive ? "Mint Inactive" : "Mint"}
            />
          </Button>
        </div>
      </form>
      {mintedOut && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2",
            "flex flex-col justify-start items-start gap-[8px]",
            "p-[8px] rounded-[6px]",
            "bg-agblack/30 backdrop-blur-lg",
            "font-extrabold z-10",
          )}
        >
          <p className="text-agwhite text-[16px] font-sans">Mint Inactive</p>
        </div>
      )}
    </div>
  );
}

function Vaporize(
  {
    // data,
    // evilMint,
    // evilMintLoading,
    // isMintActive,
    // mintedOut,
  }: {
    // data: number;
    // evilMint: () => void;
    // evilMintLoading: boolean;
    // isMintActive: boolean;
    // mintedOut: boolean;
  },
) {
  return (
    <div
      className={cn(
        "border-[1px] border-agorange rounded-[6px] p-[8px] pb-[32px] bg-agwhite/30 backdrop-blur-lg w-full",
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center w-full gap-[8px] -translate-y-[calc(50%+8px)]",
          // isFetched && !mintsAllowed && "blur-sm select-none",
        )}
      >
        <motion.div
          initial="initial"
          whileHover="hover"
          className={cn(
            Gradients.darkBlue,
            "relative flex justify-center items-center gap-[8px]",
            "font-bold text-[14px] text-agwhite font-sans text-nowrap",
            "px-[8px] py-[4px] rounded-[6px]",
          )}
        >
          <HoverTextAnimation.Fading text="Vaporize" />{" "}
          {/* if u want to add tooltip replace hello to that tooltip  */}
          {/* <Tooltip
            trigger={<PiInfoDuotone />}
            positionClassName="absolute top-[calc(100%_+_8px)] right-0"
          >
            hello
          </Tooltip> */}
        </motion.div>
      </div>
      <form
        className={cn(
          "flex flex-col justify-center items-center gap-[8px] ",
          "w-full md:w-[400px]",
          // mintedOut && "blur-lg select-none",
          "blur-lg select-none",
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
          <p className="text-agwhite text-[32px] leading-[32px] font-sans w-full">
            {/* {data.toLocaleString("en-US")} */}
          </p>
          <Button
            initial="initial"
            whileHover="hover"
            // onClick={(e) => {
            //   e.preventDefault();
            //   evilMint();
            // }}
            disabled
            // disabled={evilMintLoading || !isMintActive}
            // loading={evilMintLoading}
            loadingText="Minting..."
          >
            <motion.div
              variants={{
                initial: { scale: 1 },
                hover: {
                  scale: 1.25,
                  transition: { duration: 0.25 },
                },
              }}
            >
              {/* {evilMintLoading || !isMintActive ? (
                <PiLockKeyDuotone />
              ) : (
                <PiCubeDuotone />
              )} */}

              <PiLockKeyDuotone />
            </motion.div>
            <HoverTextAnimation.RollingIn
              // text={!isMintActive ? "Mint Inactive" : "Mint"}
              text={"Vaporize"}
            />
          </Button>
        </div>
      </form>
      {/* {mintedOut && ( */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2",
          "flex flex-col justify-start items-start gap-[8px]",
          "p-[8px] rounded-[6px]",
          "bg-agblack/30 backdrop-blur-lg",
          "font-extrabold z-10",
        )}
      >
        <p className="text-agwhite text-[16px] font-sans">Coming Soon!</p>
      </div>
      {/* )} */}
    </div>
  );
}

export default function EvilAddressPage() {
  const {
    perPruneChunk,
    evilMint,
    evilMintLoading,
    evilPrune,
    evilPruneLoading,
    isMintActive,
    mintTimestamp,
    mintsAllowed,
    mintedOut,
  } = useEvilAddress();

  useEffect(() => {
    console.log({ isMintActive, mintTimestamp });
  }, [isMintActive, mintTimestamp]);

  if (EVIL_ADDRESS_AVAILABLE === false) {
    return notFound();
  }

  return (
    <div
      style={{
        backgroundImage: `url('${BACKGROUNDS.EVIL_ADDRESS ?? ""}')`,
      }}
      className="flex justify-center items-center min-h-screen bg-cover bg-no-repeat"
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-[50px]",
          "lg:flex lg:flex-row lg:justify-start lg:items-start gap-[30px]",
          "pt-[170px] lg:pt-[208px]",
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-start items-start gap-[8px]",
            "p-[8px] rounded-[6px]",
            "bg-agblack/30 backdrop-blur-lg",
            "text-agwhite",
          )}
        >
          <h1
            className={cn(
              Gradients.whiteGradientText,
              "text-[64px] leading-[64px] font-sans font-extrabold my-0",
            )}
          >
            Evil Address
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center gap-[24px]">
          <ScrapeAndRollOver
            data={perPruneChunk}
            {...{ evilPrune, evilPruneLoading }}
          />
          <MintFromEvilAddress
            data={Number(mintsAllowed) ?? 500}
            evilMint={evilMint}
            evilMintLoading={evilMintLoading}
            isMintActive={isMintActive}
            mintedOut={mintedOut}
          />
          <Vaporize />
          <div
            className={cn(
              "flex flex-col justify-start items-start gap-[8px]",
              "p-[8px] rounded-[6px]",
              "bg-agblack/30 backdrop-blur-lg",
              "font-extrabold",
            )}
          >
            <Timer
              label={!isMintActive ? "Time to next mint" : "Mint Active until"}
              timestamp={mintTimestamp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
