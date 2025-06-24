"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const LotteryPage = dynamic(() => import("./Lottery"), {
  ssr: false,
});

export default function Lottery() {
  return <LotteryPage />;
}
