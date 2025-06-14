"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { twMerge } from "tailwind-merge";
import H3 from "@/components/HTML/H3";
import { IMAGEKIT_ICONS, IMAGEKIT_LOGOS } from "@/assets/imageKit";
import pointsConverterToUSCommaseparated from "./pointsConverterToUSCommaseparated";
import H1 from "./HTML/H1";
import P from "./HTML/P";
import { RankToRewardMapping } from "./RankToRewardMapping";

function TH({
  icon,
  heading,
  className,
  variants = {} as Variants,
}: {
  icon: string | StaticImport;
  heading: string;
  className?: string;
  variants?: Variants;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.th
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={twMerge(
        `relative bg-[#0A0025] border-[2px] lg:border-[2px] border-transparent bg-clip-padding flex flex-col lg:flex-row justify-between z-0 px-3 py-[10px] w-full
            before:content-[''] before:absolute before:inset-0 before:z-[-10] before:bg-gradient-to-bl before:from-[#3C00DC] before:to-[#FF5001] before:rounded-[inherit] before:overflow-hidden before:mb-[-1px] before:ml-[-1px] lg:before:m-[-1px]
			after:content-[''] after:absolute after:inset-0 after:z-[-2] after:bg-agblack after:rounded-[inherit] after:overflow-hidden`,
        className,
      )}
    >
      <H3>
        <motion.div
          animate={hover ? "hover" : ""}
          variants={variants}
          className="w-[25px] h-[25px]"
        >
          <Image
            src={icon}
            alt={`${heading} icon`}
            width={25}
            height={25}
            className={`object-cover ${heading === "Rewards" ? "w-[20px]" : "w-[25px] h-[25px]"}`}
          />
        </motion.div>
        {heading}
      </H3>
    </motion.th>
  );
}

function truncatinator(str: string) {
  return (
    str?.substring(0, 6) + "..." + str?.substring(str?.length - 4, str?.length)
  );
}

function TD({
  children,
  truncate = false,
  special = false,
  className,
  border = false,
}: {
  children: React.ReactNode;
  truncate?: boolean;
  special?: boolean;
  className?: string;
  border?: boolean;
}) {
  const [truncateHover, setTruncateHover] = useState(false);
  function truncateHoverTrue() {
    setTruncateHover(true);
  }

  function truncateHoverFalse() {
    setTruncateHover(false);
  }

  if (truncate && children && typeof children === "string") {
    return (
      <AnimatePresence>
        <td
          onMouseEnter={truncateHoverTrue}
          onMouseLeave={truncateHoverFalse}
          className={twMerge(
            "text-[14px] relative border-r-2 border-[#414343] md:border-[#8275A5] bg-clip-padding hidden md:flex flex-col md:flex-row justify-start items-center z-10 px-[12px] py-[6px] w-full truncate hover:overflow-visible",
            special && "text-[18px]",
            className,
          )}
        >
          {truncateHover ? (
            <>
              <motion.div
                animate={{
                  opacity: 1,
                }}
                initial={{
                  opacity: 0,
                }}
                transition={{ duration: 0.2, delay: 0.5 }}
                className={twMerge(
                  "absolute top-[50%] left-[50%] p-2 -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-blue text-center text-agwhite z-10 shadow-[0_0_4px_0_#000]",
                  special && " text-[18px] bg-agyellow text-black ",
                )}
              >
                {children}
              </motion.div>
              {truncatinator(children)}
            </>
          ) : (
            truncatinator(children)
          )}
        </td>
      </AnimatePresence>
    );
  }
  return (
    <td
      className={twMerge(
        "text-[14px] relative border-r-2 border-[#414343] md:border-[#8275A5] bg-clip-padding flex flex-col justify-center md:justify-start md:items-center gap-[4px] md:gap-4 md:flex-row z-0 p-[8px] md:px-[12px] md:py-[6px]",
        special && !border && "border-none text-[18px] py-[10px]",
        border && special && "border-r-2 text-[18px] py-[10px]",
        className,
      )}
    >
      {children}
    </td>
  );
}

