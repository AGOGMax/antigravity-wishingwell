"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, Fragment } from "react";
import { IoMenu, IoCloseCircleOutline } from "react-icons/io5";
import { UserConnected } from "./UserConnected";
import { motion, AnimatePresence } from "framer-motion";
import P from "../HTML/P";
import { PublicClient } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Button from "@/components/Button";
import { IMAGEKIT_ICONS, IMAGEKIT_LOGOS } from "@/assets/imageKit";
import Link from "next/link";
import useLoading from "@/hooks/frontend/useLoading";
import { client } from "../../../sanity/lib/client";
import useTimer from "@/hooks/frontend/useTimer";
import useHeaderStats from "./useHeaderStats";
import { checkCorrectNetwork } from "../RainbowKit";
import {
  PiRocketLaunchDuotone,
  PiTreasureChestDuotone,
  PiCopyDuotone,
} from "react-icons/pi";
import { useJourneyData } from "@/app/(client)/store";
import axios from "axios";
import { API_ENDPOINT } from "@/constants";
import { useRestPost } from "@/hooks/useRestClient";
import { warningToastInfinite } from "../../hooks/frontend/toast";
import toast from "react-hot-toast";
import Tooltip from "@/hooks/frontend/Tooltip";
import { zeroAddress } from "viem";

// Use a function to get the latest block number
async function getLatestBlockNumber(publicClient: PublicClient) {
  const block = await publicClient.getBlockNumber();
  return block;
}

