import { useReadContracts } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

const useRoundTickets = (currentRoundId: bigint, totalParticipants: number)=>{
const PMWContract = usePinkMistWellContract();

const ticketNumberArray = Array.from({ length: totalParticipants }).map((_, i) => {
            return BigInt(i+1);
          })

 const {
       data: roundTicketsDataReader,
       isFetched: isRoundTicketsFetched,
       refetch: refetchRoundTickets,
     } = useReadContracts({
       contracts: ticketNumberArray.map((ticket) => ({
         address: PMWContract.address as `0x${string}`,
         abi: PMWContract.abi,
         functionName: "roundTickets",
         args: [currentRoundId, ticket],
         chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
 
       })),
     });

  return {roundTicketsDataReader, isRoundTicketsFetched, refetchRoundTickets}
}

export default useRoundTickets;