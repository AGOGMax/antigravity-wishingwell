"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const EvilAddressPage = dynamic(() => import("./EvilAddress"), {
  ssr: false,
});

export default function EvilAddress() {
  return <EvilAddressPage />;
}