const Header = () => {
  // about section dropdown
  const timer = useTimer();
  const [aboutSectionOpen, setAboutSectionOpen] = useState(false);
  const { openConnectModal } = useConnectModal();

  const [isOpen, setIsOpen] = useState(false);
  // const [currentChain, setCurrentChain] = useState("");

  const [externalLinks, setExternalLinks] = useState<{
    darkpaper: string;
    darkerpaper: string;
  }>();

  useEffect(() => {
    client
      .fetch(
        `*[_type=="external_links"][0]{
          darkpaper, darkerpaper
        }`,
      )
      .then((externalLinks) => {
        setExternalLinks(externalLinks);
      });
  }, []);

  const account = useAccount();

  const { strictNoLoading } = useLoading();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setAboutSectionOpen(false);
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const { mutation: storeJourneyData, journey } = useJourneyData();

  const { mutateAsync: fetchEra3 } = useRestPost(
    ["era-3-timestamps-multipliers"],
    "/api/era-3-timestamps-multipliers",
  );
  const {
    userDark: darkBalance,
    treasuryDark: treasuryBalance,
    DarkContract,
  } = useHeaderStats();

  const DarkContractAdd = DarkContract.address;

  useEffect(() => {
    fetchEra3({ walletAddress: account.address }).then((data: any) => {
      storeJourneyData({
        // journey: Number(data.currentJourney),
        phase: Number(data.currentPhase),
        multiplier: Number(data.multiplier) ?? 0,
        rewardMultiplier: Number(data.rewardMultiplier) ?? 0,
      });
      if (data.currentJourney !== journey) {
        storeJourneyData({ journey: data.currentJourney });
      }
    });
  }, [account.address, journey]);

  useEffect(() => {
    // ADDDING A WARNING TOAST FOR SITE VISITORS
    if (!window && strictNoLoading) return;
    const hostname = window.location.hostname;

    const alternateSite = hostname.includes("agproject.io")
      ? hostname.replace("agproject.io", "agproject.xyz")
      : hostname.includes("agproject.xyz")
        ? hostname.replace("agproject.xyz", "agproject.io")
        : "agproject.io";
    const toastId = warningToastInfinite(
      <div>
        If you are experiencing issues with any of the functions on{" "}
        <span className="font-bold">{hostname}</span>, please use the alternate
        site{" "}
        <span>
          <a href={`https://${alternateSite}`} className="underline font-bold">
            <i> {alternateSite} </i>
          </a>{" "}
        </span>
      </div>,
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  return (
    <motion.header
      whileInView={{ y: 0, opacity: 1 }}
      initial={{
        y: strictNoLoading ? 0 : -50,
        opacity: strictNoLoading ? 1 : 0,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 1.5 }}
      className="flex flex-col items-center justify-center h-full w-full lg:w-fit max-[1200px] z-50 font-extrabold mx-auto"
    >
      <div className="relative hidden lg:flex w-fit rounded-t-lg bg-gradient-to-tr from-brred to-blue p-[2px] pb-0 mx-[10px]">
        <div className="px-[16px] py-[8px] rounded-[inherit] bg-gradient-to-b from-agblack to-[#131A1A]">
          <div className="grid grid-flow-col place-items-center gap-[16px] opacity-[0.66] font-sans text-agwhite text-[16px] leading-[16px] uppercase tracking-widest">
            <p className="flex justify-center items-center gap-[8px]">
              <PiTreasureChestDuotone className="text-[24px] leading-[24px] text-agwhite" />
              <span>$DARK in Treasury:</span>
              <LoaderSpan
                data={
                  treasuryBalance >= 0 ? Number(treasuryBalance) : undefined
                }
              />
            </p>
            <div className="w-[1px] h-full bg-gradient-to-b from-white via-[#999999] to-[#999999] rounded-full" />
            <p className="flex justify-center items-center gap-[8px]">
              <PiRocketLaunchDuotone className="text-[24px] leading-[24px] text-agwhite" />
              <span>Journey:</span>
              <LoaderSpan data={journey} />
            </p>
            {account.isConnected && checkCorrectNetwork(account.chainId) ? (
              <Fragment>
                <div className="w-[1px] h-full bg-gradient-to-b from-white via-[#999999] to-[#999999] rounded-full" />
                <p className="flex justify-center items-center gap-[8px]">
                  <Image
                    src={IMAGEKIT_ICONS.WALLET_WHITE}
                    alt="Clock"
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px]"
                  />
                  <span>$Dark Balance:</span>
                  <LoaderSpan
                    data={darkBalance >= 0 ? Number(darkBalance) : undefined}
                  />
                </p>
              </Fragment>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex text-agwhite w-full lg:min-w-fit lg:w-full rounded-lg bg-gradient-to-tr from-brred to-blue p-[2px]">
        <div className="w-full h-full bg-agblack flex items-center justify-between rounded-lg gap-[40px] px-[12px] py-[8px]">
          {/* Desktop View */}
          <div className="hidden lg:flex lg:flex-grow lg:items-center h-fit lg:justify-between lg:gap-x-[40px]">
            <Link className="flex items-center cursor-pointer" href="/">
              <div className="relative w-[42px] h-[42px]">
                <Image src={IMAGEKIT_LOGOS.LOGO} alt="icon" fill />
              </div>
              <p className="from-white to-[#999999] pl-[8px] font-sans font-black text-[14px] leading-[14px] bg-gradient-to-b text-transparent bg-clip-text">
                ANTIGRAVITY
              </p>
            </Link>
            <div
              className={`relative flex justify-center items-center font-extrabold text-lg font-sans gap-[16px] oveflow-hidden`}
            >
              <Link
                href={
                  timer.isMintingActive && !timer.claimStarted
                    ? location.pathname === "/minting"
                      ? "/minting#"
                      : "/minting"
                    : location.pathname === "/mining"
                      ? "/mining#"
                      : "/mining"
                }
                className="p-[8px]"
              >
                <P
                  uppercase
                  gradient
                  extrabold
                  className="font-sans font-extrabold"
                >
                  {timer.isMintingActive && !timer.claimStarted
                    ? "Minting"
                    : timer.claimStarted
                      ? "Claiming"
                      : "Mining"}
                </P>
              </Link>
              <Link
                href={
                  location.pathname === "/collective"
                    ? "/collective#"
                    : "/collective"
                }
                className="p-[8px]"
              >
                <P
                  uppercase
                  gradient
                  extrabold
                  className="font-sans font-extrabold"
                >
                  Collective
                </P>
              </Link>
              {timer.isMintingActive && (
                <Link
                  href="https://beta.agproject.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-[8px]"
                >
                  <P
                    uppercase
                    gradient
                    extrabold
                    className="font-sans font-extrabold"
                  >
                    Tools
                  </P>
                </Link>
              )}
            </div>
            {account.isConnected ? (
              <>
                <div className="w-[2px] h-[2.5rem] bg-gradient-to-b from-white via-[#999999] to-[#999999] rounded-full" />
                <UserConnected />
              </>
            ) : (
              <Button
                onClick={handleLogin}
                iconSrc={IMAGEKIT_ICONS.WALLET_WHITE}
                iconAlt="wallet"
                iconPosition="start"
                innerText="Connect Wallet"
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
          {/* Mobile View */}
          <Link
            className="flex max-w-[500px] lg:hidden items-center cursor-pointer"
            href="/"
          >
            <div className="w-[37px] h-[37px] lg:w-[45px] lg:h-[45px] relative">
              <Image src={IMAGEKIT_LOGOS.LOGO} alt="icon" fill />
            </div>
            <p className="from-white to-[#999999] pl-2 font-sans font-extrabold sm:text-2xl bg-gradient-to-b text-transparent bg-clip-text">
              ANTIGRAVITY
            </p>
          </Link>
          <div className="flex lg:hidden">
            {isOpen ? (
              <IoCloseCircleOutline
                className="cursor-pointer"
                width={24}
                height={24}
                onClick={toggleMenu}
              />
            ) : (
              <IoMenu
                className="cursor-pointer"
                width={24}
                height={24}
                onClick={toggleMenu}
              />
            )}
          </div>
        </div>
      </div>
      {isOpen ? (
        <div className="flex lg:hidden w-full max-w-[900px] justify-center">
          <div className="flex text-agwhite w-full lg:h-16 rounded-lg bg-gradient-to-tr from-brred to-blue p-[2px] overflow-hidden">
            <div className="w-full h-full bg-agblack px-8 flex flex-col items-center justify-center rounded-lg gap-6 py-4">
              {account.isConnected ? (
                <UserConnected />
              ) : (
                <Button
                  onClick={handleLogin}
                  iconSrc={IMAGEKIT_ICONS.WALLET_WHITE}
                  iconAlt="wallet"
                  iconPosition="start"
                  innerText="Connect Wallet"
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
              <div className="w-full h-[1px] bg-gradient-to-l from-white via-[#999999] to-[#999999] rounded-full" />
              <Link
                href={
                  timer.isMintingActive && !timer.claimStarted
                    ? location.pathname === "/minting"
                      ? "/minting#"
                      : "/minting"
                    : location.pathname === "/mining"
                      ? "/mining#"
                      : "/mining"
                }
              >
                <P
                  uppercase
                  gradient
                  extrabold
                  className="font-sans font-extrabold"
                >
                  {timer.isMintingActive && !timer.claimStarted
                    ? "Minting"
                    : timer.claimStarted
                      ? "Claiming"
                      : "Mining"}
                </P>
              </Link>
              <Link
                href={
                  location.pathname === "/collective"
                    ? "/collective#"
                    : "/collective"
                }
              >
                <P
                  uppercase
                  gradient
                  extrabold
                  className="font-sans font-extrabold"
                >
                  Collective
                </P>
              </Link>
              {timer.isMintingActive && (
                <Link
                  href="https://beta.agproject.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <P
                    uppercase
                    gradient
                    extrabold
                    className="font-sans font-extrabold"
                  >
                    Tools
                  </P>
                </Link>
              )}
              {/* <P
                onClick={() => setAboutSectionOpen(!aboutSectionOpen)}
                uppercase
                gradient
                extrabold
                className="relative font-sans font-extrabold cursor-pointer w-full flex flex-col gap-[8px]"
              >
                <div className="flex justify-center items-center">
                  About{" "}
                  <Image
                    src={IMAGEKIT_ICONS.DOWN_WHITE}
                    alt="Dropdown"
                    width={16}
                    height={16}
                    style={{
                      transform:
                        aboutSectionOpen && isOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                    className="origin-center transition-all duration-300 ease-in-out transform rotate-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence>
                  {aboutSectionOpen && isOpen && (
                    <motion.div
                      exit={{
                        height: 0,
                        opacity: 0,
                        gap: 0,
                        padding: 0,
                      }}
                      animate={{
                        height: "fit-content",
                        opacity: 1,
                        gap: "8px",
                        padding: "10px 16px",
                      }}
                      initial={{
                        height: 0,
                        opacity: 0,
                        gap: 0,
                        padding: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                      }}
                      className="w-full rounded-[8px] z-10 p-[16px] text-agwhite transition-all duration-300 ease-in-out bg-agblack bg-gradient-to-b from-[#0A1133] to-[#142266] "
                    >
                      <motion.div
                        exit={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "fit-content",
                          opacity: 1,
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="flex flex-col justify-center items-center gap-[2rem] overflow-hidden"
                      >
                        <a
                          target="_blank"
                          href={process.env.NEXT_PUBLIC_WHITEPAPER || "/"}
                        >
                          <P
                            uppercase
                            gradient
                            extrabold
                            center
                            className="font-sans font-extrabold text-nowrap"
                          >
                            Dark Paper
                          </P>
                        </a>
                        <a
                          target="_blank"
                          href={process.env.NEXT_PUBLIC_WHITEPAPER || "/"}
                        >
                          <P
                            uppercase
                            gradient
                            extrabold
                            center
                            className="font-sans font-extrabold text-nowrap"
                          >
                            Darker Paper
                          </P>
                        </a>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </P> */}
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-center gap-[8px] p-2 mt-[8px] text-agwhite bg-agblack bg-opacity-50 rounded-[8px] w-full">
        <p className="font-bold break-words max-w-[90%]">
          $DARK CONTRACT ADDRESS: {DarkContractAdd || "Address not found"}
        </p>
        <button
          className="relative"
          onClick={() => {
            navigator.clipboard.writeText(DarkContractAdd || zeroAddress);
          }}
        >
          <Tooltip
            trigger={<PiCopyDuotone className="text-[24px]" />}
            positionClassName="absolute !w-max right-[0px]"
            action="click"
          >
            Address Copied!
          </Tooltip>
        </button>
      </div>
    </motion.header>
  );
};

export default Header;

const LoaderSpan = ({ data }: { data?: number }) => {
  return (
    <span>{data !== undefined ? data.toLocaleString() : <DotLoader />}</span>
  );
};

export const DotLoader = () => {
  return (
    <div className="flex justify-center items-center gap-[4px]">
      <motion.span
        animate={{
          y: "10%",
        }}
        initial={{
          y: "0%",
        }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatType: "reverse",
          type: "spring",
          bounce: 0.5,
          delay: 0,
        }}
      >
        .
      </motion.span>
      <motion.span
        animate={{
          y: "10%",
        }}
        initial={{
          y: "0%",
        }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatType: "reverse",
          type: "spring",
          bounce: 0.5,
          delay: 0.1,
        }}
      >
        .
      </motion.span>
      <motion.span
        animate={{
          y: "10%",
        }}
        initial={{
          y: "0%",
        }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatType: "reverse",
          type: "spring",
          bounce: 0.5,
          delay: 0.2,
        }}
      >
        .
      </motion.span>
    </div>
  );
};
