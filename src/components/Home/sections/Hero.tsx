"use client";

import Spinner from "@/components/Home/components/Spinner";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroItemCard from "@/components/Home/components/HeroItemCard";
import { IMAGEKIT_IMAGES } from "@/assets/imageKit";
import useTimer from "@/hooks/frontend/useTimer";
import useClaim from "@/hooks/sc-fns/useClaim";

export default function Hero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [1, 0], [0, 1]);
  const translateYHeroItems = useTransform(
    scrollYProgress,
    [0.5, 0],
    [-150, 0],
  );
  const timer = useTimer();
  const { darkBalance } = useClaim();
  return (
    <div ref={targetRef} className="w-full h-full">
      <motion.div
        style={
          {
            "--opacity": opacity,
          } as any
        }
        className="relative grid grid-rows-3 md:grid-cols-3 md:grid-rows-1 w-full h-[180vh] md:h-[60vh] mt-[50vh] md:mt-[40vh] z-0 lg:opacity-[--opacity]"
      >
        <Spinner scrollYProgress={scrollYProgress} />
        {timer.claimStarted ? (
          <HeroItemCard
            title="Claiming"
            description={
              "Surprise! You can now claim your $DARK tokens based on the points you've earned. "
            }
            backgroundImage={IMAGEKIT_IMAGES.MINING}
            animateFrom="left"
            cardExternalLink="/mining"
          />
        ) : (
          <HeroItemCard
            title="Pink Mist Whale Game"
            description={"Play the Pink Mist Well Game and steal the jackpot!"}
            // backgroundImage={IMAGEKIT_IMAGES.WISHWELL}
            backgroundImage={
              "https://i.ibb.co/MDxDS0Rt/pink-mist-whale-image.jpg"
            }
            animateFrom="left"
            cardExternalLink={"/pmwgame"}
            defaultImageOpacity={0.5}
            hoverImageOpacity={0.35}
          />
        )}
        {timer.isMintingActive || timer.claimStarted ? (
          <HeroItemCard
            title="Minting"
            description={
              "Start minting a Fuel Cell to enter into the lottery, earn Collective points, and rank up. Secure your treasury yield now!"
            }
            backgroundImage={IMAGEKIT_IMAGES.MINING_PAGE_ERA_3}
            className="lg:object-cover object-[20%_55%]"
            animateFrom="bottom"
            cardExternalLink="/minting"
            defaultImageOpacity={0.35}
            hoverImageOpacity={0.35}
          />
        ) : (
          <HeroItemCard
            title="Mining"
            description={
              "Start mining with supported tokens to get points + $DARKX tokens + the new Antigravity NFT."
            }
            backgroundImage={IMAGEKIT_IMAGES.MINING}
            animateFrom="bottom"
            cardExternalLink="/mining"
          />
        )}
        <HeroItemCard
          title="The Collective"
          description="Learn how to leverage points, rank up and earn exciting rewards. Join The Collective!"
          backgroundImage={IMAGEKIT_IMAGES.MINTING}
          animateFrom="right"
          cardExternalLink="/collective"
          defaultImageOpacity={0.5}
          hoverImageOpacity={0.35}
        />
      </motion.div>
    </div>
  );
}
