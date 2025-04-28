"use client";

import { IMAGEKIT_IMAGES } from "@/assets/imageKit";
import React, { MouseEvent, useMemo, useState } from "react";
import { useEffect, useRef } from "react";
import MintingCalculator from "./MintingCalculator";
import Button from "@/components/Button";
import { IMAGEKIT_ICONS } from "@/assets/imageKit";
import CountdownTimer from "@/components/CountdownTimer";
import ProgressingStates from "@/components/ProgressingStates";
import { useAccount, useSwitchChain } from "wagmi";
import useTimer, { calculateTimeDifference } from "@/hooks/frontend/useTimer";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useMinting from "./useMinting";
import { MintError, STEPPERS } from "./types";
import { checkCorrectNetwork, TESTCHAINS } from "../RainbowKit";
import { BUY_DARK_URL, SUBGRAPH, TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";
import Image from "next/image";
import P from "../HTML/P";
import H1 from "../HTML/H1";
import { motion } from "framer-motion";
import { getButtonCofigs, setCurrentMintState } from "./utils";
import { useJourneyData } from "@/app/(client)/store";
import ThreeDHovercardEffect from "../ThreeDHovercardEffect";
import { Badge } from "@/components/HTML/Badge";
import If from "../If";
import { useRestPost } from "@/hooks/useRestClient";
import { errorToast } from "@/hooks/frontend/toast";
import useFuelCellContract from "@/abi/FuelCell";
import axios from "axios";
import { DotLoader } from "../header/Header";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";

export const MINTING_STATES = {
  INITIAL: "INITIAL",
  APPROVAL: "APPROVAL",
  MINT: "MINT",
  RECEIPT: "RECEIPT",
  SUCCESS: "SUCCESS",
} as const;

export const getCurrentBuyAnimation = (buymoreHighlight: boolean) => {
  return {
    lighter: {
      filter: buymoreHighlight
        ? "saturate(1) brightness(0.8) contrast(2)"
        : "saturate(1) brightness(1) contrast(1)",
      transition: {
        duration: 6,
      },
    },
    light: {
      filter: buymoreHighlight
        ? "saturate(0) brightness(0.3) contrast(1)"
        : "saturate(1) brightness(1) contrast(1)",
      transition: {
        duration: 6,
      },
    },
    darkness: {
      filter: buymoreHighlight
        ? "saturate(0) brightness(0.4) contrast(2)"
        : "saturate(1) brightness(1) contrast(1)",
      transition: {
        duration: 6,
      },
    },
  };
};

export const MAX_INPUT = 750;

export default function MintingHero() {
  const nftAvailable = false;
  const account = useAccount();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const timerState = useTimer();
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<MintError>({
    value: undefined,
    is: false,
  });
  const [darkInput, setDarkInput] = useState<string>("1");
  const [currentState, setCurrentState] = useState<keyof typeof MINTING_STATES>(
    MINTING_STATES.INITIAL,
  );
  const { journey, phase } = useJourneyData();
  const [mintState, setMintState] = useState<STEPPERS>({
    Approve: "pending",
    Mint: "pending",
    Success: "pending",
  });

  const { darkBalance, mintLogic, allowance, faucetCall } = useMinting(
    BigInt(darkInput),
    setCurrentState,
    setTxLoading,
    setTxError,
    {
      toastOption: {
        position: "bottom-left",
        referencePositionX: heroRef.current?.offsetLeft,
      },
    },
  );

  const { multiplier, rewardMultiplier } = useJourneyData();

  const handleMintButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (Number(darkInput) <= MAX_INPUT) {
      if (currentState !== MINTING_STATES.SUCCESS) {
        mintLogic();
      }
    } else {
      errorToast(`Cannot mint  more than ${MAX_INPUT} Fuel Cells at a time.`);
    }
  };

  const [nftNotifReveal, setNftNotifReveal] = useState<boolean>(false);
  const [nftNotifData, setNftNotifData] = useState<{
    fuelCells: number;
    points: number;
  }>({ fuelCells: 0, points: 0 });

  const handleNFTNotificationReveal = () => {
    setNftNotifData({
      fuelCells: Number(darkInput),
      points: multiplier * Number(darkInput) * rewardMultiplier,
    });
    setNftNotifReveal(true);
    setTimeout(() => {
      setNftNotifReveal(false);
    }, 8000);
  };

  useEffect(() => {
    setCurrentMintState(currentState, setMintState, txLoading);
  }, [currentState, txLoading, txError]);

  useEffect(() => {
    if (currentState === MINTING_STATES.SUCCESS) {
      setTimeout(() => {
        setDarkInput("1");
        setCurrentState(MINTING_STATES.INITIAL);
      }, 3500);
    }
  }, [currentState]);

  const buttonConfigs = useMemo(() => {
    return getButtonCofigs(
      Number(darkInput),
      darkBalance,
      currentState,

      txLoading,
      txError,
      handleNFTNotificationReveal,
    );
  }, [currentState, txLoading, txError, darkInput, darkBalance]);

  const buymoreHighlight = useMemo(() => {
    if (darkBalance < 0) return false;
    if (buttonConfigs.text === "Insufficient $DARK balance") {
      return true;
    }
    return false;
  }, [buttonConfigs]);

  const { mutateAsync: fetchEra3 } = useRestPost(
    ["era-3-timestamps-multipliers"],
    "/api/era-3-timestamps-multipliers",
  );

  const [journeyData, setJourneyData] = useState({
    currentJourney: "",
    currentPhase: "",
    isJourneyPaused: false,
    mintEndTimestamp: "",
    multiplier: "",
    nextJourneyTimestamp: "",
    rewardMultiplier: "",
  });

  useEffect(() => {
    fetchEra3({}).then((data) => {
      console.log({ data });
      setJourneyData(data as any);
    });
  }, []);

  useEffect(() => {
    const timestamp = new Date(
      Number(journeyData.mintEndTimestamp)
        ? Number(journeyData.mintEndTimestamp) * 1000
        : Number(journeyData.nextJourneyTimestamp) * 1000,
    );

    const i = setInterval(() => {
      if (timestamp.getTime() < new Date().getTime()) {
        fetchEra3({}).then((data) => setJourneyData(data as any));
      }
    }, 1500);

    return () => {
      clearInterval(i);
    };
  }, [journeyData]);

  // implementing adding fuel cell to wallet here
  const [addingNFTs, setAddingNFTs] = useState(false); // loading state for adding NFTs
  const fuelCellContract = useFuelCellContract();
  const handleAddToWallet = async () => {
    if (typeof window === "undefined") {
      console.error("Window object is not available.");
      return;
    } else {
      setAddingNFTs(true);
      const query = (startCursor = null) => {
        return `
          query MyQuery {
            user(id: "${account.address}") {
              address
              fuelCellBalance
              ownedFuelCells(limit: 10, after: ${startCursor !== null ? `"${startCursor}"` : null}) {
                items {
                  tokenId
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                    }
                  }
              }
          }
          `;
      };
      let hasNextPage = true;
      let fuelCells: { tokenId: string }[] = [];
      let startCursor = null;
      while (hasNextPage) {
        const response: any = await axios.post(SUBGRAPH, {
          query: query(startCursor),
        });
        fuelCells = [
          ...fuelCells,
          ...response.data.data.user.ownedFuelCells.items,
        ];
        startCursor = response.data.data.user.ownedFuelCells.pageInfo.endCursor;
        hasNextPage =
          response.data.data.user.ownedFuelCells.pageInfo.hasNextPage;
      }
      if (fuelCells.length > 0) {
        await window.ethereum?.sendAsync(
          fuelCells.map((fc) => ({
            method: "wallet_watchAsset",
            params: {
              type: "ERC721",
              options: {
                address: fuelCellContract.address as `0x${string}`,
                tokenId: fc.tokenId,
                symbol: "FUEL",
                decimals: 18,
                image: IMAGEKIT_IMAGES.FUEL_CELL_NFT_RED,
              },
            },
          })),
        );
      } else {
        toast.error("You don't have any Fuel Cells!");
      }
      setAddingNFTs(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen h-fit z-10 overflow-hidden">
      <motion.div
        style={{
          backgroundImage: `url(${IMAGEKIT_IMAGES.MINING_PAGE_ERA_3})`,
        }}
        animate={{
          filter: getCurrentBuyAnimation(buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(buymoreHighlight).darkness.transition
        }
        className="absolute top-0 left-0 h-full w-full bg-auto bg-[40%_50%] md:bg-cover"
      ></motion.div>
      <div className="h-fit z-0 ">
        <div className="flex flex-col justify-center items-center w-full h-fit py-[30px] md:pt-[100px] z-0">
          <div
            ref={heroRef}
            className="max-w-full relative flex flex-col lg:flex-row justify-start items-center lg:items-start gap-[24px] lg:gap-[16px] mt-[80px] px-[16px] h-fit"
          >
            <div className="flex flex-col justify-start items-start gap-[16px] w-fit h-full md:max-w-[451px] rounded-[6px]">
              <div className="flex flex-col justify-start items-start gap-[16px] w-fit sm:max-w-[451px] p-[16px] bg-[#FFFFFF4D] rounded-[6px]">
                <H1 className="text-agblack text-[56px] leading-[53.76px] md:text-[64px] md:leading-[64px] sm:text-nowrap text-wrap font-black">
                  Mint Fuel Cells
                </H1>
                <P className="text-agblack text-[14px] font-medium">
                  Minting Fuel Cells enters you into the lottery, raises your
                  collective points, and increases your rank. It also secures
                  your Treasury yield!
                </P>
                {/* add nfts to wallet */}
                {account.isConnected && (
                  <div
                    // href={`https://testnets.opensea.io/${account.address}`}
                    // target="_blank"
                    onClick={handleAddToWallet}
                  >
                    <Badge
                      className={twMerge(
                        addingNFTs
                          ? "bg-[#3C00DC] text-agwhite border-[#3C00DC] px-[8px] py-[4px] text-[12px] leading-[12px]"
                          : "text-[#3C00DC] border-[#3C00DC] px-[8px] py-[4px] text-[12px] leading-[12px] hover:bg-[#3C00DC] hover:text-agwhite hover:border-[#3C00DC]",
                      )}
                    >
                      {addingNFTs ? (
                        <div className="flex items-center gap-x-1">
                          Adding
                          <DotLoader />
                        </div>
                      ) : (
                        "Add Fuel Cell NFTs to Wallet"
                      )}
                    </Badge>
                  </div>
                )}
              </div>

              {/* nft notif */}
              <motion.div
                animate={{
                  clipPath: nftNotifReveal
                    ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                    : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
                }}
                transition={{
                  duration: 0.5,
                }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:translate-x-0 lg:translate-y-0 lg:left-0 lg:top-0 flex flex-col justify-center items-center gap-0 overflow-hidden z-20"
              >
                <ThreeDHovercardEffect ROTATION_RANGE={10}>
                  <motion.div
                    initial={{
                      top: "0",
                      left: "0",
                      opacity: 0,
                    }}
                    animate={{
                      top: nftNotifReveal ? "100%" : "0%",
                      left: nftNotifReveal ? "100%" : "0%",
                      opacity: nftNotifReveal ? [0, 1, 1, 0] : 0,
                    }}
                    transition={{
                      duration: 1,
                      repeat: 1,
                    }}
                    className="absolute top-0 left-0 bg-agwhite/20 h-[20px] w-[100vh] origin-center z-10 -rotate-45 -translate-x-1/2 p-[4px]"
                  >
                    <div className="w-full h-full bg-agwhite/40 p-[4px]">
                      <div className="w-full h-full bg-agwhite/60 p-[1px]">
                        <div className="w-full h-full bg-agwhite"></div>
                      </div>
                    </div>
                  </motion.div>
                  <div className="relative w-full rounded-[6px] bg-gradient-to-bl from-[#5537A5] to-[#BF6841] p-[1px] z-[1] overflow-hidden">
                    <div className="rounded-[inherit] bg-gradient-to-b from-agblack to-[#131A1A] overflow-hidden">
                      <Image
                        src={IMAGEKIT_IMAGES.FUEL_CELL_NFT_GREEN}
                        height={198}
                        width={198}
                        alt="NFT Icon"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="relative w-fit rounded-[6px] bg-gradient-to-bl from-[#5537A5] to-[#BF6841] p-[1px] translate-y-[-8px] overflow-hidden mx-auto">
                    <div className=" grid grid-cols-[1fr_auto_1fr] grid-rows-[1fr_auto_auto] place-items-start gap-y-[16px] gap-x-[8px] p-[16px] pt-[24px] sm:pl-[24px] sm:pt-[16px] rounded-[inherit] bg-gradient-to-bl from-[#3C00DC] to-[#15004C]">
                      <div className="flex flex-col gap-[8px]">
                        <p className="font-general-sans text-agwhite leadign-[14px] text-[14px]">
                          Minted
                        </p>
                        <div className="p-[8px] rounded-[6px] bg-agyellow text-agblack font-sans font-extrabold text-[24px] leading-[24px]">
                          {nftNotifData.fuelCells.toLocaleString()}
                        </div>
                        <p className="font-general-sans text-agwhite leadign-[14px] text-[14px]">
                          Fuel Cells!
                        </p>
                      </div>
                      <div className="h-full bg-gradient-to-bl from-[#3C00DC] via-[#FF5001] to-[#FF5001] w-[1px] rounded-full"></div>
                      <div className="flex flex-col gap-[8px]">
                        <p className="font-general-sans text-agwhite leadign-[14px] text-[14px]">
                          Earned
                        </p>
                        <div className="p-[8px] rounded-[6px] bg-agyellow text-agblack font-sans font-extrabold text-[24px] leading-[24px]">
                          {nftNotifData.points.toLocaleString()}
                        </div>
                        <p className="font-general-sans text-agwhite leadign-[14px] text-[14px]">
                          Points!
                        </p>
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / span 3",
                        }}
                        className="w-full bg-gradient-to-bl from-[#3C00DC] via-[#FF5001] to-[#FF5001] h-[1px] rounded-full"
                      ></div>
                      <p
                        style={{
                          gridColumn: "1 / span 3",
                        }}
                        className="place-self-start font-general-sans text-agwhite leadign-[14px] text-[14px] my-auto"
                      >
                        {`Journey ${journey}`}
                      </p>
                    </div>
                  </div>
                </ThreeDHovercardEffect>
              </motion.div>
            </div>
            <div className="flex flex-col justify-center items-center gap-[8px]">
              <MintingCalculator
                tokenBalance={BigInt(Math.floor(Number(darkBalance)) || 0)}
                value={darkInput}
                setValue={setDarkInput}
                journey={journey}
                multiplyer={rewardMultiplier}
                bonus={multiplier}
                buymoreHighlight={buymoreHighlight}
                buyMoreFn={() => {
                  window.open(`${BUY_DARK_URL}`, "_blank");
                }}
                txLoading={txLoading}
              />
              {timerState.isJourneyPaused &&
              timerState.currentMintEndTimestamp === null &&
              timerState.nextJourneyTimeStamp === null ? (
                <Button
                  innerText="Minting Paused"
                  iconSrc={IMAGEKIT_ICONS.CUBE}
                  iconAlt="Minting paused"
                  iconPosition="start"
                  variants={{
                    hover: {
                      animationName: "wiggle",
                      animationDuration: "1s",
                      animationFillMode: "forwards",
                      animationTimingFunction: "linear",
                    },
                  }}
                  disabled
                />
              ) : !Number(journeyData.mintEndTimestamp) ? (
                <Button
                  innerText="Next minting window opens in ⬇️"
                  iconSrc={IMAGEKIT_ICONS.CUBE}
                  iconAlt="Minting paused"
                  iconPosition="start"
                  variants={{
                    hover: {
                      animationName: "wiggle",
                      animationDuration: "1s",
                      animationFillMode: "forwards",
                      animationTimingFunction: "linear",
                    },
                  }}
                  disabled
                />
              ) : account.isConnected ? (
                checkCorrectNetwork(account.chainId, [
                  TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
                ]) ? (
                  <Button
                    innerText={buttonConfigs.text}
                    loading={buttonConfigs.loading}
                    iconPosition="start"
                    iconAlt="mint-btn-icon"
                    iconSrc={buttonConfigs.icon}
                    animateButton
                    disabled={buttonConfigs.disabled}
                    onClick={handleMintButton}
                    variants={buttonConfigs.variants}
                  />
                ) : (
                  <Button
                    innerText="Switch to PulseChain"
                    iconSrc={IMAGEKIT_ICONS.ERROR}
                    onClick={() => {
                      switchChain({ chainId: pulsechain.id });
                    }}
                    iconAlt="network error"
                    iconPosition="start"
                    variants={{
                      hover: {
                        animationName: "wiggle",
                        animationDuration: "1s",
                        animationFillMode: "forwards",
                        animationTimingFunction: "linear",
                      },
                    }}
                  />
                )
              ) : (
                <Button
                  innerText="Connect Wallet"
                  iconSrc={IMAGEKIT_ICONS.WALLET_WHITE}
                  iconAlt="wallet"
                  variants={{
                    hover: {
                      animationName: "wiggle",
                      animationDuration: "1s",
                      animationFillMode: "forwards",
                      animationTimingFunction: "linear",
                    },
                  }}
                  onClick={openConnectModal}
                />
              )}
              <If
                condition={!!journeyData.mintEndTimestamp}
                then={
                  <motion.div
                    animate={{
                      filter:
                        getCurrentBuyAnimation(!!buymoreHighlight).darkness
                          .filter,
                    }}
                    transition={
                      getCurrentBuyAnimation(!!buymoreHighlight).darkness
                        .transition
                    }
                    className="p-[8px] rounded-[6px] bg-[#030404A8] w-full max-w-[350px] md:max-w-[400px] mt-[16px]"
                  >
                    <ProgressingStates states={mintState} />
                  </motion.div>
                }
              />
              <motion.div
                animate={{
                  filter:
                    getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
                }}
                transition={
                  getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
                }
                className="p-[8px] rounded-[6px] bg-[#030404A8] w-full max-w-[350px] md:max-w-[400px]"
              >
                <CountdownTimer
                  state={{
                    claimStarted: false,
                    claimTransition: false,
                    ...calculateTimeDifference(
                      new Date(
                        Number(journeyData.mintEndTimestamp)
                          ? Number(journeyData.mintEndTimestamp) * 1000
                          : Number(journeyData.nextJourneyTimestamp) * 1000,
                      ).toString(),
                    ),
                    era: "minting",
                    phase: parseInt(journeyData.mintEndTimestamp) ? 1 : 2,
                    isMintingActive: !!parseInt(journeyData.mintEndTimestamp),
                    isJourneyPaused: !!journeyData.isJourneyPaused,
                    mintingTransition: false,
                    nextJourneyTimeStamp: ~~(
                      parseInt(journeyData.nextJourneyTimestamp) / 1000
                    ),
                    currentMintEndTimestamp: ~~(
                      Number(journeyData.mintEndTimestamp) / 1000
                    ),
                    journey: 3,
                    phaseNumber: 1,
                    nextPhaseStartTimestamp: null,
                  }}
                  fontDesktopSize={40}
                  fontMobileSize={48}
                  counterClassName="text-agwhite w-fit mx-auto"
                  counterSubtitleClassName="text-[14px] leading-[17.36px] px-[8px]"
                  containerClassName="text-agwhite text-[14px] leading-[17.36px] pb-[8px]"
                  overrideText={
                    !!parseInt(journeyData.mintEndTimestamp)
                      ? `minting ends in`
                      : ""
                  }
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
