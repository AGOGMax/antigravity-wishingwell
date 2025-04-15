import { useReadContract, useReadContracts } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

const usePrizes = () => {
  const PMWContract = usePinkMistWellContract();

  const {
    data: prizesReader,
    isFetched: isPrizesFetched,
    refetch: refetchPrizes,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "getAllPrizes",
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  return { prizesReader, isPrizesFetched, refetchPrizes };
};

export default usePrizes;
