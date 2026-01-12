"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { IToken, StateType } from "../types";
import useTimer from "@/hooks/frontend/useTimer";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { useRestFetch, useRestPost } from "@/hooks/useRestClient";
import useMerkleTree from "@/hooks/sc-fns/useMerkleTree.mine";
import useMining from "@/hooks/sc-fns/useMining";
import NFTHero from "./NFTHero";
import NoNFTHero from "./NoNFTHero";
import MiningCalculator from "../MiningCalculator";
import Button from "@/components/Button";
import { IMAGEKIT_ICONS } from "@/assets/imageKit";
import CountdownTimer from "@/components/CountdownTimer";
import { TEST_NETWORK } from "@/constants";
import { checkCorrectNetwork, TESTCHAINS } from "@/components/RainbowKit";
import { pulsechain } from "viem/chains";
import useMiningContract from "@/abi/MiningRig";
import { useUserData } from "@/app/(client)/store";
import { errorToast } from "@/hooks/frontend/toast";

export default function NonContributed({
  setNFTHover,
  setMinedSuccess,
}: {
  state: StateType;
  setNFTHover: Dispatch<SetStateAction<boolean>>;
  setMinedSuccess: Dispatch<SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState(40000);
  const timerState = useTimer();
  const [multiplyer, setMultiplyer] = useState(1);
  const MiningContract = useMiningContract();
  const { openConnectModal } = useConnectModal();
  const [selectedToken, setSelectedToken] = useState(0);
  const account = useAccount();
  const { openChainModal } = useChainModal();

  // 1. BULLETPROOF getEra - ensures 1, 2, or 3 is ALWAYS returned
  const getEra = (era: string): 1 | 2 | 3 => {
    let eraNumber = 1; 
    if (era?.startsWith("journey")) {
      const parsed = parseInt(era.replace("journey", ""));
      eraNumber = parsed || 1;
    } else {
      switch (era) {
        case "wishwell": eraNumber = 1; break;
        case "mining":   eraNumber = 2; break;
        case "minting":  eraNumber = 3; break;
        default:         eraNumber = 1; break;
      }
    }
    // Clamps the value between 1 and 3
    return Math.min(Math.max(eraNumber, 1), 3) as 1 | 2 | 3;
  };

  const { data: s3Data } = useRestFetch(["s3"], `/s3`, { proxy: true });

  const { data: nativeToken } = useReadContract({
    address: MiningContract?.address as `0x${string}`,
    abi: MiningContract?.abi,
    functionName: "NATIVE_TOKEN",
    chainId: account.chainId || (TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id),
  });

  const tokens: IToken[] = useMemo(() => {
    const defaultNetwork = TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id;
    if (!account.chainId || !checkCorrectNetwork(account.chainId)) {
      return (s3Data as any)?.data?.tokens?.filter((token: IToken) => token.chainId === defaultNetwork) || [];
    }
    return (s3Data as any)?.data?.tokens?.filter((token: IToken) => token.chainId === account.chainId) || [];
  }, [s3Data, account.chainId]);

  useEffect(() => {
    if (tokens && nativeToken) {
      const index = tokens.findIndex(t => (nativeToken as string).toLowerCase() === t.address.toLowerCase());
      if (index !== -1) setSelectedToken(index);
    }
  }, [account.chainId, nativeToken, tokens]);

  const ERA1_ADDRESSES: string[] = useMemo(() => (s3Data as any)?.data?.era1?.accounts || [], [s3Data]);
  const { generateProof } = useMerkleTree(ERA1_ADDRESSES);

  const proof = useMemo(() => {
    return account.address ? generateProof(account.address as `0x${string}`) : [];
  }, [account.address, ERA1_ADDRESSES, generateProof]);

  const isNativeToken = useMemo(() => {
    return tokens?.[selectedToken]?.address.toLowerCase() === (nativeToken as string)?.toLowerCase();
  }, [tokens, selectedToken, nativeToken]);

  const { mineToken, transactionLoading, isApprovalNeeded, approveReceipt, darkXBalance, tokenBalances } = useMining(
    selectedToken, tokens, value, multiplyer, nativeToken as string, setNFTHover, setMinedSuccess
  );

  const { data: tokenPrice } = useRestFetch<{ price: number }>(
    ["token_price", tokens?.[selectedToken]?.address],
    `/be/coinPrices?token=${tokens?.[selectedToken]?.address}&pool=${tokens?.[selectedToken]?.pool}&network=${tokens?.[selectedToken]?.chainId}&native=${isNativeToken}`,
    { proxy: true, enabled: !!tokens?.[selectedToken]?.address }
  );

  const usdValue = useMemo(() => tokenPrice?.price, [tokenPrice]);

  const { data: predictedMultiplierData, mutate: predictMultiplierFn } = useRestPost<{ multiplier: number }>(
    ["get-multiplier"], "/api/predict-multiplier"
  );

  useEffect(() => {
    predictMultiplierFn({ walletAddress: account.isConnected ? account.address : "", era: 2 });
  }, [account.address, timerState.era, timerState.phase, predictMultiplierFn, account.isConnected]);

  useEffect(() => {
    if (predictedMultiplierData?.multiplier) setMultiplyer(predictedMultiplierData.multiplier);
  }, [predictedMultiplierData]);

  const predictedPoints = useMemo(() => (usdValue && multiplyer && value) ? value * usdValue * multiplyer : 0, [multiplyer, value, usdValue]);

  const handleMine = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!account.address) return errorToast("Wallet not Connected!");
    if (!proof) return errorToast("Something went Wrong!");
    await mineToken(proof);
  };

  const { nftURLera2 } = useUserData();

  useEffect(() => {
    if (Number(darkXBalance) > 0 && localStorage?.getItem("nft-reveal-first-time") === "false") {
      localStorage?.setItem("nft-reveal-first-time", "true");
      setNFTHover(true);
    } else if (Number(darkXBalance) <= 0) {
      localStorage?.setItem("nft-reveal-first-time", "false");
    }
  }, [darkXBalance, setNFTHover]);

  return (
    <div className="max-w-full relative flex flex-col justify-center items-center gap-[8px] mt-[50px]">
      {nftURLera2 ? <NFTHero setNFTHover={setNFTHover} /> : <NoNFTHero />}

      <MiningCalculator
        tokenBalance={tokenBalances?.[selectedToken] || "0"}
        value={value}
        points={predictedPoints || 0}
        setValue={setValue}
        conversionRateToUSD={0.245}
        era={getEra(timerState.era)}
        phase={(timerState.phase || 1) as 1 | 2 | 3}
        multiplyer={multiplyer}
        inputOptions={tokens?.map((token) => ({ ...token, USDvalue: usdValue })) || []}
        setSelectedToken={setSelectedToken}
        selectedToken={selectedToken}
      />

      {!account.isConnected ? (
        <Button 
            innerText="Connect Wallet" 
            iconSrc={IMAGEKIT_ICONS.WALLET_WHITE} 
            onClick={openConnectModal} 
        />
      ) : checkCorrectNetwork(account.chainId) ? (
        <Button
          loading={transactionLoading}
          innerText={
            value > Number(tokenBalances?.[selectedToken]) 
              ? (transactionLoading 
                  ? (isApprovalNeeded ? (!approveReceipt ? "Approving..." : "Mining...") : "Mining...") 
                  : (isApprovalNeeded ? "Approve & Mine" : "Mine Now")) 
              : "Insufficient Funds"
          }
          disabled={value === 0 || value > Number(tokenBalances?.[selectedToken]) || transactionLoading || timerState.era !== "mining"}
          iconSrc={IMAGEKIT_ICONS.HAMMER}
          onClick={handleMine}
        />
      ) : (
        <Button 
            innerText="Switch Network" 
            iconSrc={IMAGEKIT_ICONS.ERROR} 
            onClick={openChainModal} 
        />
      )}

      <div className="p-[8px] rounded-[6px] bg-[#030404A8]">
        <CountdownTimer state={timerState} fontDesktopSize={56} />
      </div>
    </div>
  );
}
