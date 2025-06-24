import useDarkContract from "@/abi/Dark";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useTreasuryContract from "@/abi/Treasury";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

const useHeaderStats = () => {
  const account = useAccount();
  const TreasuryContract = useTreasuryContract();
  const JPMContract = useJPMContract();
  const DarkContract = useDarkContract();

  const { data: treasuryDarkData, isFetched: treasuryDarkFetched } =
    useReadContract({
      address: DarkContract.address as `0x${string}`,
      abi: DarkContract.abi,
      functionName: "balanceOf",
      args: [TreasuryContract.address as `0x${string}`],
    });

  const {
    data: userDarkData,
    error: userDarkError,
    isFetched: userDarkFetched,
  } = useReadContract({
    address: DarkContract.address as `0x${string}`,
    abi: DarkContract.abi,
    functionName: "balanceOf",
    args: [account.address as `0x${string}`],
    query: {
      enabled: !!account.address,
    },
  });

  const { data: journeyData, error: journeyError } = useReadContract({
    address: JPMContract.address as `0x${string}`,
    abi: JPMContract.abi,
    functionName: "currentJourney",
  });

  const { data: totalYieldClaimedData, isFetched: totalYieldClaimedFetched } =
    useReadContract({
      address: TreasuryContract.address as `0x${string}`,
      abi: TreasuryContract.abi,
      functionName: "totalYieldClaimed",
    });

  const {
    data: totalYieldAllocatedData,
    isFetched: totalYieldAllocatedFetched,
  } = useReadContract({
    address: TreasuryContract.address as `0x${string}`,
    abi: TreasuryContract.abi,
    functionName: "totalYieldAllocated",
  });

  const journey = useMemo(() => {
    if (journeyData) {
      return Number(journeyData);
    }
    return 0;
  }, [journeyData]);

  const userDark = useMemo(() => {
    if (userDarkFetched) {
      console.log({ userDarkData });
      return Number(formatUnits((userDarkData as bigint) ?? BigInt(0), 18));
    }
    return -1;
  }, [userDarkData]);

  const treasuryDark = useMemo(() => {
    if (
      treasuryDarkFetched &&
      totalYieldAllocatedFetched &&
      totalYieldClaimedFetched
    ) {
      console.log({
        treasuryDarkData,
        totalYieldAllocatedData,
        totalYieldClaimedData,
      });
      const resultInBigInt: bigint =
        (treasuryDarkData as bigint) -
        ((totalYieldAllocatedData as bigint) -
          (totalYieldClaimedData as bigint));
      return Number(formatUnits(resultInBigInt, 18));
    }

    return 0;
  }, [
    treasuryDarkData,
    totalYieldAllocatedData,
    totalYieldClaimedData,
    treasuryDarkFetched,
    totalYieldAllocatedFetched,
    totalYieldClaimedFetched,
  ]);

  return { treasuryDark, journey, userDark };
};

export default useHeaderStats;
