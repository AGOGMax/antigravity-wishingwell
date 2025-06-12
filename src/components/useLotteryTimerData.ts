import useJPMContract from "@/abi/JourneyPhaseManager";
import { lotteryBuffer, TEST_NETWORK } from "@/constants";
import { useGQLFetch } from "@/hooks/useGraphQLClient";
import { gql } from "graphql-request";
import { useMemo, useState } from "react";
import { pulsechain, pulsechainV4 } from "viem/chains";
import { useReadContracts } from "wagmi";

const useLotteryTimerData = () => {
  const [refetchInfo, setRefetchInfo] = useState(true);

  const onTimerEnd = () => {
    setRefetchInfo(true);
  };

  const JPMContract = useJPMContract();
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
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
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
      TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
      {},
      { enabled: refetchInfo },
    );

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

  return { nextLotteryTimestamp, lotteriesInfo, refreshTimer: onTimerEnd };
};

export default useLotteryTimerData;
