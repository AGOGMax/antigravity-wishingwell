import { useReadContract} from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

const useWinner = (roundId: bigint) => {
  const PMWContract = usePinkMistWellContract();
  const {
    data: winnerReader,
    isFetched: iswinnerFetched,
    refetch: refetchWinner,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "winners",
    args: [roundId],
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  return { winnerReader, iswinnerFetched, refetchWinner };
};

export default useWinner;