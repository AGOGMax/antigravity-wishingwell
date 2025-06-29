"use client";

import Newsletter from "@/components/Newsletter";
import Leaderboard from "@/components/Collective/Leaderboard";
import { useAccount } from "wagmi";
import Footer from "@/components/Footer";
import MintingHero from "@/components/Minting/MintingHero";

export default function MiningPage() {
  const account = useAccount();

  // useEffect(() => {
  // 	const interval = setInterval(() => {
  // 		miningNotif("0x...5678 just mined 2,000 DarkX tokens!");
  // 	}, 5000);

  // 	const interval2 = setInterval(() => {
  // 		successToast("0x...5678 just mined 2,000 DarkX tokens!");
  // 	}, 10000);
  // 	const interval3 = setInterval(() => {
  // 		errorToast("0x...5678 just mined 2,000 DarkX tokens!");
  // 	}, 10000);
  // 	const interval4 = setInterval(() => {
  // 		warningToast("0x...5678 just mined 2,000 DarkX tokens!");
  // 	}, 10000);
  // 	const interval5 = setInterval(() => {
  // 		generalToast("0x...5678 just mined 2,000 DarkX tokens!");
  // 	}, 10000);

  // 	return () => {
  // 		clearInterval(interval);
  // 		clearInterval(interval2);
  // 		clearInterval(interval3);
  // 		clearInterval(interval4);
  // 		clearInterval(interval5);
  // 	};
  // }, []);

  return (
    <>
      <MintingHero />
      {account.isConnected && <Leaderboard />}
      <Newsletter />
      <Footer />
    </>
  );
}
