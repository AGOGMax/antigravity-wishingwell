import { useReadContracts } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

const usePrevRounds = (currentRoundId: bigint)=>{
const PMWContract = usePinkMistWellContract();
    const prevRecordsCount = Math.min(5, Number(currentRoundId));
    const prevRoundIds =
      Number(currentRoundId) > 0
        ? Array.from({ length: prevRecordsCount }).map((_, i) => {
            return BigInt(Number(currentRoundId) - i - 1 || 0);
          })
        : [];
  
    const {
      data: prevRoundsDataReader,
      isFetched: isPrevRoundsFetched,
      refetch: refetchPrevRounds,
    } = useReadContracts({
      contracts: prevRoundIds.map((id) => ({
        address: PMWContract.address as `0x${string}`,
        abi: PMWContract.abi,
        functionName: "rounds",
        args: [id],
        chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,

      })),
    });

  return {prevRoundsDataReader, isPrevRoundsFetched, refetchPrevRounds}
}

export default usePrevRounds;