import { useEffect, useMemo, useState } from "react";
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
  };
};

export default useEvilAddress;
