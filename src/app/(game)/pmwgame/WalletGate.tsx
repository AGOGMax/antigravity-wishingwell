"use client";
import { useAccount } from "wagmi";
import ConnectWallet from "../Components/ConnectWallet";

interface WalletGateProps {
  children: React.ReactNode;
}

const WalletGate = ({ children }: WalletGateProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) return <ConnectWallet />;
  return <>{children}</>;
};

export default WalletGate;
