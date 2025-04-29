import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { ToastOptions, toast } from "react-hot-toast";

const TOAST_SETTINGS: ToastOptions = {
  duration: 3000,
  position: "bottom-right",
  style: {
    width: "400px",
  },
};

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
    contracts: ["eliminationFee", "DAI"].map((functionName) => ({
      address: PMWContract?.address as `0x${string}`,
      abi: PMWContract?.abi,
      functionName,
    })),
    query: { enabled: !transactionLoading },
  });

  const eliminationFee = PMWReader?.[0]?.result;
  const eliminationTokenAddress = PMWReader?.[1]?.result;

  useEffect(() => {
    if (eliminateUserError) {
      console.log({ eliminateUserError });
      setTransactionLoading(false);
      if ((eliminateUserError.cause as any).code === 4001) {
        toast.error(
          "You cancelled the misting process. Please Try Again if you wish to mist'em.",
          TOAST_SETTINGS,
        );
      } else if (
        (eliminateUserError.cause as any).details?.includes(
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

  const eliminateUser = (ticketCount = 1) => {
    if (eliminationTokenAddress && typeof eliminationFee === "bigint") {
      setTransactionLoading(true);

      eliminateUserFn({
        address: PMWContract?.address as `0x${string}`,
        abi: PMWContract?.abi,
        functionName: "eliminateTicket",
        args: [BigInt(ticketCount)],
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
