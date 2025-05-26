"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const MyFuelCells = dynamic(() => import("./MyFuelCells"), {
  ssr: false,
});

export default function Mining() {
  return <MyFuelCells />;
}
