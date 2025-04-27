import { Text } from "nes-ui-react";

interface JackpotDisplayProps {
  daiAmount: string;
  darkAmount: string;
}

export default function JackpotDisplay({
  daiAmount,
  darkAmount,
}: JackpotDisplayProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-5 h-fit px-8 py-4 mb-8 border-[4px] border-[#FDC62C] rounded-[10px] bg-[#00224E]">
      <div className="flex items-center justify-center ">
        <img
          src="https://i.ibb.co/yvm1Jdk/dai-coin-icon-isolated-on-white-background-vector-40276186-Photoroom.png"
          alt="DAI Token"
          className="w-[20%]"
        />

        <img
          src="https://i.ibb.co/ksJRg7kX/Chat-GPT-Image-Apr-16-2025-08-01-56-PM-Photoroom-1.png"
          alt="Jackpot"
          className="w-[70%]"
        />

        <img
          src="https://i.ibb.co/7N13kzMp/4900401657620311773-Photoroom.png"
          alt="DARK Token"
          className="w-[20%]"
        />
      </div>
      <div className="flex justify-between font-semibold w-full">
        <span className="text-[#FDC62C]">{`${daiAmount} $DAI`}</span>
        <span className="text-[#ff69b4] text-right">{`${darkAmount} $DARK`}</span>
      </div>
    </div>
  );
}
