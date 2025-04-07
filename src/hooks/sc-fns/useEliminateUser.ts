import { useEffect, useState } from "react";
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";

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
    }

    if (eliminateUserReceiptError) {
      console.log({ eliminateUserReceiptError });
      setTransactionLoading(false);
    }
  }, [eliminateUserError, eliminateUserReceiptError]);

  useEffect(() => {
    if (eliminateUserReceipt) {
      setTransactionLoading(false);
    }
  }, [eliminateUserReceipt]);

  const eliminateUser = () => {
    if (eliminationTokenAddress && eliminationFee) {
      setTransactionLoading(true);

      eliminateUserFn({
        address: PMWContract?.address as `0x${string}`,
        abi: PMWContract?.abi,
        functionName: "eliminateTicket",
        args: [],
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
