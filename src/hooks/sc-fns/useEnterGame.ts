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
  const [isApprovalNeeded, setIsApprovalNeeded] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);

  const account = useAccount();
  const PMWContract = usePinkMistWellContract();

  /* Approval Contract Function Declaration */
  const {
    writeContract: approve,
    data: approveHash,
    error: approveError,
  } = useWriteContract();

  const { data: approveReceipt, isLoading: approveIsLoading } =
    useWaitForTransactionReceipt({ hash: approveHash, confirmations: 2 });

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
    contracts: ["TICKET_PRICE", "DAI"].map((functionName) => ({
      address: PMWContract?.address as `0x${string}`,
      abi: PMWContract?.abi,
      functionName,
    })),
    query: { enabled: !transactionLoading },
  });

  const ticketPrice = PMWReader?.[0]?.result;
  const investTokenAddress = PMWReader?.[1]?.result;

  const { data: allowance, isFetched: isAllowanceFetched } = useReadContract({
    address: investTokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: [account.address, PMWContract?.address],
    query: { enabled: !transactionLoading },
  });

  const { data: balanceOf, isFetched: isBalanceOfFetched } = useReadContract({
    address: investTokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [account.address],
    query: { enabled: !transactionLoading },
  });

  useEffect(() => {
    if (enterGameError) {
      console.log({ enterGameError });
      setTransactionLoading(false);
      if ((enterGameError.cause as any).code === 4001) {
        toast.error(
          "You cancelled the entering process. Please Try Again if you wish to enter.",
          TOAST_SETTINGS,
        );
      } else if ((balanceOf as bigint) < investAmount) {
        toast.error("Insufficient Funds!", TOAST_SETTINGS);
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

    if (approveError) {
      console.log({ approveError });
      setTransactionLoading(false);
      if ((approveError.cause as any).code === 4001) {
        toast.error(
          "You did not approve sending us your tokens. Please Try Again if you wish to mine.",
          TOAST_SETTINGS,
        );
      } else {
        toast.error(
          "Couldn't approve your tokens to enter the game. Please Try Again.",
          TOAST_SETTINGS,
        );
      }
    }
  }, [enterGameError, approveError, enterGameReceiptError]);

  const investAmount = useMemo(() => {
    if (ticketPrice) {
      return (ticketPrice as bigint) * tickets;
    }
    return BigInt(0);
  }, [tickets, ticketPrice]);

  useEffect(() => {
    if (ticketPrice && allowance !== undefined) {
      setIsApprovalNeeded(
        allowance === BigInt(0) || (allowance as bigint) < investAmount,
      );
    } else {
      setIsApprovalNeeded(false);
    }
  }, [allowance, ticketPrice, investAmount]);

  useEffect(() => {
    if (enterGameReceipt) {
      setTransactionLoading(false);
    }
  }, [enterGameReceipt]);

  const enterGame = () => {
    if (investTokenAddress && investAmount) {
      setTransactionLoading(true);

      if (isApprovalNeeded) {
        approve({
          address: investTokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "approve",
          args: [PMWContract?.address, investAmount],
        });
      } else {
        enterGameFn({
          address: PMWContract?.address as `0x${string}`,
          abi: PMWContract?.abi,
          functionName: "enterPool",
          args: [tickets],
        });
      }
    }
  };

  useEffect(() => {
    if (transactionLoading) {
      if (approveReceipt) {
        console.log({ approveReceipt, approveIsLoading, isApprovalNeeded });
      }
      if (isApprovalNeeded && !approveIsLoading && approveReceipt) {
        enterGameFn({
          address: PMWContract?.address as `0x${string}`,
          abi: PMWContract?.abi,
          functionName: "enterPool",
          args: [tickets],
        });
      }
    }
  }, [isApprovalNeeded, approveIsLoading, approveReceipt]);

  return {
    enterGame,
    enterGameReceipt,
    transactionLoading,
    approveIsLoading,
  };
};

export default useEnterGame;