function TR({
  children,
  className,
  special = false,
  empty = false,
  th = false,
  position,
}: {
  children: React.ReactNode;
  className?: string;
  special?: boolean;
  empty?: boolean;
  th?: boolean;
  position?: number;
}) {
  return (
    <motion.tr
      layout
      animate={{
        y: "0",
        opacity: 1,
      }}
      initial={{
        y: th ? "0%" : "100%",
        opacity: th ? 1 : 0,
      }}
      exit={{
        y: "100%",
        opacity: 0,
      }}
      transition={{
        duration: 0.25,
        type: "spring",
        delay: position ? parseFloat((position * 0.1).toFixed(2)) : 0,
      }}
      className={twMerge(
        "relative grid grid-cols-[2fr_1fr] md:grid-cols-[2fr_1fr_1fr_1fr] w-full md:border-l-2 border-b-2 border-[#414343] md:border-[#8275A5] z-0",
        special && " text-black font-extrabold  border-none",
        empty &&
          "bg-gradient-to-b from-[#142266] via-[#0A1133] to-[#142266] border-r-2",
        th && "border-none",
        className,
      )}
    >
      {special && (
        <div className="absolute top-0 left-0 w-[calc(100%_+_24px)] h-full translate-x-[-12px] z-[-1] bg-agyellow rounded-lg"></div>
      )}
      {children}
    </motion.tr>
  );
}

function Badge({
  children,
  special = false,
}: {
  children: React.ReactNode;
  special?: boolean;
}) {
  return (
    <div
      className={twMerge(
        "text-[12px] leading-[12px] relative flex items-center gap-[8px] justify-center font-sans font-extrabold text-agwhite rounded-full py-[4px] px-[8px] border-2 uppercase tracking-widest w-fit text-nowrap",
        special &&
          "text-[12px] leading-[13.88px] pt-[5px] text-agyellow font-extrabold bg-gradient-to-b from-[#0A1133] to-[#142266] border-none",
      )}
    >
      {children}
    </div>
  );
}

function Rank({
  rank,
  wallet,
  special = false,
  badge,
}: {
  rank: number;
  wallet: string;
  special?: boolean;
  badge: string;
}) {
  return (
    <TD special={special} border className="w-full">
      #{rank} <Badge special={special}>{badge}</Badge>
      <div
        className={`flex gap-[8px] justify-start items-center md:hidden ${
          special
            ? "text-[22px] leading-[28.6px] md:text-[18px] md:leading-[23.6px]"
            : "text-[18px] leading-[23.4px]"
        }`}
      >
        {special ? (
          <Image
            src={IMAGEKIT_ICONS.WALLET_BLACK}
            alt="wallet icon"
            width={25}
            height={25}
            className="object-cover"
          />
        ) : (
          <Image
            src={IMAGEKIT_ICONS.WALLET_WHITE}
            alt="hammer icon"
            width={25}
            height={25}
            className={twMerge("object-cover")}
          />
        )}
        {truncatinator(wallet)}
      </div>
    </TD>
  );
}

function Reward({ badge }: { badge: string; special?: boolean }) {
  return (
    <TD border className="w-full">
      <div
        className={`flex gap-[8px] justify-start items-start text-[16px] leading-[23.4px]`}
      >
        <Image
          src={IMAGEKIT_ICONS.GIFT_WHITE}
          alt="reward icon"
          width={60}
          height={60}
          className="object-cover md:hidden" // Show only on mobile if desired
        />
        {RankToRewardMapping[badge as keyof typeof RankToRewardMapping]}
      </div>
    </TD>
  );
}

type tableDataType = {
  rank: number;
  badge: string;
  wallet: string;
  points: number;
  special?: boolean;
} | null;

