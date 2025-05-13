import { useEffect, useState } from "react";
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { ToastOptions, toast } from "react-hot-toast";
import axios from "axios";
import { API_ENDPOINT } from "@/constants";

const TOAST_SETTINGS: ToastOptions = {
  duration: 3000,
  position: "bottom-right",
  style: {
    width: "400px",
  },
};

async function getCallbackValue() {
  try {
    const response = await axios.get(`${API_ENDPOINT}/api/calldata`);
    const calldata = response?.data?.calldata || "0x";
    return calldata;
  } catch (error) {
    console.error("Error while fetching calldata: ", error);
  }
}

const useEliminateUser = () => {
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);

  const PMWContract = usePinkMistWellContract();

  const {
    writeContract: eliminateUserFn,
    data: eliminateUserHash,
    error: eliminateUserError,
    isPending: isEliminateUserFunctionPending,
  } = useWriteContract();

  const {
    data: eliminateUserReceipt,
    error: eliminateUserReceiptError,
    isLoading: isEliminateUserReceiptLoading,
  } = useWaitForTransactionReceipt({ hash: eliminateUserHash });

  /* Read Contract Data */
  const {
    data: PMWReader,
    error: PMWError,
    isFetched: PMWFetched,
  } = useReadContracts({
    contracts: ["eliminationFee"].map((functionName) => ({
      address: PMWContract?.address as `0x${string}`,
      abi: PMWContract?.abi,
      functionName,
    })),
    query: { enabled: !transactionLoading },
  });

  const eliminationFee = PMWReader?.[0]?.result;
  // const eliminationFee = BigInt(1);

  useEffect(() => {
    if (eliminateUserError) {
      console.log({ eliminateUserError });
      setTransactionLoading(false);
      if ((eliminateUserError.cause as any)?.code === 4001) {
        toast.error(
          "You cancelled the misting process. Please Try Again if you wish to mist'em.",
          TOAST_SETTINGS,
        );
      } else if (
        (eliminateUserError.cause as any)?.details?.includes(
          "insufficient funds",
        )
      ) {
        toast.error("Insufficient Funds!", TOAST_SETTINGS);
      } else {
        toast.error("Couldn't mist'em. Please Try Again.", TOAST_SETTINGS);
      }
    }

    if (eliminateUserReceiptError) {
      console.log({ eliminateUserReceiptError });
      setTransactionLoading(false);
      toast.error("Couldn't mist'em. Please Try Again.", TOAST_SETTINGS);
    }
  }, [eliminateUserError, eliminateUserReceiptError]);

  useEffect(() => {
    if (eliminateUserReceipt) {
      setTransactionLoading(false);
    }
  }, [eliminateUserReceipt]);

  const eliminateUser = async (ticketCount = 1) => {
    if (typeof eliminationFee === "bigint") {
      setTransactionLoading(true);
      const callData = await getCallbackValue();
      eliminateUserFn({
        address: PMWContract?.address as `0x${string}`,
        abi: PMWContract?.abi,
        functionName: "eliminateTicket",
        args: [BigInt(ticketCount), callData], //bytes data
        value: eliminationFee as bigint,
      });
    }
  };

  return {
    eliminateUser,
    eliminateUserReceipt,
    transactionLoading,
  };
};

export default useEliminateUser;
