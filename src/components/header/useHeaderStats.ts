import useDarkContract from "@/abi/Dark";
import useJPMContract from "@/abi/JourneyPhaseManager";
import useTreasuryContract from "@/abi/Treasury";
import { useUserData } from "@/app/(client)/store";
import { TEST_NETWORK } from "@/constants";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";
import { pulsechain, pulsechainV4 } from "viem/chains";
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
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
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
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  const { data: journeyData, error: journeyError } = useReadContract({
    address: JPMContract.address as `0x${string}`,
    abi: JPMContract.abi,
    functionName: "currentJourney",
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  const {
    data: totalYieldClaimedData,
    isFetched: totalYieldClaimedFetched,
    error: error1,
  } = useReadContract({
    address: TreasuryContract.address as `0x${string}`,
    abi: TreasuryContract.abi,
    functionName: "totalYieldClaimed",
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  const {
    data: totalYieldAllocatedData,
    isFetched: totalYieldAllocatedFetched,
    error: error2,
  } = useReadContract({
    address: TreasuryContract.address as `0x${string}`,
    abi: TreasuryContract.abi,
    functionName: "totalYieldAllocated",
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  useEffect(() => {
    if (error1) {
      console.error("Error fetching totalYieldClaimed:", error1);
    }
    if (error2) {
      console.error("Error fetching totalYieldAllocated:", error2);
    }
  }, [error1, error2]);

  const journey = useMemo(() => {
    if (journeyData) {
      return Number(journeyData);
    }
    return 0;
  }, [journeyData]);

  const { mutation: updateUser } = useUserData();

  const userDark = useMemo(() => {
    if (userDarkFetched) {
      const result = Number(
        formatUnits((userDarkData as bigint) ?? BigInt(0), 18),
      );
      updateUser({ darkBalance: result });
      return result;
    }
    updateUser({ darkBalance: -1 });
    return -1;
  }, [userDarkData, userDarkFetched]);

  const treasuryDark = useMemo(() => {
    if (
      treasuryDarkFetched &&
      totalYieldAllocatedFetched &&
      totalYieldClaimedFetched
    ) {
      const treasuryDarkinBigInt = (treasuryDarkData as bigint) ?? BigInt(0);
      const totalYieldAllocatedInBigInt =
        (totalYieldAllocatedData as bigint) ?? BigInt(0);
      const totalYieldClaimedInBigInt =
        (totalYieldClaimedData as bigint) ?? BigInt(0);
      const resultInBigInt: bigint =
        treasuryDarkinBigInt -
        (totalYieldAllocatedInBigInt - totalYieldClaimedInBigInt);
      return Number(formatUnits(resultInBigInt, 18));
    }

    return -1;
  }, [
    treasuryDarkData,
    totalYieldAllocatedData,
    totalYieldClaimedData,
    treasuryDarkFetched,
    totalYieldAllocatedFetched,
    totalYieldClaimedFetched,
  ]);

  return { treasuryDark, journey, userDark, DarkContract };
};

export default useHeaderStats;
