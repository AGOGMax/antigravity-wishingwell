"use client";

import { PROJECT_ID, TEST_NETWORK } from "@/constants";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  pulsechain,
  baseSepolia,
  base,
  sepolia,
  pulsechainV4,
} from "viem/chains";
import { WagmiProvider, fallback, http } from "wagmi";
const pulseChain = {
  ...pulsechain,
  iconUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCuUifRyi_k3LEVGmTLdl5keon5NALvBHHqITJYAtBGw&s",
};

export const TESTCHAINS = [pulsechainV4];

export const config = getDefaultConfig({
  appName: "AntiGravity",
  projectId: `${PROJECT_ID}`,
  //@ts-ignore
  chains: TEST_NETWORK ? TESTCHAINS : [pulseChain, base],
  transports: TEST_NETWORK
    ? {
        [baseSepolia.id]: http(
          `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
        ),
        [pulsechainV4.id]: http("https://rpc-testnet-pulsechain.g4mm4.io"),
        [sepolia.id]: http(
          `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
        ),
      }
    : {
        [base.id]: http(
          `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
        ),
        [pulsechain.id]: fallback([
          http("https://pulsechain-rpc.publicnode.com"),
          http("https://rpc-pulsechain.g4mm4.io"),
        ]),
      },
  ssr: true,
});

const client = new QueryClient();
interface Props {
  children: React.ReactNode;
}

const RainbowKitContext = ({ children }: Props) => {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowKitContext;

export const checkCorrectNetwork = (
  chainId: number | undefined,
  chains: number[] = TEST_NETWORK
    ? TESTCHAINS.map((chain) => chain.id)
    : [pulsechain.id, base.id],
) => {
  if (chainId === undefined) return true;
  if (chains.find((chain) => chain === chainId)) {
    return true;
  }

  return false;
};
