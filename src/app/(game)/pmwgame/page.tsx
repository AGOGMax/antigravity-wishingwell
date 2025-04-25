"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";
import IMAGEKIT from "../images";

const PMWGame = dynamic(() => import("./PMWGame"), {
  ssr: false,
});

export default function PinkMistGame() {
  return (
    <div
      style={{
        // background: `url(https://i.ibb.co/hJyzpcG9/pink-mist-whale-bg-pink.jpg)`,
        background: `url(${IMAGEKIT.PMW_BACKGROUND})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
        backgroundColor: "#D90887",
        backgroundSize: "100% 100vh",
      }}
      className="min-h-screen"
    >
      <PMWGame />
    </div>
  );
}