export default function Table({
  tableData: currentTableData,
}: {
  tableData: tableDataType[];
}) {
  const [tableData, setTableData] = useState<tableDataType[]>(currentTableData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // then null fields are added to the tableData array to make the tableData length 10
    setTableData([]);
    const setTableDataTimeout = setTimeout(
      () => setTableData(currentTableData),
      500,
    );

    return () => {
      setTableData([]);
      clearTimeout(setTableDataTimeout);
    };
  }, [currentTableData]);

  // Handle mouse wheel events for the table container
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;
    const handleWheel = (e: WheelEvent) => {
      // Check if the mouse is over the table container
      const rect = tableContainer.getBoundingClientRect();
      const isMouseOverTable =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (isMouseOverTable) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainer;
        const isAtTop = scrollTop <= 1;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        // If scrolling up and already at top, or scrolling down and already at bottom,
        // allow the page to scroll instead
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          // Don't prevent default - let the page scroll
          return;
        }

        // Otherwise, prevent the default page scroll and scroll the table
        e.preventDefault();
        // Stop the event from bubbling up to parent elements
        e.stopPropagation();
        // Scroll the table container instead
        tableContainer.scrollTop += e.deltaY;
      }
    };
    // Add event listener to the table container directly instead of document
    tableContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      tableContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={tableContainerRef}
      className="h-[100vh] overflow-y-auto overflow-x-hidden"
    >
      <table className="w-full bg-gradient-to-b from-[#0A1133] to-[#142266] h-fit transition-all duration-300 table-fixed">
        <thead className="w-full sticky top-0 bg-gradient-to-b from-[#0A1133] to-[#142266] z-10">
          <TR th>
            <TH
              icon={IMAGEKIT_ICONS.LEADERBOARD}
              heading="Rank"
              variants={{
                hover: {
                  scale: 1.25,
                  transition: {
                    duration: 0.5,
                    type: "spring",
                  },
                },
              }}
            />
            <TH
              icon={IMAGEKIT_ICONS.WALLET_WHITE}
              heading="Wallet"
              className="hidden md:flex"
              variants={{
                hover: {
                  animationName: "wiggle",
                  animationDuration: "1s",
                  animationFillMode: "forwards",
                  animationTimingFunction: "linear",
                },
              }}
            />
            <TH
              icon={IMAGEKIT_ICONS.POINTS}
              heading="Points"
              variants={{
                hover: {
                  rotate: 120,
                  transition: { duration: 1, type: "spring" },
                },
              }}
            />
            <TH
              icon={IMAGEKIT_ICONS.GIFT_WHITE}
              heading="Rewards"
              className="hidden md:flex"
              variants={{
                hover: {
                  animationName: "wiggle",
                  animationDuration: "1s",
                  animationFillMode: "forwards",
                  animationTimingFunction: "linear",
                },
              }}
            />
          </TR>
        </thead>
        <motion.tbody
          layout
          layoutRoot
          className="text-lg font-medium font-general-sans text-agwhite w-full"
        >
          <AnimatePresence>
            {tableData?.length !== 0 ? (
              <AnimatePresence>
                {tableData.map((data, idx) =>
                  data !== null ? (
                    <TR
                      key={idx}
                      special={data.special ?? false}
                      position={idx}
                    >
                      <Rank
                        rank={data.rank}
                        wallet={data.wallet}
                        special={data.special ?? false}
                        badge={data.badge}
                      />
                      <TD truncate special={data.special ?? false}>
                        {data.wallet}
                      </TD>
                      <TD
                        special={data.special ?? false}
                        className={twMerge(
                          data.special
                            ? "text-[22px] leading-[28.6px] md:text-[18px] md:leading-[23.6px]"
                            : "md:text-[14px] md:leading-[18.2px] text-[18px] leading-[23.6px]",
                          "md:pl-[auto_!important] lg:pl-[auto_!important] pl-[auto_!important] relative w-full gap-0 lg:gap-0 align-baseline",
                        )}
                      >
                        <span className="ml-auto w-fit text-right break-words">
                          {String(data.points).includes(".") ? (
                            <>
                              {pointsConverterToUSCommaseparated(
                                Number(data.points.toString().split(".")[0]),
                              )}
                              <span
                                className={twMerge(
                                  "text-[0.6em] opacity-[0.66]",
                                  data.special ? "pt-[0.4em]" : "pt-[0.5em]",
                                )}
                              >
                                .
                                {
                                  data.points
                                    .toFixed(4)
                                    .toString()
                                    .split(".")[1]
                                }
                              </span>
                            </>
                          ) : (
                            pointsConverterToUSCommaseparated(data.points)
                          )}
                        </span>
                      </TD>
                      <Reward badge={data.badge} />
                    </TR>
                  ) : (
                    <TR key={idx} className="h-[2.5rem]" empty>
                      <></>
                    </TR>
                  ),
                )}
              </AnimatePresence>
            ) : (
              <tr>
                <td colSpan={4} className="w-full">
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="m-auto w-full h-full flex flex-col justify-center items-center gap-[16px] max-w-[304px] py-20"
                  >
                    <div className="flex justify-center items-center">
                      <Image
                        src={IMAGEKIT_LOGOS.LOGO}
                        height={45}
                        width={45}
                        className="w-[45px] h-[45px]"
                        alt="antigravity logo"
                      />
                      <H1 className="uppercase text-[24px] leading-[24px] md:text-[24px]">
                        Antigravity
                      </H1>
                    </div>
                    <P className="text-center text-[14px]">
                      We&apos;re currently processing all participants&apos;
                      contributions for the Leaderboard.
                    </P>
                    <P className="text-center text-[14px]">
                      Please check back in after a short while.
                    </P>
                  </motion.div>
                </td>
              </tr>
            )}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
}
