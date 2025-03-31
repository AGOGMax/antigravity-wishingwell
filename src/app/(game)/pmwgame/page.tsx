"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const PMWGame = dynamic(() => import("./PMWGame"), {
  ssr: false,
});

export default function PinkMistGame() {
  return <PMWGame />;
}
