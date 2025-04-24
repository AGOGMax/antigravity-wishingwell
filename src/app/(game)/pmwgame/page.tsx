"use client";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const PMWGame = dynamic(() => import("./PMWGame"), {
  ssr: false,
});

export default function PinkMistGame() {
  return (
    <div
      style={{
        // background: `url(https://i.ibb.co/hJyzpcG9/pink-mist-whale-bg-pink.jpg)`,
        background: `url(https://i.ibb.co/wZyxgPyb/background-pmwgame.png)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="min-h-screen"
    >
      <PMWGame />
    </div>
  );
}
