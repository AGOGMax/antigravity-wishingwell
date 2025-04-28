"use client";

import H1 from "@/components/HTML/H1";
import P from "@/components/HTML/P";
import Button from "@/components/Button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { PublicClient, parseAbiItem } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { IMAGEKIT_ICONS, IMAGEKIT_IMAGES } from "@/assets/imageKit";
import Leaderboard from "./Leaderboard";
import { motion } from "framer-motion";
import { client as cmsClient } from "../../../sanity/lib/client";

// Use a function to get the latest block number
async function getLatestBlockNumber(publicClient: PublicClient) {
  const block = await publicClient.getBlockNumber();
  return block;
}

export default function CollectiveHero() {
  const [isOpen, setIsOpen] = useState(false);
  const account = useAccount();
  const { openConnectModal } = useConnectModal();

  const [content, setContent] = useState<{
    heroText: string[];
    heroDescription: string[];
  }>({
    heroText: [],
    heroDescription: [],
  });

  useEffect(() => {
    cmsClient
      .fetch(
        `*[_type=="collective"][0]{
		heroDescription,
		heroText
	  }`,
      )
      .then((hero) => {
        setContent({ ...hero });
      });
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="relative flex flex-col justify-start items-center w-full h-fit lg:h-screen  gap-[24px] pt-[100px] lg:pt-[200px] z-0">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#000000A8] to-[#00000000] z-0"></div>
      <div className="flex flex-col justify-center items-center gap-[16px] z-[1] p-[16px]">
        <H1
          className="text-agwhite text-[56px] leading-[53.76px] md:text-[64px] md:leading-[64px]"
          center
        >
          {content.heroText.map((text) => (
            <React.Fragment key={text}>
              {text}
              <br />
            </React.Fragment>
          ))}
        </H1>
        <div className="flex flex-col gap-y-2">
          {content.heroDescription.map((text) => (
            <P center key={text}>
              {text}
            </P>
          ))}
        </div>
        {!account.isConnected && (
          <Button
            iconSrc={IMAGEKIT_ICONS.WALLET_WHITE}
            iconPosition="start"
            innerText="Connect Wallet"
            onClick={handleLogin}
            variants={{
              hover: {
                animationName: "wiggle",
                animationDuration: "1s",
                animationFillMode: "forwards",
                animationTimingFunction: "linear",
              },
            }}
          />
        )}
      </div>
      <motion.div
        animate={{ y: 0 }}
        initial={{ y: "100vh" }}
        transition={{ duration: 1, type: "spring", bounce: 0.25, delay: 1.5 }}
        className="hidden md:block w-full h-fit max-w-[1200px]"
      >
        <Leaderboard />
      </motion.div>
      <Image
        src={IMAGEKIT_IMAGES.COLLECTIVE_HERO_BG}
        alt="Collective Hero Background"
        height={1080}
        width={1920}
        className="absolute inset-0 -z-[1] w-[100vw] h-full md:h-screen object-[70%_10%] object-none lg:object-cover"
      />
    </div>
  );
}
