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

  useEffect(() => {
    if (enterGameError) {
      console.log({ enterGameError });
      setTransactionLoading(false);
    }

    if (approveError) {
      console.log({ approveError });
      setTransactionLoading(false);
    }
  }, [enterGameError, approveError]);

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
        console.log("entering game");

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
