"use client";

import Button from "@/components/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import H1 from "@/components/HTML/H1";
import P from "@/components/HTML/P";
import Table from "@/components/Table";
import { useAccount } from "wagmi";
import { IMAGEKIT_ICONS, IMAGEKIT_LOGOS } from "@/assets/imageKit";
import AnimatedButton from "../AnimatedButton";
import Link from "next/link";
import GradientBorder from "../GradientBorder";
import { useRestPost } from "@/hooks/useRestClient";
import Dropdownbutton from "../Dropdownbutton";
import useTimer from "@/hooks/frontend/useTimer";
import { client } from "../../../sanity/lib/client";

function CollectiveLogo() {
  return (
    <div className="flex justify-start items-center gap-2 absolute lg:relative bottom-0 right-0 z-[100] h-fit w-fit">
      <Image
        src={IMAGEKIT_LOGOS.COLLECTIVE_COLOR_LOGO}
        alt="leaderboard background"
        width={294}
        height={382}
        className="object-fit opacity-25 lg:opacity-50 w-[100px] lg:w-[294px] h-[100px] lg:h-[300px]"
      />
    </div>
  );
}

type tableDataType = {
  rank: number;
  badge: string;
  wallet: string;
  points: number;
  special?: boolean;
} | null;

export default function Leaderboard() {
  const timer = useTimer();
  const account = useAccount();
  const [tableData, setTableData] = useState<tableDataType[]>([]);
  const targetRef = useRef<HTMLDivElement>(null);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<
    "allTimeLeaderboard" | "fullTimeLeaderboard" | string
  >("allTimeLeaderboard");
  const { data: leaderboardData, mutate: mutateLeaderboardData } = useRestPost(
    ["leaderboard"],
    "/api/leaderboard",
  );
  const [externalLinks, setExternalLinks] = useState<{
    best_way_to_rank_up: string;
  }>();

  useEffect(() => {
    client
      .fetch(
        `*[_type=="external_links"][0]{
          best_way_to_rank_up
        }`,
      )
      .then((externalLinks) => {
        setExternalLinks(externalLinks);
      });
  }, []);

  const handleRefresh = () => {
    mutateLeaderboardData({
      walletAddress: account.address ?? "",
    });
  };

  useEffect(() => {
    handleRefresh();
  }, [account.address, account.chainId]);

  useEffect(() => {
    if (leaderboardData) {
      // @ts-ignore
      setTableData(leaderboardData[selectedLeaderboard]);
    }
  }, [leaderboardData, selectedLeaderboard]);

  return (
    <div ref={targetRef}>
      <motion.div
        className={
          GradientBorder({
            from: "#5537A5",
            to: "#BF6841",
            direction: "bl",
            borderSize: 4,
          }) +
          "relative w-full max-w-[1200px] min-h-[574px] border-t-4 border-b-4 lg:border-4 p-[16px] lg:p-[32px] bg-agblack lg:rounded-xl z-0"
        }
      >
        <div className="flex flex-col gap-[16px] w-full min-h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full max-w-[100%] min-h-full gap-[16px]">
            <div className="flex flex-col gap-[16px] col-span-2 w-full">
              <div className="flex flex-wrap justify-start items-center gap-x-[16px] gap-y-[8px] z-50 max-w-full">
                <H1>Leaderboard</H1>
                <Dropdownbutton
                  icon={IMAGEKIT_ICONS.CALENDAR}
                  options={[
                    { label: "Highlights", value: "allTimeLeaderboard" },
                    { label: "Full Leaderboard", value: "fullTimeLeaderboard" },
                  ]}
                  selected={selectedLeaderboard}
                  setSelected={setSelectedLeaderboard}
                />
                <AnimatedButton
                  innerText="Refresh"
                  iconSrc={IMAGEKIT_ICONS.REFRESH}
                  iconAlt="refresh icon"
                  secondary
                  disableSparkels
                  onClick={handleRefresh}
                  variants={{
                    hover: {
                      animation: "spin 1s linear infinite forwards",
                    },
                  }}
                />
                <AnimatedButton
                  innerText="Claim"
                  iconSrc={IMAGEKIT_ICONS.GIFT_WHITE}
                  iconAlt="Gift image"
                  secondary
                  disableSparkels
                  onClick={() =>
                    window.open(
                      "https://airtable.com/appRD1ZlybvvvL4sO/pagkRHUf93rnGtpsa/form",
                      "_blank",
                    )
                  }
                  variants={{
                    hover: {
                      animation: "spin 1s linear infinite forwards",
                    },
                  }}
                />
              </div>
              <div className="rounded-[4px] border-[2px] border-[#414343] lg:border-none overflow-hidden">
                <Table
                  tableData={tableData}
                  era={
                    selectedLeaderboard === "era1Leaderboard"
                      ? 1
                      : selectedLeaderboard === "era2Leaderboard"
                        ? 2
                        : selectedLeaderboard === "era3Leaderboard"
                          ? 3
                          : 1
                  }
                />
              </div>
            </div>

            <div className="relative flex flex-col w-full gap-4 lg:pl-6 place-self-end pt-[24px] md:pt-0">
              <CollectiveLogo />
              <div className="relative flex flex-col gap-[8px] p-4 rounded-xl overflow-hidden w-full z-0">
                <div className="bg-[#3C00DC] absolute inset-0 -z-10 opacity-[25%]"></div>
                <motion.div
                  initial={{
                    animationName: "",
                  }}
                  whileHover={{
                    animationName: "wiggle",
                    animationDuration: "1s",
                    animationFillMode: "forwards",
                    animationTimingFunction: "linear",
                  }}
                  className="h-fit w-fit origin-center"
                >
                  <Image
                    src={IMAGEKIT_ICONS.INFO}
                    alt="info icon"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </motion.div>

                {timer.claimStarted ? (
                  <Link href={"/mining"}>
                    <Button
                      innerText={"Start Claiming"}
                      iconSrc={IMAGEKIT_ICONS.CLAIM}
                      iconAlt="claim icon"
                      variants={{
                        hover: {
                          rotate: 15,
                          transition: {
                            duration: 0.25,
                            type: "spring",
                          },
                        },
                      }}
                    />
                  </Link>
                ) : (
                  <Link href={"/minting"}>
                    <Button
                      innerText={"Start minting"}
                      iconSrc={IMAGEKIT_ICONS.HAMMER}
                      iconAlt="hammer icon"
                      variants={{
                        hover: {
                          scale: 1.35,
                          rotate: 390,
                          transition: {
                            duration: 1,
                            type: "spring",
                          },
                        },
                      }}
                    />
                  </Link>
                )}
                <Link href={"/minting"} className="text-agwhite underline">
                  <P>Mint now to rank up!</P>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
