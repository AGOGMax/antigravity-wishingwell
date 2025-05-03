import { useEffect, useMemo, useState } from "react";
import erc20ABI from "erc-20-abi";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import toast, { ToastOptions } from "react-hot-toast";

const TOAST_SETTINGS: ToastOptions = {
  duration: 3000,
  position: "bottom-right",
  style: {
    width: "400px",
  },
};

const useEnterGame = (tickets: bigint) => {
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);

  const account = useAccount();
  const PMWContract = usePinkMistWellContract();

  /* EnterGame Contract Function Declaration */
  const {
    writeContract: enterGameFn,
    data: enterGameHash,
    error: enterGameError,
    isPending: isEnterGameFunctionPending,
  } = useWriteContract();

  const {
    data: enterGameReceipt,
    error: enterGameReceiptError,
    isLoading: isEnterGameReceiptLoading,
  } = useWaitForTransactionReceipt({ hash: enterGameHash });

  /* Read Contract Data */
  const {
    data: PMWReader,
    error: PMWError,
    isFetched: PMWFetched,
  } = useReadContracts({
    contracts: ["TICKET_PRICE"].map((functionName) => ({
      address: PMWContract?.address as `0x${string}`,
      abi: PMWContract?.abi,
      functionName,
    })),
    query: { enabled: !transactionLoading },
  });

  const ticketPrice = PMWReader?.[0]?.result;

  useEffect(() => {
    if (enterGameError) {
      console.log({ enterGameError });
      setTransactionLoading(false);
      if ((enterGameError.cause as any)?.code === 4001) {
        toast.error(
          "You cancelled the entering process. Please Try Again if you wish to enter.",
          TOAST_SETTINGS,
        );
      } else {
        toast.error(
          "Couldn't enter you in the game. Please Try Again.",
          TOAST_SETTINGS,
        );
      }
    }

    if (enterGameReceiptError) {
      console.log({ enterGameReceiptError });
      setTransactionLoading(false);
      toast.error(
        "Couldn't enter you in the game. Please Try Again.",
        TOAST_SETTINGS,
      );
    }
  }, [enterGameError, enterGameReceiptError]);

  const investAmount = useMemo(() => {
    if (ticketPrice) {
      return (ticketPrice as bigint) * tickets;
    }
    return BigInt(0);
  }, [tickets, ticketPrice]);

  useEffect(() => {
    if (enterGameReceipt) {
      setTransactionLoading(false);
    }
  }, [enterGameReceipt]);

  const enterGame = () => {
    if (investAmount) {
      setTransactionLoading(true);

      enterGameFn({
        address: PMWContract?.address as `0x${string}`,
        abi: PMWContract?.abi,
        functionName: "enterPool",
        args: [tickets],
        value: investAmount,
      });
    }
  };

  return {
    enterGame,
    enterGameReceipt,
    transactionLoading,
  };
};

export default useEnterGame;
