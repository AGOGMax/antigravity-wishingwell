"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const TreasuryPage = dynamic(() => import("./Treasury"), {
  ssr: false,
});

export default function Treasury() {
  return <TreasuryPage />;
}
