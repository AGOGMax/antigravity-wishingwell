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
import { useEffect, useState } from "react";
import { PiFireDuotone } from "react-icons/pi";

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

function Vaporize({
  vaporize,
  vaporizeLoading,
  isVaporizeDisabled,
  journeyId,
  setJourneyId,
  tokenIdsInput,
  setTokenIdsInput,
  scanVaporizableTokens,
  stopScan,
  clearScanResults,
  vaporizableTokens,
  loadingVaporizableTokens,
  vaporizableScanProgress,
  journeyRanges,
  currentJourneyId,
  loadingJourneyRanges,
  previewVaporize,
}: {
  vaporize: (journeyId: number, tokenIds: bigint[]) => Promise<boolean>;
  vaporizeLoading: boolean;
  isVaporizeDisabled: boolean;
  journeyId: string;
  setJourneyId: (value: string) => void;
  tokenIdsInput: string;
  setTokenIdsInput: (value: string) => void;
  scanVaporizableTokens: (start: number, end: number) => Promise<void>;
  stopScan: () => void;
  clearScanResults: () => void;
  vaporizableTokens: { tokenId: string; journeyId: number; canVaporize: boolean }[];
  loadingVaporizableTokens: boolean;
  vaporizableScanProgress: number;
  journeyRanges: { journeyId: number; start: number; end: number }[];
  currentJourneyId: number;
  loadingJourneyRanges: boolean;
  previewVaporize: (journeyId: number, tokenCount: number) => Promise<bigint>;
}) {
  const sectionDisabled = isVaporizeDisabled;

  const readyTokens = vaporizableTokens.filter((t) => t.canVaporize);
  const pendingTokens = vaporizableTokens.filter((t) => !t.canVaporize);

  // Scanner inputs - initialized when journey ranges load
  const [scanStart, setScanStart] = useState("");
  const [scanEnd, setScanEnd] = useState("");
  const [scanLimit, setScanLimit] = useState("500");
  const [initialized, setInitialized] = useState(false);

  // DARK preview state - fetch yield per token once per journey, multiply locally
  const [yieldPerToken, setYieldPerToken] = useState<bigint>(BigInt(0));
  const [loadingYield, setLoadingYield] = useState(false);
  const [lastFetchedJourney, setLastFetchedJourney] = useState<string>("");

  // Calculate token count from input
  const tokenCount = tokenIdsInput
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "").length;

  // Fetch yield per token only when journey changes
  useEffect(() => {
    const jId = parseInt(journeyId);
    if (!journeyId || isNaN(jId) || jId <= 0 || journeyId === lastFetchedJourney) {
      return;
    }

    const fetchYield = async () => {
      setLoadingYield(true);
      const amount = await previewVaporize(jId, 1); // Get yield for 1 token
      setYieldPerToken(amount);
      setLastFetchedJourney(journeyId);
      setLoadingYield(false);
    };
    fetchYield();
  }, [journeyId]); // Only depends on journeyId

  // Calculate preview by multiplying locally (no extra RPC calls)
  const darkPreview = yieldPerToken * BigInt(tokenCount || 0);

  // Format DARK amount (18 decimals)
  const formatDark = (amount: bigint) => {
    const num = Number(amount) / 1e18;
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  // Initialize with current journey range when data loads
  useEffect(() => {
    if (!initialized && journeyRanges.length > 0 && currentJourneyId > 0) {
      const currentRange = journeyRanges.find((r) => r.journeyId === currentJourneyId);
      if (currentRange) {
        setScanStart(currentRange.start.toString());
        setJourneyId(currentJourneyId.toString());
        setInitialized(true);
      }
    }
  }, [journeyRanges, currentJourneyId, initialized, setJourneyId]);

  const handleScan = () => {
    if (!scanStart) {
      return; // Wait for journey ranges to load
    }
    const start = parseInt(scanStart);
    const limit = parseInt(scanLimit) || 500;
    if (isNaN(start)) return;
    scanVaporizableTokens(start, start + limit - 1);
  };

  const MAX_VAPORIZE = 300;

  const selectAllReady = () => {
    // Limit to first 300 tokens
    const selected = readyTokens.slice(0, MAX_VAPORIZE);
    const ids = selected.map((t) => t.tokenId).join(", ");
    setTokenIdsInput(ids);
    if (selected.length > 0) {
      setJourneyId(selected[0].journeyId.toString());
    }
  };

  const handleVaporize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyId || !tokenIdsInput) return;

    // Parse token IDs from comma-separated input, limit to first 300
    const tokenIds = tokenIdsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .slice(0, MAX_VAPORIZE)
      .map((s) => BigInt(s));

    if (tokenIds.length === 0) return;

    await vaporize(Number(journeyId), tokenIds);
  };

  return (
    <div
      className={cn(
        "relative border-[1px] border-agorange rounded-[6px] p-[8px] pb-[32px] bg-agwhite/30 backdrop-blur-lg w-full",
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center w-full gap-[8px] -translate-y-[calc(50%+8px)]",
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
          <HoverTextAnimation.Fading text="Vaporize FuelCells" />
        </motion.div>
      </div>
      <form
        onSubmit={handleVaporize}
        className={cn(
          "flex flex-col justify-center items-center gap-[8px] ",
          "w-full md:w-[400px]",
          sectionDisabled && "blur-lg select-none",
        )}
      >
        {/* Scan Section */}
        <div className="w-full bg-agblack/30 rounded-[6px] p-[8px] border border-agyellow/50">
          <p className="text-agwhite text-[12px] mb-2">Scan Token Range</p>
          {/* Journey Presets - loaded from contract */}
          <div className="flex flex-wrap gap-1 mb-2">
            <p className="text-agwhite/50 text-[10px] w-full">
              {loadingJourneyRanges ? "Loading journeys..." : "Quick select journey:"}
            </p>
            {journeyRanges
              .slice()
              .reverse()
              .slice(0, 5)
              .map(({ journeyId: j, start, end }) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => {
                    clearScanResults(); // Stop scan and clear results
                    setTokenIdsInput(""); // Clear selected tokens
                    setScanStart(start.toString());
                    setJourneyId(j.toString());
                  }}
                  className={cn(
                    "px-2 py-1 text-[10px] rounded",
                    j === parseInt(journeyId)
                      ? "bg-agyellow/50 text-agwhite font-bold"
                      : j === currentJourneyId
                        ? "bg-agyellow/30 text-agwhite hover:bg-agyellow/40 border border-agyellow/50"
                        : "bg-agyellow/20 text-agwhite hover:bg-agyellow/40"
                  )}
                  disabled={sectionDisabled || loadingJourneyRanges}
                >
                  J{j}
                </button>
              ))}
          </div>
          {/* Show selected journey range */}
          {journeyId && journeyRanges.find((r) => r.journeyId === parseInt(journeyId)) && (
            <div className="text-agwhite/70 text-[11px] mb-2 bg-agblack/30 px-2 py-1 rounded">
              J{journeyId} range: {journeyRanges.find((r) => r.journeyId === parseInt(journeyId))?.start.toLocaleString()}
              {" → "}
              {journeyRanges.find((r) => r.journeyId === parseInt(journeyId))?.end.toLocaleString()}
              {" "}
              ({((journeyRanges.find((r) => r.journeyId === parseInt(journeyId))?.end || 0) -
                 (journeyRanges.find((r) => r.journeyId === parseInt(journeyId))?.start || 0) + 1).toLocaleString()} tokens)
            </div>
          )}
          <div className="flex gap-2 mb-1">
            <div className="flex-1">
              <p className="text-agwhite/50 text-[10px] mb-1">Start from</p>
              <input
                type="number"
                placeholder="Start Token ID"
                value={scanStart}
                onChange={(e) => setScanStart(e.target.value)}
                className="w-full px-[8px] py-[4px] rounded-[4px] bg-agblack/50 text-agwhite border border-agyellow/50 text-[12px]"
                disabled={loadingVaporizableTokens || sectionDisabled}
              />
            </div>
            <div className="w-[100px]">
              <p className="text-agwhite/50 text-[10px] mb-1">How many</p>
              <input
                type="number"
                placeholder="Count"
                value={scanLimit}
                onChange={(e) => setScanLimit(e.target.value)}
                className="w-full px-[8px] py-[4px] rounded-[4px] bg-agblack/50 text-agwhite border border-agyellow/50 text-[12px]"
                disabled={loadingVaporizableTokens || sectionDisabled}
              />
            </div>
          </div>
          <p className="text-agwhite/50 text-[10px] mb-2">Lower count = faster. Max 300 vaporize per tx.</p>
          <Button
            type="button"
            onClick={handleScan}
            disabled={loadingVaporizableTokens || sectionDisabled || loadingJourneyRanges || !scanStart}
            loading={loadingVaporizableTokens || loadingJourneyRanges}
            loadingText={loadingJourneyRanges ? "Loading ranges..." : `Scanning... ${vaporizableScanProgress}%`}
            className="w-full"
          >
            <HoverTextAnimation.RollingIn text="Scan" />
          </Button>
        </div>

        {/* Token List */}
        {vaporizableTokens.length > 0 && (
          <div className="w-full bg-agblack/50 rounded-[6px] p-[8px] border border-agyellow max-h-[200px] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="text-agwhite text-[12px]">
                Found: {readyTokens.length} ready, {pendingTokens.length} pending scrape
              </p>
              {readyTokens.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllReady}
                  className="text-agyellow text-[12px] underline"
                >
                  Select {readyTokens.length > MAX_VAPORIZE ? `first ${MAX_VAPORIZE}` : "all"} ready
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {vaporizableTokens.map((t) => (
                <span
                  key={t.tokenId}
                  onClick={() => {
                    if (t.canVaporize) {
                      setTokenIdsInput(
                        tokenIdsInput ? `${tokenIdsInput}, ${t.tokenId}` : String(t.tokenId)
                      );
                      setJourneyId(t.journeyId.toString());
                    }
                  }}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded cursor-pointer",
                    t.canVaporize
                      ? "bg-green-600/50 text-agwhite hover:bg-green-500/50"
                      : "bg-red-600/30 text-agwhite/50 cursor-not-allowed"
                  )}
                  title={t.canVaporize ? "Ready to vaporize" : "Won jackpot - scrape first"}
                >
                  {t.tokenId}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[8px] w-full">
          <input
            type="number"
            placeholder="Journey ID (e.g., 8)"
            value={journeyId}
            onChange={(e) => setJourneyId(e.target.value)}
            className="w-full px-[12px] py-[8px] rounded-[6px] bg-agblack/50 text-agwhite border border-agyellow"
            disabled={sectionDisabled || vaporizeLoading}
          />
          <textarea
            placeholder="Token IDs (comma-separated, e.g., 641429, 641430, 641431)"
            value={tokenIdsInput}
            onChange={(e) => setTokenIdsInput(e.target.value)}
            className="w-full px-[12px] py-[8px] rounded-[6px] bg-agblack/50 text-agwhite border border-agyellow min-h-[80px]"
            disabled={sectionDisabled || vaporizeLoading}
          />
        </div>
        {/* DARK Preview */}
        {tokenCount > 0 && (
          <div className="w-full bg-agblack/50 rounded-[6px] p-[8px] border border-green-500/50">
            <div className="flex justify-between items-center">
              <p className="text-agwhite/70 text-[12px]">Estimated DARK to Treasury:</p>
              <p className="text-green-400 text-[16px] font-bold">
                {loadingYield ? "..." : `${formatDark(darkPreview)} DARK`}
              </p>
            </div>
            <p className="text-agwhite/50 text-[10px] mt-1">
              {tokenCount} FuelCell{tokenCount > 1 ? "s" : ""} × Journey {journeyId}
              {yieldPerToken === BigInt(0) && !loadingYield && " (yield not distributed yet)"}
            </p>
          </div>
        )}

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
          <p className="text-agwhite text-[14px] leading-[18px] font-sans w-full">
            Burns FuelCells & sends DARK to Treasury
          </p>
          <Button
            initial="initial"
            whileHover="hover"
            type="submit"
            disabled={sectionDisabled || vaporizeLoading || !journeyId || !tokenIdsInput}
            loading={vaporizeLoading}
            loadingText="Vaporizing..."
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
              {sectionDisabled || vaporizeLoading ? (
                <PiLockKeyDuotone />
              ) : (
                <PiFireDuotone />
              )}
            </motion.div>
            <HoverTextAnimation.RollingIn
              text={isVaporizeDisabled ? "Disabled" : "Vaporize"}
            />
          </Button>
        </div>
      </form>
      {sectionDisabled && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2",
            "flex flex-col justify-start items-start gap-[8px]",
            "p-[8px] rounded-[6px]",
            "bg-agblack/30 backdrop-blur-lg",
            "font-extrabold z-10",
          )}
        >
          <p className="text-agwhite text-[16px] font-sans">Disabled by Owner</p>
        </div>
      )}
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
    // V2 Vaporize
    vaporize,
    vaporizeLoading,
    isVaporizeDisabled,
    previewVaporize,
    // Token scanner
    scanVaporizableTokens,
    stopScan,
    clearScanResults,
    vaporizableTokens,
    loadingVaporizableTokens,
    vaporizableScanProgress,
    // Journey ranges from contract
    journeyRanges,
    currentJourneyId,
    loadingJourneyRanges,
  } = useEvilAddress();

  // Vaporize form state - default will be set by journey ranges from contract
  const [journeyId, setJourneyId] = useState("");
  const [tokenIdsInput, setTokenIdsInput] = useState("");

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
          <Vaporize
            vaporize={vaporize}
            vaporizeLoading={vaporizeLoading}
            isVaporizeDisabled={isVaporizeDisabled}
            journeyId={journeyId}
            setJourneyId={setJourneyId}
            tokenIdsInput={tokenIdsInput}
            setTokenIdsInput={setTokenIdsInput}
            scanVaporizableTokens={scanVaporizableTokens}
            stopScan={stopScan}
            clearScanResults={clearScanResults}
            vaporizableTokens={vaporizableTokens}
            loadingVaporizableTokens={loadingVaporizableTokens}
            vaporizableScanProgress={vaporizableScanProgress}
            journeyRanges={journeyRanges}
            currentJourneyId={currentJourneyId}
            loadingJourneyRanges={loadingJourneyRanges}
            previewVaporize={previewVaporize}
          />
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
