import useFuelCellContract from "@/abi/FuelCell";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useTreasuryContract from "@/abi/Treasury";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useGQLFetch } from "../useGraphQLClient";
import { gql } from "graphql-request";
import { TEST_NETWORK } from "@/constants";
import { TESTCHAINS } from "@/components/RainbowKit";
import { pulsechain } from "viem/chains";

const useTreasury = () => {
  const [refetchInfo, setRefetchInfo] = useState(true);
  const FuelCellsContract = useFuelCellContract();
  const TreasuryContract = useTreasuryContract();
  const JPMContract = useJPMContract();

  const account = useAccount();

  const onTimerEnd = () => {
    setRefetchInfo(true);
  };

  const { data: yieldDistributedData, isFetched: yieldDistributedFetched } =
    useReadContract({
      address: TreasuryContract.address as `0x${string}`,
      abi: TreasuryContract.abi,
      functionName: "totalYieldAllocated",
      query: { enabled: refetchInfo },
    });
  const { data: fuelCellsSupplyData, isFetched: fuelCellsFetched } =
    useReadContract({
      address: FuelCellsContract.address as `0x${string}`,
      abi: FuelCellsContract.abi,
      functionName: "totalSupply",
      query: { enabled: refetchInfo },
    });

  const { data: currentPhase, isFetched: currentPhaseFetched } =
    useReadContract({
      address: JPMContract.address as `0x${string}`,
      abi: JPMContract.abi,
      functionName: "currentPhase",
      query: { enabled: refetchInfo },
    });

  const isMintActive: boolean = useMemo(() => {
    if (currentPhaseFetched) {
      console.log({ currentPhase });
      const phase = Number(currentPhase);
      if (phase === 1) {
        return true;
      }
      return false;
    }

    return false;
  }, [currentPhase, currentPhaseFetched]);

  const { data: nextMintTimestampData, isFetched: nextMintTimestampFetched } =
    useReadContract({
      address: JPMContract.address as `0x${string}`,
      abi: JPMContract.abi,
      functionName: "getNextJourneyTimestamp",
      query: {
        enabled: !isMintActive && refetchInfo,
      },
    });

  const { data: nextPhaseTimestampData, isFetched: nextPhaseTimestampFetched } =
    useReadContract({
      address: JPMContract.address as `0x${string}`,
      abi: JPMContract.abi,
      functionName: "getNextPhaseTimestamp",
      query: {
        enabled: isMintActive && refetchInfo,
      },
    });

  const totalYieldDistributed = useMemo(() => {
    if (yieldDistributedFetched) {
      return Number(
        formatUnits((yieldDistributedData as bigint) ?? BigInt(0), 18),
      );
    }
    return 0;
  }, [yieldDistributedData, yieldDistributedFetched]);

  const fuelCellSupply = useMemo(() => {
    if (fuelCellsFetched) {
      return Number(fuelCellsSupplyData);
    }
  }, [fuelCellsSupplyData, fuelCellsFetched]);

  const nextMintTimestamp = useMemo(() => {
    if (nextMintTimestampFetched) {
      setRefetchInfo(false);
      return Number(nextMintTimestampData);
    }

    return ~~(new Date().getTime() / 1000);
  }, [nextMintTimestampData, nextMintTimestampFetched]);

  const nextPhaseTimestamp = useMemo(() => {
    if (nextPhaseTimestampFetched) {
      return Number(nextPhaseTimestampData);
    }

    return ~~(new Date().getTime() / 1000);
  }, [nextPhaseTimestampData, nextPhaseTimestampFetched]);

  const { data: userMintData, isLoading: userMintDataLoading } = useGQLFetch<{
    user: { address: string; fuelCellBalance: string };
  }>(
    ["totalMintedUser"],
    gql`
      query MyQuery {
        user(id: "${account.address}") {
          address
          fuelCellBalance
        }
      }
    `,
    TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
    {},
    { enabled: !!account.address && refetchInfo },
  );

  const userMinted = useMemo(() => {
    if (!userMintDataLoading) {
      return Number(userMintData?.user?.fuelCellBalance ?? "0");
    }
    return 0;
  }, [userMintDataLoading, userMintData]);

  return {
    fuelCellSupply,
    totalYieldDistributed,
    isMintActive,
    nextMintTimestamp,
    nextPhaseTimestamp,
    userMinted,
    onTimerEnd,
  };
};

export default useTreasury;
