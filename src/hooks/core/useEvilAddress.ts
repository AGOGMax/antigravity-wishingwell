import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { useRestFetch, useRestPost } from "../useRestClient";
import { createMerkleTreeForLottery } from "../../toolsUtils/merkletree";
import MerkleTree from "merkletreejs";
import { encodePacked, keccak256, zeroAddress } from "viem";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "@wagmi/core";
import useEAContract from "@/abi/EvilAddress";
import { readContract } from "@wagmi/core";

const PRUNE_BATCH_SIZE = 50;

const useEvilAddress = () => {
  const [pruneLoading, setPruneLoading] = useState(false);
  const [vaporizeLoading, setVaporizeLoading] = useState(false);

  const EAContract = useEAContract();
  const account = useAccount();

  const {
    data: userWinnings,
    isFetched: userWinningsFetched,
    error: userWinningsError,
  } = useRestFetch<{
    lotteryResult: {
      isPruned: boolean;
      journeyId: number;
      lotteryId: number;
      tokenId: number;
      walletAddress: string;
    }[];
    uniqueCombinationTokens: {
      journeyId: number;
      lotteryId: number;
      tokenId: number;
    }[];
  }>(
    ["User Winnings in current lottery"],
    `/api/lottery-result?walletAddress=${EAContract.address}`,
    {
      enabled: EAContract.address !== zeroAddress,
    },
  );

  const lotteriesWon = useMemo(() => {
    if (userWinningsFetched) {
      console.log({ userWinnings });
      const uniqueLotteries = [
        ...new Set(
          userWinnings?.lotteryResult?.map(
            (item) => `${item.journeyId}_${item.lotteryId}`,
          ),
        ),
      ].map((pair) => ({
        ...pair.split("_").reduce(
          (acc, curr, index) => ({
            ...acc,
            [index === 0 ? "journeyId" : "lotteryId"]: Number(curr),
          }),
          {},
        ),
        count: userWinnings?.lotteryResult?.filter(
          (item) =>
            item.journeyId === Number(pair.split("_")[0]) &&
            item.lotteryId === Number(pair.split("_")[1]),
        ).length,
      })) as { journeyId: number; lotteryId: number; count: number }[];

      return uniqueLotteries;
    }
    return [];
  }, [userWinnings, userWinningsFetched]);

  const createMerkleTrees = async (): Promise<Record<string, MerkleTree>> => {
    try {
      let lotteryTrees2 = {};

      lotteriesWon.forEach((lottery) => {
        const list =
          userWinnings?.uniqueCombinationTokens?.[
            // @ts-ignore
            `${lottery.journeyId}_${lottery.lotteryId}`
          ] ?? [];

        console.log({ tag: `${lottery.journeyId}_${lottery.lotteryId}`, list });
        lotteryTrees2 = {
          ...lotteryTrees2,
          [`${lottery.journeyId}_${lottery.lotteryId}`]:
            createMerkleTreeForLottery(list),
        };
      });

      // lotteriesWon.forEach((lottery) => {});

      return lotteryTrees2;
    } catch (err) {
      console.log({ err });
      return {};
    }
  };

  const {
    writeContractAsync: batchPruneWinnings,
    error: batchPruneError,
    data: batchPruneHash,
  } = useWriteContract();

  const { data: mintsAllowed, isFetched: mintsAllowedFetched } =
    useReadContract({
      address: EAContract.address as `0x${string}`,
      abi: EAContract.abi,
      functionName: "PER_TRX_MINT_LIMIT",
    });

  const config = useConfig();

  const { mutateAsync: syncPrune } = useRestPost(["sync prune"], "/api/prune");

  const evilPrune = async () => {
    setPruneLoading(true);
    const trees = await createMerkleTrees();
    const TEAM_FEE = (await readContract(config, {
      address: EAContract.address as `0x${string}`,
      abi: EAContract.abi,
      functionName: "TEAM_FEE",
      args: [],
    })) as bigint;
    console.log({ TEAM_FEE });

    let proofs =
      userWinnings?.lotteryResult?.map((win) => {
        const { lotteryId, tokenId, journeyId } = win;
        const merkleTree = trees[`${journeyId}_${lotteryId}`];

        const leaf = keccak256(
          encodePacked(
            ["uint256", "uint16", "uint16"],
            [BigInt(tokenId), journeyId, lotteryId],
          ),
        );

        const proof = merkleTree.getHexProof(leaf);
        return {
          journeyId,
          lotteryId,
          tokenId: BigInt(`${tokenId}`),
          proofs: proof,
        };
      }) ?? [];

    try {
      // console.log({
      //   proofSize: (() => {
      //     let len = 0;
      //     let max = 0;
      //     proofs.forEach((proof) => {
      //       max = Math.max(max, proof.proofs.length);
      //       len += proof.proofs.length;
      //     });
      //     return { avg: len / proofs.length, total: len, max };
      //   })(),
      // });

      const tx = await batchPruneWinnings({
        address: EAContract.address as `0x${string}`,
        abi: EAContract.abi,
        functionName: "evilPrune",
        args: [proofs],
        value: TEAM_FEE,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        confirmations: 2,
      });

      console.log({ status: true, receipt });
      toast.success("Evil Scrape Successful!");
      await syncPrune({ walletAddress: EAContract.address });
    } catch (err) {
      console.error({ err });
      toast.error(`Scrape Failed! Please Try again.`);
      console.log({ status: "failed" });
      await syncPrune({ walletAddress: EAContract.address });
    }
    setPruneLoading(false);
  };

  // Mint
  const { writeContractAsync: evilMintFn } = useWriteContract();
  const [evilMintLoading, setEvilMintLoading] = useState(false);

  // Vaporize
  const { writeContractAsync: vaporizeFn } = useWriteContract();

  // Check if V2 is deployed by reading version()
  const { data: contractVersion, isError: versionError } = useReadContract({
    address: EAContract.address as `0x${string}`,
    abi: EAContract.abi,
    functionName: "version",
  });

  // Check if vaporize is disabled (only works on V2)
  const { data: isVaporizeDisabled } = useReadContract({
    address: EAContract.address as `0x${string}`,
    abi: EAContract.abi,
    functionName: "vaporizeDisabled",
    query: {
      enabled: !!contractVersion && !versionError,
    },
  });

  // V2 is available if version() returns a value
  const isV2Available = !!contractVersion && !versionError;

  // Vaporizable tokens state
  // status: 'no-win' = didn't win, 'won-scraped' = won and scraped, 'won-pending' = won but needs scrape
  const [vaporizableTokens, setVaporizableTokens] = useState<
    { tokenId: string; journeyId: number; canVaporize: boolean; status: 'no-win' | 'won-scraped' | 'won-pending' }[]
  >([]);
  const [loadingVaporizableTokens, setLoadingVaporizableTokens] = useState(false);
  const [vaporizableScanProgress, setVaporizableScanProgress] = useState(0);
  const scanAbortRef = useRef(false);

  // Stop any running scan
  const stopScan = () => {
    scanAbortRef.current = true;
    setLoadingVaporizableTokens(false);
  };

  // Clear scan results
  const clearScanResults = () => {
    stopScan();
    setVaporizableTokens([]);
    setVaporizableScanProgress(0);
  };

  // Journey ranges state
  const [journeyRanges, setJourneyRanges] = useState<
    { journeyId: number; start: number; end: number }[]
  >([]);
  const [currentJourneyId, setCurrentJourneyId] = useState<number>(9);
  const [loadingJourneyRanges, setLoadingJourneyRanges] = useState(false);

  // Contract addresses (PulseChain mainnet)
  const FUELCELL_ADDRESS = "0x2187816076a1a129d03b4c14c88983AAf54052e3";
  const JACKPOT_ADDRESS = "0x1b8E4f5300706651c3E6fE166487cCa03dE690B6";
  const JPM_ADDRESS = "0xb2561655DAF1DE668F0240aCC6Cb9fb6f2b0450E";

  // Fetch journey ranges from contract
  const fetchJourneyRanges = async () => {
    setLoadingJourneyRanges(true);
    try {
      // Get current journey
      const currentJ = await readContract(config, {
        address: JPM_ADDRESS as `0x${string}`,
        abi: [
          {
            name: "currentJourney",
            type: "function",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "currentJourney",
      });
      setCurrentJourneyId(Number(currentJ));

      // Fetch ranges for journeys 1 to current
      const ranges: { journeyId: number; start: number; end: number }[] = [];
      for (let j = 1; j <= Number(currentJ); j++) {
        try {
          const start = await readContract(config, {
            address: JPM_ADDRESS as `0x${string}`,
            abi: [
              {
                name: "startTokenIdInJourney",
                type: "function",
                inputs: [{ name: "journeyId", type: "uint256" }],
                outputs: [{ name: "", type: "uint256" }],
                stateMutability: "view",
              },
            ],
            functionName: "startTokenIdInJourney",
            args: [BigInt(j)],
          });
          const end = await readContract(config, {
            address: JPM_ADDRESS as `0x${string}`,
            abi: [
              {
                name: "lastTokenIdInJourney",
                type: "function",
                inputs: [{ name: "journeyId", type: "uint256" }],
                outputs: [{ name: "", type: "uint256" }],
                stateMutability: "view",
              },
            ],
            functionName: "lastTokenIdInJourney",
            args: [BigInt(j)],
          });
          if (Number(start) > 0) {
            ranges.push({ journeyId: j, start: Number(start), end: Number(end) });
          }
        } catch {
          // Skip if journey doesn't exist
        }
      }
      setJourneyRanges(ranges);
    } catch (err) {
      console.error("Failed to fetch journey ranges:", err);
    }
    setLoadingJourneyRanges(false);
  };

  // Fetch journey ranges on mount
  useEffect(() => {
    fetchJourneyRanges();
  }, []);

  const scanVaporizableTokens = async (startTokenId: number, endTokenId: number) => {
    if (!EAContract.address || EAContract.address === zeroAddress) return;

    // Reset abort flag and start scan
    scanAbortRef.current = false;
    setLoadingVaporizableTokens(true);
    setVaporizableTokens([]);
    setVaporizableScanProgress(0);

    // Build map of winning tokens from userWinnings data
    // tokenId -> isPruned (true = scraped, false = needs scrape)
    const winningTokensMap = new Map<number, boolean>();
    console.log("Scanner userWinnings:", {
      userWinnings,
      userWinningsFetched,
      lotteryResultCount: userWinnings?.lotteryResult?.length,
      EAAddress: EAContract.address
    });
    userWinnings?.lotteryResult?.forEach((win) => {
      winningTokensMap.set(win.tokenId, win.isPruned);
    });

    // Log winning token IDs for debugging
    const winningTokenIds = Array.from(winningTokensMap.keys()).sort((a, b) => a - b);
    console.log("🎯 Winning token IDs:", winningTokenIds);
    console.log("🔍 Scanning range:", startTokenId, "to", endTokenId);

    // Check if any winning tokens are in scan range
    const winningInRange = winningTokenIds.filter(id => id >= startTokenId && id <= endTokenId);
    console.log("🎲 Winning tokens IN scan range:", winningInRange.length, winningInRange.slice(0, 10));

    const found: { tokenId: string; journeyId: number; canVaporize: boolean; status: 'no-win' | 'won-scraped' | 'won-pending' }[] = [];
    const batchSize = 20;
    const total = endTokenId - startTokenId;

    for (let i = startTokenId; i <= endTokenId; i += batchSize) {
      // Check if scan was aborted
      if (scanAbortRef.current) {
        console.log("Scan aborted");
        return;
      }

      const batchEnd = Math.min(i + batchSize - 1, endTokenId);
      const promises = [];

      for (let tokenId = i; tokenId <= batchEnd; tokenId++) {
        promises.push(
          (async () => {
            if (scanAbortRef.current) return; // Early exit if aborted
            try {
              // Check owner
              const owner = await readContract(config, {
                address: FUELCELL_ADDRESS as `0x${string}`,
                abi: [
                  {
                    name: "ownerOf",
                    type: "function",
                    inputs: [{ name: "tokenId", type: "uint256" }],
                    outputs: [{ name: "", type: "address" }],
                    stateMutability: "view",
                  },
                ],
                functionName: "ownerOf",
                args: [BigInt(tokenId)],
              });

              if (scanAbortRef.current) return; // Check again after RPC call

              if (owner?.toString().toLowerCase() === EAContract.address?.toLowerCase()) {
                // Get journey ID
                let journeyId = 8; // Default for known range
                try {
                  const journey = await readContract(config, {
                    address: EAContract.address as `0x${string}`,
                    abi: EAContract.abi,
                    functionName: "getJourneyForToken",
                    args: [BigInt(tokenId)],
                  });
                  journeyId = Number(journey);
                } catch {
                  // Use default
                }

                // Check if token can be vaporized using userWinnings data:
                // - If token WON and NOT scraped (isPruned=false) -> cannot vaporize
                // - If token WON and scraped (isPruned=true) -> can vaporize
                // - If token did NOT win (not in map) -> can vaporize
                let canVaporize = true;
                let status: 'no-win' | 'won-scraped' | 'won-pending' = 'no-win';

                const isWinner = winningTokensMap.has(tokenId);
                if (isWinner) {
                  const isPruned = winningTokensMap.get(tokenId);
                  console.log(`🏆 Token ${tokenId} is a WINNER! isPruned=${isPruned}`);
                  if (isPruned) {
                    status = 'won-scraped';
                    canVaporize = true;
                  } else {
                    status = 'won-pending';
                    canVaporize = false;
                  }
                }

                if (!scanAbortRef.current) {
                  found.push({
                    tokenId: tokenId.toString(),
                    journeyId,
                    canVaporize,
                    status,
                  });
                }
              }
            } catch {
              // Token doesn't exist or error
            }
          })()
        );
      }

      await Promise.all(promises);

      if (scanAbortRef.current) return; // Final check before updating state

      setVaporizableScanProgress(Math.min(100, Math.round(((i - startTokenId) / total) * 100)));
      setVaporizableTokens([...found]);
    }

    if (!scanAbortRef.current) {
      setLoadingVaporizableTokens(false);
      setVaporizableScanProgress(100);

      // Summary log
      const noWin = found.filter(t => t.status === 'no-win').length;
      const wonScraped = found.filter(t => t.status === 'won-scraped').length;
      const wonPending = found.filter(t => t.status === 'won-pending').length;
      console.log("📊 Scan complete:", {
        total: found.length,
        noWin,
        wonScraped,
        wonPending,
        tokenIdsSample: found.slice(0, 5).map(t => t.tokenId)
      });
    }
  };

  // Preview DARK release for vaporize
  const previewVaporize = async (journeyId: number, tokenCount: number): Promise<bigint> => {
    console.log("previewVaporize called:", { journeyId, tokenCount, address: EAContract.address });
    if (!journeyId || journeyId <= 0 || !tokenCount || tokenCount <= 0) {
      console.log("Invalid args, returning 0");
      return BigInt(0);
    }
    try {
      const darkAmount = await readContract(config, {
        address: EAContract.address as `0x${string}`,
        abi: EAContract.abi,
        functionName: "previewVaporize",
        args: [BigInt(journeyId), BigInt(tokenCount)],
      });
      console.log("previewVaporize result:", darkAmount);
      return darkAmount as bigint;
    } catch (err) {
      console.error("Preview failed:", err);
      return BigInt(0);
    }
  };

  const vaporize = async (journeyId: number, tokenIds: bigint[]) => {
    try {
      setVaporizeLoading(true);

      const tx = await vaporizeFn({
        address: EAContract.address as `0x${string}`,
        abi: EAContract.abi,
        functionName: "vaporize",
        args: [BigInt(journeyId), tokenIds],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        confirmations: 2,
      });

      console.log({ status: "Vaporize Passed", receipt });
      toast.success(`Vaporize Successful! DARK sent to Treasury.`);
      setVaporizeLoading(false);
      return true;
    } catch (err: any) {
      console.log({ err });
      console.log({ status: "Vaporize Failed" });
      setVaporizeLoading(false);

      // Handle specific errors
      if (err?.message?.includes("VaporizeIsDisabled")) {
        toast.error("Vaporize is currently disabled by owner.");
      } else if (err?.message?.includes("UnclaimedJackpotWinnings")) {
        toast.error("FuelCell has unclaimed jackpot winnings. Scrape first!");
      } else {
        toast.error("Failed to Vaporize! Please Try Again");
      }
      return false;
    }
  };

  const evilMint = async () => {
    try {
      setEvilMintLoading(true);
      const TEAM_FEE = (await readContract(config, {
        address: EAContract.address as `0x${string}`,
        abi: EAContract.abi,
        functionName: "TEAM_FEE",
        args: [],
      })) as bigint;

      console.log({ TEAM_FEE });
      const tx = await evilMintFn({
        address: EAContract.address as `0x${string}`,
        abi: EAContract.abi,
        functionName: "evilMint",
        args: [],
        value: TEAM_FEE,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        confirmations: 2,
      });

      console.log({ status: "Mint Passed", receipt });
      toast.success(`Evil Mint Successful!`);
      setEvilMintLoading(false);
    } catch (err) {
      console.log({ err });
      console.log({ status: "Mint Failed" });
      setEvilMintLoading(false);
      toast.error("Failed to Evil Mint! Please Try Again");
    }
  };

  const { data: mintState, mutateAsync: fetchMintState } = useRestPost<{
    currentJourney: string;
    currentPhase: string;
    isJourneyPaused: boolean;
    nextJourneyTimestamp: string;
    mintEndTimestamp: string;
    multiplier: number;
    rewardMultiplier: string;
  }>(["fetching mint state"], "/api/era-3-timestamps-multipliers");

  const { data: mintedOut, isFetched } = useReadContract({
    address: EAContract.address as `0x${string}`,
    abi: EAContract.abi,
    functionName: "mintedInJourney",
    args: [Number(mintState?.currentJourney) ?? 0],
    query: {
      enabled: !!mintState?.currentJourney,
    },
  });

  useEffect(() => {
    const fetch = async () => {
      const mintState = await fetchMintState({
        walletAddress: account.address ?? "",
      });
      console.log({ mintState });
    };

    fetch();
  }, []);

  const isMintActive = useMemo(() => {
    if (mintState) {
      if (mintState.mintEndTimestamp) return true;
    }
    return false;
  }, [mintState]);

  const mintTimestamp = useMemo(() => {
    if (mintState) {
      return Number(
        mintState.mintEndTimestamp !== ""
          ? mintState.mintEndTimestamp
          : mintState.nextJourneyTimestamp,
      );
    }
    return ~~(new Date().getTime() / 1000);
  }, [mintState]);

  return {
    perPruneChunk: Math.min(
      PRUNE_BATCH_SIZE,
      userWinnings?.lotteryResult.length ?? 0,
    ),
    evilMint,
    evilMintLoading,
    mintsAllowed,
    evilPrune,
    evilPruneLoading: pruneLoading,
    isMintActive,
    mintTimestamp,
    mintedOut: (isFetched && mintedOut) as boolean,
    // V2 Vaporize
    vaporize,
    vaporizeLoading,
    isVaporizeDisabled: isVaporizeDisabled as boolean,
    isV2Available,
    previewVaporize,
    evilAddressContract: EAContract,
    // Vaporizable tokens scanner
    scanVaporizableTokens,
    stopScan,
    clearScanResults,
    vaporizableTokens,
    loadingVaporizableTokens,
    vaporizableScanProgress,
    // Journey ranges (from contract)
    journeyRanges,
    currentJourneyId,
    loadingJourneyRanges,
  };
};

export default useEvilAddress;
