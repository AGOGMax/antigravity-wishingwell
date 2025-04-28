"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const MiningPage = dynamic(() => import("./MintingPage"), {
  ssr: false,
});

export default function Mining() {
  return <MiningPage />;
}
