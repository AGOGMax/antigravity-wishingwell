import { useReadContracts } from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";



const usePMWReader = () =>{
     const PMWContract = usePinkMistWellContract();
    
      const {
        data: PMWReader,
        error: PMWError,
        isFetched: PMWFetched,
        refetch: refetchPMWReader,
      } = useReadContracts({
        contracts: [
          "getCurrentRoundActiveTickets",
          "MAX_ENTRIES",
          "currentRoundId",
        ].map((functionName) => ({
          address: PMWContract.address as `0x${string}`,
          abi: PMWContract.abi,
          functionName,
          chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
        })),
      });

      return {PMWReader, PMWError, PMWFetched, refetchPMWReader}
    
}

export default usePMWReader;

