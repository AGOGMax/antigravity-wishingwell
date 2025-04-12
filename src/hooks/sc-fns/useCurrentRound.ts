import { useReadContract } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

const useCurrentRound = (currentRoundId: bigint)=>{
const PMWContract = usePinkMistWellContract();
  const {
    data: roundsDataReader,
    isFetched: isRoundsFetched,
    refetch: refetchRounds,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "rounds",
    args: [currentRoundId],
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,

  });

  return {roundsDataReader, isRoundsFetched, refetchRounds}
}

export default useCurrentRound;