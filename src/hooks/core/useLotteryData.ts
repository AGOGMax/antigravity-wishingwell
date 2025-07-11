// hook to get details about the lottery data

import useJPMContract from "@/abi/JourneyPhaseManager";
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { useGQLFetch } from "../useGraphQLClient";
import { gql } from "graphql-request";
import { useRestFetch } from "../useRestClient";
import { zeroAddress } from "viem";
import { TEST_NETWORK } from "@/constants";
import { TESTCHAINS } from "@/components/RainbowKit";
import { pulsechain } from "viem/chains";

const tableDataTemplate = [
  ["big", 1],
  ["bigger", 3],
  ["biggest", 6],
];

const useLotteryData = () => {
  // fetch jackpot dark balance
  const JPMContract = useJPMContract();

  const { data: latestPayout } = useGQLFetch<{
    lotteryResults: {
      items: {
        journeyId: string;
        lotteryId: string;
      }[];
    };
  }>(
    ["latest payout"],
    gql`
      query Query {
        lotteryResults(orderBy: "timestamp", orderDirection: "desc", limit: 1) {
          items {
            journeyId
            lotteryId
          }
        }
      }
    `,
    TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
    {},
  );

  const { data: journeyData, isFetched: journeyDataFetched } = useGQLFetch<{
    journeyPhaseManager: {
      currentJourneyId: string;
    };
  }>(
    ["current journey"],
    gql`query {
        journeyPhaseManager(id: "${JPMContract.address}") {
            currentJourneyId
        }
    }
  `,
    TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
    {},
    { enabled: JPMContract.address !== zeroAddress },
  );

  const { data: evilBonusMapping } = useRestFetch<{
    big: number;
    bigger: number;
    biggest: number;
  }>(
    ["Evil bonus in current journey"],
    `/api/evil-bonus/${
      journeyData?.journeyPhaseManager?.currentJourneyId ?? 1
    }`,
    { enabled: journeyDataFetched },
  );

  const { data: activeNFTs, isFetched: fetchedActiveNFTs } = useReadContract({
    address: JPMContract?.address,
    abi: JPMContract.abi,
    functionName: "getActiveNftsInJourney",
    args: [BigInt(journeyData?.journeyPhaseManager?.currentJourneyId ?? 1)],
    query: {
      enabled: !!journeyData?.journeyPhaseManager?.currentJourneyId,
    },
  });

  // memo to calculate total fuel cells amount from active mints
  const totalFuelCells = useMemo(() => {
    if (fetchedActiveNFTs) {
      return activeNFTs;
    }
    return 0;
  }, [activeNFTs, fetchedActiveNFTs]);

  const jackpotMintedInJourney = useMemo(() => {
    return Number(totalFuelCells as bigint) * 0.2;
  }, [totalFuelCells]);

  const tableData = useMemo(() => {
    if (jackpotMintedInJourney && evilBonusMapping) {
      const result = tableDataTemplate.map((row) => {
        const [lotteryId, percentageMultiplier] = row;
        const preBonusPayout =
          jackpotMintedInJourney * 0.1 * Number(percentageMultiplier);

        const evilBonus =
          evilBonusMapping?.[lotteryId as "big" | "bigger" | "biggest"] ?? 0;

        const payoutValue = (preBonusPayout + evilBonus).toFixed(2);
        const { journeyId, lotteryId: currentLotteryId } =
          latestPayout?.lotteryResults?.items[0] ?? {};

        const mappingLotteryToNumber = {
          big: 1,
          bigger: 2,
          biggest: 3,
        };

        let paid: boolean =
          journeyId === journeyData?.journeyPhaseManager.currentJourneyId &&
          Number(currentLotteryId) >=
            mappingLotteryToNumber[lotteryId as "big"];

        return [
          `${lotteryId} ${row[1]}x`,
          preBonusPayout.toFixed(2),
          evilBonus.toFixed(2),
          paid
            ? {
                value: `${payoutValue}`,
                sticker: "paid",
              }
            : payoutValue,
        ];
      });
      return result;
    }
    return tableDataTemplate.map((row) => {
      return [`${row[0]} ${row[1]}x`, 0, 0, 0];
    });
  }, [jackpotMintedInJourney, latestPayout, journeyData, evilBonusMapping]);

  return {
    totalFuelCellsInJourney: totalFuelCells,
    jackpotMintedInJourney: jackpotMintedInJourney.toFixed(3), // limit to 3 decimal places
    tableData,
  };
};

export default useLotteryData;
