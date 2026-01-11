import useJackpotContract from "@/abi/Jackpot";
import useJPMContract from "@/abi/JourneyPhaseManager";
import { useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useGQLFetch } from "../useGraphQLClient";
import { gql } from "graphql-request";
import { useRestFetch, useRestPost } from "../useRestClient";
import { createMerkleTreeForLottery } from "../../toolsUtils/merkletree";
import MerkleTree from "merkletreejs";
import { encodePacked, keccak256 } from "viem";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "@wagmi/core";
import useEAContract from "@/abi/EvilAddress";
import { getTransactionCount } from "@wagmi/core";
import { lotteryBuffer, TEST_NETWORK } from "@/constants";
import { TESTCHAINS } from "@/components/RainbowKit";
import { pulsechain } from "viem/chains";

const PRUNE_BATCH_SIZE = 50;
const GAS_LIMIT = 4_000_000; // 4 million gas limit for pruning

const useLottery = (): {
  nextLotteryTimestamp: number;
  lotteriesInfo: { journeyId: string; lotteryId: string } | null;
  lotteryPayout: string;
  currentPhase: number;
  currentJourney: number;
  fuelCellsWon: number;
  batchPrune: () => void;
  pruneLoading: boolean;
  pruneBatch: { from: number; to: number; total: number };
  createMerkleTrees: () => Promise<Record<string, MerkleTree>>;
  onTimerEnd: () => void;
} => {
  const account = useAccount();
  const [pruneLoading, setPruneLoading] = useState(false);
  const [prePrune, setPrePrune] = useState(false);
  const [refetchInfo, setRefetchInfo] = useState(true);
  const [pruneBatch, setPruneBatch] = useState({
    from: 0,
    to: PRUNE_BATCH_SIZE,
    total: PRUNE_BATCH_SIZE,
  });

  const onTimerEnd = () => {
    setRefetchInfo(true);
  };

  // define contract instances here
  const JPMContract = useJPMContract();
  const JackpotContract = useJackpotContract();
  const EAContract = useEAContract();

  const userAccount = useMemo(() => {
    // return EAContract.address;
    return account.address;
  }, [account.address]);

  // Reads from contracts
  const { data: JPMReadData, error: JPMReadError } = useReadContracts({
    contracts: [
      "currentJourney",
      "currentPhase",
      "getNextPhaseTimestamp",
      "getNextJourneyTimestamp",
      "PHASE_1_DURATION",
      "PHASE_2_DURATION",
      "LOTTERIES_PER_JOURNEY",
      "PHASE_3_DURATION",
    ].map((functionName) => ({
      address: JPMContract?.address,
      abi: JPMContract?.abi,
      functionName,
    })),
    query: {
      enabled: refetchInfo,
    },
  });

  const timestampToString = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const { data: lotteryPayouts, isFetched: lotteryPayoutsFetched } =
    useGQLFetch<{
      lotteryResults: {
        items: {
          journeyId: string;
          lotteryId: string;
          payoutPerFuelCell: string;
        }[];
      };
    }>(
      ["lottery payouts"],
      gql`
        query MyQuery {
          lotteryResults(orderBy: "timestamp", orderDirection: "desc") {
            items {
              journeyId
              lotteryId
              payoutPerFuelCell
              numberOfWinners
            }
          }
        }
      `,
      TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
      {},
      { enabled: refetchInfo },
    );

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
    // `/api/lottery-result?walletAddress=${EAContract.address}`,
    `/api/lottery-result?walletAddress=${userAccount}`,
    {
      enabled: account.isConnected && refetchInfo,
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

  const totalWinnings = useMemo(() => {
    if (lotteryPayouts && lotteriesWon) {
      const payouts = lotteryPayouts.lotteryResults.items;

      console.log({ payouts });

      let sum = BigInt(0);

      lotteriesWon.map((lottery) => {
        const { lotteryId, journeyId, count } = lottery;
        const payoutItem = payouts.find(
          (item) =>
            Number(item.journeyId) === journeyId &&
            Number(item.lotteryId) === lotteryId,
        );
        if (payoutItem) {
          const payout = BigInt(payoutItem.payoutPerFuelCell);
          sum += BigInt(count) * payout;
        }
      });
      return sum.toString();
    }

    return "0";
  }, [lotteriesWon, lotteryPayouts]);

  const lotteriesInfo = useMemo(() => {
    if (lotteryPayoutsFetched) {
      const payouts = lotteryPayouts?.lotteryResults.items ?? [];

      const latestPayout = payouts[0];

      if (latestPayout) {
        console.log({ latestPayout });

        return {
          journeyId: latestPayout.journeyId,
          lotteryId: latestPayout.lotteryId,
        };
      } else {
        return null;
      }
    }

    return null;
  }, [lotteryPayouts, lotteryPayoutsFetched]);

  const nextLotteryTimestamp = useMemo(() => {
    if (JPMReadData) {
      const currentJourney =
        Number((JPMReadData[0].result as bigint) ?? BigInt(0)) ?? 1;
      const phase2Duration = Number(JPMReadData[5].result as bigint);
      const totalLotteriesInAJourney = Number(JPMReadData[6].result as bigint);
      const nextJourneyTimestamp = Number(JPMReadData[3].result);
      const PHASE_1_SECONDS = Number(JPMReadData[4].result);
      const PHASE_3_SECONDS = Number(JPMReadData[7].result);
      const PER_LOTTERY_SECONDS =
        Number(JPMReadData[5].result) / Number(totalLotteriesInAJourney);

      let lotteryJourney = currentJourney;
      const TOTAL_JOURNEY_TIME =
        PHASE_1_SECONDS + phase2Duration + PHASE_3_SECONDS; // 15 mins + 30 mins + 15 mins = 1 hour
      let phase1StartTimestamp = nextJourneyTimestamp - TOTAL_JOURNEY_TIME; // 11:00
      if (lotteriesInfo?.journeyId && lotteriesInfo?.lotteryId === "3") {
        if (currentJourney === Number(lotteriesInfo?.journeyId)) {
          phase1StartTimestamp += TOTAL_JOURNEY_TIME;
          lotteryJourney += 1;
        }
      }
      let phase2StartTimestamp = phase1StartTimestamp + PHASE_1_SECONDS; // 11:15
      let phase3StartTimestamp = phase2StartTimestamp + phase2Duration; // 11:45
      let lottery3Timestamp = phase3StartTimestamp - lotteryBuffer; // 11:38
      let lottery2Timestamp = lottery3Timestamp - PER_LOTTERY_SECONDS; // 11:28
      let lottery1Timestamp = lottery2Timestamp - PER_LOTTERY_SECONDS; // 11:18
      let nextLotteryTimestamp = 0;
      if (!lotteriesInfo?.lotteryId) {
        nextLotteryTimestamp = lottery1Timestamp;
        console.log(`Next Lottery: J-${lotteryJourney}-L-${1}`);
      } else {
        if (lotteriesInfo?.lotteryId === "3") {
          nextLotteryTimestamp = lottery1Timestamp;
          console.log(`Next Lottery: J-${lotteryJourney}-L-${1}`);
        } else if (lotteriesInfo?.lotteryId === "1") {
          nextLotteryTimestamp = lottery2Timestamp;
          console.log(`Next Lottery: J-${lotteryJourney}-L-${2}`);
        } else if (lotteriesInfo?.lotteryId === "2") {
          nextLotteryTimestamp = lottery3Timestamp;
          console.log(`Next Lottery: J-${lotteryJourney}-L-${3}`);
        }
      }

      console.log(`Phase 1 Starts: ${timestampToString(phase1StartTimestamp)}`);
      console.log(`Phase 2 Starts: ${timestampToString(phase2StartTimestamp)}`);
      console.log(`Phase 3 Starts: ${timestampToString(phase3StartTimestamp)}`);
      console.log(
        `Lottery 1 Timestamp: ${timestampToString(lottery1Timestamp)}`,
      );
      console.log(
        `Lottery 2 Timestamp: ${timestampToString(lottery2Timestamp)}`,
      );
      console.log(
        `Lottery 3 Timestamp: ${timestampToString(lottery3Timestamp)}`,
      );

      return nextLotteryTimestamp;
    }

    // default to 0
    return 0;
  }, [JPMReadData, lotteriesInfo]);

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

  // const { data: batchPruneReceipt } = useWaitForTransactionReceipt({
  //   hash: batchPruneHash,
  // });

  const config = useConfig();

  const { mutateAsync: syncPrune } = useRestPost(["sync prune"], "/api/prune");

  const batchPrune = async () => {
    setPruneLoading(true);
    setPrePrune(true);
    const trees = await createMerkleTrees();

    let proofs =
      userWinnings?.lotteryResult?.map((win) => {
        const { lotteryId, tokenId, journeyId } = win;
        const merkleTree = trees[`${journeyId}_${lotteryId}`];
        // console.log({ root: merkleTree.getHexRoot() });

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

    const chunkSize = PRUNE_BATCH_SIZE;
    const START_INDEX = 0;
    const transactionCount = await getTransactionCount(config, {
      address: `${account.address}` as `0x${string}`,
    });
    let nonce = transactionCount;
    for (let i = START_INDEX; i < proofs.length; i += chunkSize) {
      try {
        const proofsChunk = proofs.slice(i, i + chunkSize);
        setPruneBatch({
          from: i + 1,
          to: Math.min(i + chunkSize, proofs.length),
          total: proofs.length,
        });

        const tx = await batchPruneWinnings({
          address: JackpotContract.address as `0x${string}`,
          abi: JackpotContract.abi,
          functionName: "pruneWinnings",
          args: [proofsChunk],
          gas: BigInt(GAS_LIMIT),
          nonce,
        });
        nonce++;

        const receipt = await waitForTransactionReceipt(config, {
          hash: tx,
          confirmations: 2,
        });

        console.log({ status: true, receipt });
        toast.success(
          `Scrape Successful for Batch ${i + 1}-${Math.min(
            i + chunkSize,
            proofs.length,
          )} out of ${proofs.length}!`,
        );
        await syncPrune({ walletAddress: userAccount });
        // await syncPrune({ walletAddress: EAContract.address });
      } catch (err) {
        console.error({ err });
        toast.error(
          `Scrape Failed for Batch ${i + 1}-${Math.min(
            i + chunkSize,
            proofs.length,
          )} out of ${proofs.length}. Trying to Scrape Next Batch`,
        );
        console.log({ status: "failed" });
        await syncPrune({ walletAddress: userAccount });
        // await syncPrune({ walletAddress: EAContract.address });
      }
    }
    setPruneLoading(false);
  };

  return {
    nextLotteryTimestamp,
    lotteryPayout: totalWinnings,
    currentPhase: Number(JPMReadData?.[1].result) || 1,
    currentJourney: Number(JPMReadData?.[0].result) || 1,
    fuelCellsWon: userWinnings?.lotteryResult?.length ?? 0,
    pruneLoading,
    pruneBatch,
    batchPrune,
    createMerkleTrees,
    lotteriesInfo,
    onTimerEnd,
  };
};

export default useLottery;
