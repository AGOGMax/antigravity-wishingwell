"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const VaporizePage = dynamic(() => import("./Vaporize"), {
  ssr: false,
});

export default function Vaporize() {
  return <VaporizePage />;
}
