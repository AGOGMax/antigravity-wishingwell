"use client";

import Hero from "@/components/Home/sections/Hero";
import Countdown from "@/components/Home/sections/Countdown";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Home/sections/Testimonials";
import Eras from "@/components/Home/sections/Eras";
import Leaderboard from "@/components/Collective/Leaderboard";
import NFTReceipt from "@/components/Home/sections/NFTReceipt";
import { useAccount } from "wagmi";

export default function HomePage() {
  const account = useAccount();
  return (
    <>
      <Hero />
      <Leaderboard />
      <Testimonials />
      <NFTReceipt />
      <Eras />
      <Countdown />
      <Newsletter />
      <Footer />
    </>
  );
}
