"use client";

import { twMerge } from "tailwind-merge";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { IMAGEKIT_ICONS } from "@/assets/imageKit";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Pill from "@/components/Pill";
import { TokenDropdownTypes } from "../Mining/types";
import Image from "next/image";
import AutomaticIncreamentalNumberCounterWithString from "../Mining/AutomaticIncreamentalNumberCounterWithString";
import { useAccount } from "wagmi";
import pointsConverterToUSCommaseparated from "../pointsConverterToUSCommaseparated";
import USFormatToNumber from "../USFormatToNumber";
import { errorToast } from "@/hooks/frontend/toast";
import { AnimatePresence, motion } from "framer-motion";
import { BUY_DARK_URL, TEST_NETWORK } from "@/constants";
import { DotLoader } from "../header/Header";
import { getCurrentBuyAnimation, MAX_INPUT } from "./MintingHero";
import { useJourneyData } from "@/app/(client)/store";

const MINIMUM_VISUAL_VALUE_BEFORE_SCIENTIFIC_NOTATION = 0.000001;

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function InputCard({
  inputValue,
  setCurrentInputValue,
  tokenBalance,
  txLoading,
  buymoreHighlight,
  buyMoreFn,
}: {
  inputValue: string;
  setCurrentInputValue: Dispatch<SetStateAction<string>>;
  tokenBalance: bigint;
  buymoreHighlight?: boolean;
  txLoading: boolean;
  buyMoreFn: (address: string) => void;
}) {
  const [outOfFocus, setOutOfFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInitial, setIsInitial] = useState(true);

  const debouncedHandleInputChange = debounce((inputCurrentValue: string) => {
    setCurrentInputValue(inputCurrentValue);
  }, 100);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!txLoading) {
      let inputCurrentValue = e.target.value;

      // Remove any non-numeric characters except the decimal point
      inputCurrentValue = inputCurrentValue
        .replace(/[^0-9.]/g, "")
        .replace(/^0+/, "");

      // Handle empty input
      if (inputCurrentValue === "") {
        setCurrentInputValue("");
      }

      // Do not allow decimal value
      if (inputCurrentValue.includes(".")) {
        errorToast("Value must be an integer");
        return;
      }

      // Validate the number with integer
      const numberValue = inputCurrentValue;

      if (numberValue !== "" && BigInt(numberValue) < BigInt(1)) {
        errorToast("Value must be greater than or equal to 1");
      }
      setCurrentInputValue(numberValue);

      debouncedHandleInputChange(inputCurrentValue);
    } else {
      setCurrentInputValue(inputValue);
    }
  }

  const account = useAccount();

  useEffect(() => {
    if (isInitial) {
      if (!account.isConnected) {
        setCurrentInputValue("1");
      } else {
        if (BigInt(Math.floor(Number(tokenBalance))) >= 0) {
          setCurrentInputValue(
            Math.min(Number(tokenBalance), MAX_INPUT).toString(),
          );
          setIsInitial(false);
        }
      }
    }
  }, [tokenBalance, account.isConnected]);

  function handleInputOutOfFocus() {
    setOutOfFocus(true);
  }

  return (
    <div className="relative flex flex-col gap-[8px] rounded-[6px] px-[12px] py-[16px] w-fit min-w-full z-10">
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-[#0A1133] to-[#142266] rounded-[inherit] border-[1px] border-agyellow z-[-1]"
      ></motion.div>
      <div className="flex justify-center items-center gap-[8px] w-full">
        <motion.div
          animate={{
            filter: getCurrentBuyAnimation(!!buymoreHighlight).light.filter,
          }}
          transition={
            getCurrentBuyAnimation(!!buymoreHighlight).light.transition
          }
          className="flex flex-col justify-center items-start gap-[8px] w-full"
        >
          <form
            onBlur={handleInputOutOfFocus}
            onFocus={(e) => {
              setOutOfFocus(false);
            }}
            onClick={() => {
              setOutOfFocus(false);
              inputRef.current?.focus();
            }}
            style={{
              fontSize: fontsizeClamping(String(inputValue), 7, 16, 32) + "px",
              lineHeight: 32 + "px",
            }}
            className="relative text-agwhite font-extrabold font-sans bg-transparent w-full h-fit flex justify-start items-center min-w-[8ch]"
          >
            <input
              ref={inputRef}
              className="text-agwhite font-extrabold font-sans bg-transparent w-full h-full"
              type="number"
              step="1"
              defaultValue={String(inputValue)}
              max={Math.min(Number(tokenBalance), 750).toString()}
              min={0}
              onBlur={(e) => {
                setOutOfFocus(true);
              }}
              onFocus={(e) => {
                setOutOfFocus(false);
              }}
              style={{
                opacity: outOfFocus ? 0 : 1,
                width: outOfFocus ? "0" : "100%",
                height: outOfFocus ? "0" : "fit-content",
                zIndex: outOfFocus ? 1 : 0,
              }}
              onChange={handleInputChange}
              value={inputValue}
              autoFocus
              disabled={txLoading}
            />

            <div
              style={{
                opacity: outOfFocus ? 1 : 0,
                width: outOfFocus ? "100%" : "0",
                height: outOfFocus ? "100%" : "0",
                zIndex: outOfFocus ? 0 : 1,
              }}
              className="flex justify-start items-center"
            >
              {inputRef &&
                pointsConverterToUSCommaseparated(Number(inputValue))}
            </div>
          </form>
        </motion.div>
        <div className="flex flex-col justify-end items-end gap-[8px]">
          <motion.div
            animate={{
              filter:
                getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
            }}
            transition={
              getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
            }
            className={twMerge(
              "flex justify-center items-center gap-[8px] h-full w-fit ml-auto",
            )}
          >
            <Pill
              text={"Dark"}
              iconSrc={IMAGEKIT_ICONS.PILL_DARK_X_CLAIMED}
              iconAlt={"dark"}
            />
          </motion.div>
          {account.isConnected && (
            <div className="flex justify-end items-end gap-[4px]">
              <motion.button
                animate={{
                  filter:
                    getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
                }}
                transition={
                  getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
                }
                className="flex justify-center items-center bg-gradient-to-b from-[#B4EBF8] rounded-full to-[#789DFA] p-[1px] box-padding w-fit h-fit"
                onClick={() =>
                  setCurrentInputValue(
                    Math.min(Number(tokenBalance), 750).toString(),
                  )
                }
              >
                <div className="bg-[#142266] rounded-full w-fit h-fit">
                  <div
                    className={twMerge(
                      "uppercase text-nowrap rounded-full text-[12px] leading-[12px] px-[8px] py-[4px] from-[#B4EBF8] to-[#789DFA] font-general-sans font-semibold bg-gradient-to-b text-transparent",
                      USFormatToNumber(String(inputValue)) <
                        Number(tokenBalance)
                        ? "bg-clip-text text-transparent"
                        : "text-agblack",
                    )}
                  >
                    MAX
                  </div>
                </div>
              </motion.button>
              <BuyMoreButtonWrapper buyMoreFn={buyMoreFn}>
                <div className="bg-[#142266] rounded-full w-fit h-fit">
                  <div className="uppercase text-nowrap rounded-full text-[12px] leading-[12px] px-[8px] py-[4px] from-[#B4EBF8] to-[#789DFA] font-general-sans font-semibold bg-gradient-to-b text-transparent bg-clip-text">
                    Buy More
                  </div>
                  <AnimatePresence>
                    {buymoreHighlight && (
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
                        transition={{
                          duration: 1,
                        }}
                        className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-[#B4EBF8] to-[#789DFA] blur-lg z-[-1] scale-[2]"
                      ></motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {buymoreHighlight && (
                    <motion.div className="absolute top-[calc(100%+8px)] right-0 xl:top-0 xl:left-[calc(100%+16px)] flex text-agwhite w-fit min-w-[300px] rounded-[4px] bg-gradient-to-tr from-brred to-blue p-[1px] z-10">
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "fit-content",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 1,
                        }}
                        className="w-fit h-fit bg-gradient-to-b from-[#030404] to-[#131A1A] flex items-center justify-between rounded-[inherit] gap-6 px-[16px] py-[8px] text-[16px] overflow-hidden"
                      >
                        Add more darkness to your wallet to pass.
                      </motion.div>
                      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-brred to-blue blur-lg z-[-1]"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </BuyMoreButtonWrapper>
            </div>
          )}
        </div>
      </div>
      {account.isConnected && (
        <motion.div
          animate={{
            filter: getCurrentBuyAnimation(!!buymoreHighlight).lighter.filter,
          }}
          transition={
            getCurrentBuyAnimation(!!buymoreHighlight).lighter.transition
          }
          className={`flex gap-[4px] justify-end items-center text-[16px] leading-[16px] text-agwhite opacity-75 font-general-sans font-semibold text-nowrap`}
        >
          <Image
            src={IMAGEKIT_ICONS.WALLET_WHITE}
            alt="hammer icon"
            width={24}
            height={24}
            className={twMerge("object-cover")}
          />
          {tokenBalance >= 0 ? String(tokenBalance) : <DotLoader />} $DARK
        </motion.div>
      )}
    </div>
  );
}

const BuyMoreButtonWrapper = ({
  buyMoreFn,
  children,
}: {
  buyMoreFn: (address: string) => void;
  children: ReactNode;
}) => {
  const account = useAccount();
  return (
    <div
      onClick={() => buyMoreFn(`${account.address}`)}
      className="relative flex cursor-pointer justify-center items-center bg-gradient-to-b from-[#B4EBF8] rounded-full to-[#789DFA] p-[1px] box-padding w-fit h-fit"
    >
      {children}
    </div>
  );
};

function fontsizeClamping(
  value: string,
  maxLengthForClamping: number,
  minFontSize: number,
  maxFontSize: number,
) {
  return value?.length >= maxLengthForClamping
    ? maxFontSize - (value?.length - maxLengthForClamping) >= minFontSize
      ? maxFontSize - (value?.length - maxLengthForClamping)
      : minFontSize
    : maxFontSize;
}

export function Card({
  value,
  multiplyer,
  pillIconSrc,
  pillText,
  pillIconAlt,
  onlyValue = false,
  addToWalletLink,
  buymoreHighlight,
}: {
  isEditable?: boolean;
  value: bigint;
  multiplyer?: string;
  pillIconSrc: string | StaticImport;
  pillText: string;
  dropDownSelected?: number;
  pillIconAlt: string;
  onlyValue?: boolean;
  addToWalletLink?: string;
  buymoreHighlight?: boolean;
}) {
  const [currentValue, setCurrentValue] = useState<bigint>(value);
  const targetValueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // if value is not changed withing 300ms, update the value
    const timeout = setTimeout(() => {
      setCurrentValue(value);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <motion.div
      animate={{
        filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
      }}
      transition={
        getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
      }
      className="flex justify-between gap-[16px] bg-gradient-to-b from-[#0A1133] to-[#142266] rounded-[6px] px-[12px] py-[16px] w-full min-w-full border-[1px] border-agyellow"
    >
      <div className="flex flex-col justify-start items-start gap-[8px] w-full">
        <div
          ref={targetValueRef}
          style={{
            fontSize:
              fontsizeClamping(
                String(USFormatToNumber(String(currentValue))),
                7,
                16,
                32,
              ) + "px",
            lineHeight: 32 + "px",
          }}
          className={` text-agwhite font-extrabold font-sans`}
        >
          {targetValueRef.current && (
            <AutomaticIncreamentalNumberCounterWithString
              from={targetValueRef.current?.textContent ?? "0"}
              // to={USFormatToNumber(currentValue.toString())}
              to={String(currentValue)}
              float={String(currentValue).includes(".")}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-[8px] justify-end items-end my-auto h-fit">
        <Pill
          text={String(pillText)}
          iconSrc={pillIconSrc}
          iconAlt={pillIconAlt}
          imageClassName="mix-blend-multiply"
        />
        {addToWalletLink && (
          <a
            href={addToWalletLink}
            target="_blank"
            className="flex justify-center items-center bg-gradient-to-b from-[#B4EBF8] rounded-full to-[#789DFA] p-[1px] box-padding w-fit h-fit"
          >
            <div className="bg-[#142266] rounded-full w-fit h-fit">
              <div className="uppercase text-nowrap rounded-full text-[12px] leading-[12px] px-[8px] py-[4px] from-[#B4EBF8] to-[#789DFA] font-general-sans font-semibold bg-gradient-to-b text-transparent bg-clip-text">
                Add to wallet
              </div>
            </div>
          </a>
        )}
      </div>
    </motion.div>
  );
}

function Multiplyer({ buymoreHighlight }: { buymoreHighlight?: boolean }) {
  const { journey, multiplier, rewardMultiplier } = useJourneyData();
  return (
    <div className="grid grid-flow-col place-items-center gap-[8px] mx-auto">
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).light.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="relative flex flex-col justify-center items-center p-[8px] rounded-[6px] border border-agyellow overflow-hidden w-fit z-0"
      >
        <div className="absolute inset-0 opacity-[0.66] bg-agblack -z-[1]"></div>
        <div className="text-[16px] leading-[19.2px] text-agwhite font-extrabold font-sans">
          Journey
        </div>
        <div className="text-[32px] leading-[32px] text-agwhite font-extrabold font-sans">
          {journey}
        </div>
      </motion.div>
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="relative flex flex-col justify-center items-center p-[8px] rounded-[6px] border border-agyellow overflow-hidden w-fit z-0"
      >
        <div className="absolute inset-0 opacity-[0.66] bg-agblack -z-[1]"></div>
        <div className="text-[16px] leading-[19.2px] text-agwhite font-extrabold font-sans">
          Bonus
        </div>
        <div className="text-[32px] leading-[32px] text-agwhite font-extrabold font-sans">
          {multiplier}x
        </div>
      </motion.div>
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="relative flex flex-col justify-center items-center p-[8px] rounded-[6px] border border-agyellow overflow-hidden w-fit z-0"
      >
        <div className="absolute inset-0 opacity-[0.66] bg-agblack -z-[1]"></div>
        <div className="text-[16px] leading-[19.2px] text-agwhite font-extrabold font-sans">
          Multiplier
        </div>
        <div className="text-[32px] leading-[32px] text-agwhite font-extrabold font-sans">
          {rewardMultiplier}x
        </div>
      </motion.div>
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="relative flex flex-col justify-center items-center px-[8px] py-[4px] rounded-[6px] border border-agyellow overflow-hidden w-fit z-0"
      >
        <div className="absolute inset-0 opacity-[0.66] bg-agblack -z-[1]"></div>
        <div className="text-[32px] leading-[32px] text-agwhite font-extrabold font-sans">
          =
        </div>
      </motion.div>
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        className="relative flex flex-col justify-center items-center p-[8px] rounded-[6px] border border-agyellow overflow-hidden w-fit z-0"
      >
        <div className="absolute inset-0 opacity-[0.66] bg-agblack -z-[1]"></div>
        <div className="text-[16px] leading-[19.2px] text-agwhite font-extrabold font-sans">
          Total
        </div>
        <div className="text-[32px] leading-[32px] text-agwhite font-extrabold font-sans">
          {rewardMultiplier * multiplier}x
        </div>
      </motion.div>
    </div>
  );
}

export default function MiningCalculator({
  value,
  setValue,
  multiplyer,
  tokenBalance,
  bonus,
  journey,
  buymoreHighlight,
  buyMoreFn,
  txLoading,
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  journey: number;
  multiplyer: number;
  tokenBalance: bigint;
  bonus: number;
  txLoading: boolean;
  buymoreHighlight?: boolean;
  buyMoreFn: (address: string) => void;
}) {
  return (
    <div className="relative flex flex-col gap-[8px] h-fit min-w-[400px] max-w-full scale-[0.8] xs:scale-[0.9] md:scale-100 z-10">
      <InputCard
        inputValue={value}
        setCurrentInputValue={setValue}
        tokenBalance={tokenBalance}
        buymoreHighlight={buymoreHighlight}
        buyMoreFn={buyMoreFn}
        txLoading={txLoading}
      />
      <p className=" font-bold text-right">
        Max Batch Size For Gas Optimization: 750
      </p>
      <Multiplyer buymoreHighlight={buymoreHighlight} />
      <motion.div
        animate={{
          filter: getCurrentBuyAnimation(!!buymoreHighlight).darkness.filter,
        }}
        transition={
          getCurrentBuyAnimation(!!buymoreHighlight).darkness.transition
        }
        style={{
          gap: "11px",
        }}
        className="flex justify-center items-center"
      >
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#FF5001",
            borderRadius: "100px",
          }}
        ></div>
        <div className="text-agblack uppercase tracking-wider text-nowrap font-bold font-general-sans rounded-[6px] backdrop-blur-[4px] bg-[#FEFFFF26] px-[8px] py-[4px]">
          you get:
        </div>
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#FF5001",
            borderRadius: "100px",
          }}
        ></div>
      </motion.div>
      <Card
        value={BigInt(value)}
        multiplyer={pointsConverterToUSCommaseparated(multiplyer)}
        pillIconAlt="fuel cells"
        pillIconSrc={IMAGEKIT_ICONS.FUEL_CELL}
        pillText="Fuel Cells"
        buymoreHighlight={buymoreHighlight}
      />
      <Card
        value={BigInt(Number(value) * multiplyer * bonus)}
        multiplyer={pointsConverterToUSCommaseparated(multiplyer)}
        pillIconAlt="Reward points"
        pillIconSrc={IMAGEKIT_ICONS.PILL_POINTS}
        pillText="Reward Points"
        buymoreHighlight={buymoreHighlight}
      />
    </div>
  );
}
