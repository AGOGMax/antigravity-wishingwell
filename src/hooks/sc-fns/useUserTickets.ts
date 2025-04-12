import { useReadContracts } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";


const useUserTickets = (currentRoundId: bigint, userAddress: string)=>{
const PMWContract = usePinkMistWellContract();
    
 const {
    data: getUserTicketsReader,
    isFetched: isUserTicketsFetched,
    refetch: refetchUserTickets,
  } = useReadContracts({
    contracts: ["getUserTickets", "getUserActiveTicketCount"].map(
      (functionName) => ({
        address: PMWContract.address as `0x${string}`,
        abi: PMWContract.abi,
        functionName,
        args: [currentRoundId, userAddress],
        chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
        
      }),
    ),
  });
  return {getUserTicketsReader, isUserTicketsFetched, refetchUserTickets}

}

export default useUserTickets;