import Image from "next/image";
import { PixelBorder } from "nes-ui-react";

interface JackpotDisplayProps {
  daiAmount: string;
  darkAmount: string;
}

export default function JackpotDisplay({
  daiAmount,
  darkAmount,
}: JackpotDisplayProps) {
  return (
    <PixelBorder className="flex items-center justify-center w-fit p-4 m-[0px, 0px,8px, 0px]">
      <div className="w-[6rem] h-[6rem] relative mr-2">
        <Image
          src="https://i.ibb.co/yvm1Jdk/dai-coin-icon-isolated-on-white-background-vector-40276186-Photoroom.png"
          alt="DAI Token"
          fill
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="w-[24rem] h-[6rem] relative">
          <Image
            src="https://i.ibb.co/ksJRg7kX/Chat-GPT-Image-Apr-16-2025-08-01-56-PM-Photoroom-1.png"
            alt="Jackpot"
            fill
          />
        </div>

        <div className="flex justify-between w-full mt-2 gap-4 text-white text-lg font-semibold">
          <span className="text-[#E49006]">{`${daiAmount} $DAI`}</span>
          <span className="text-[#4A1B78]">{`${darkAmount} $DARK`}</span>
        </div>
      </div>

      <div className="w-[6rem] h-[6rem] relative ml-2">
        <Image
          src="https://i.ibb.co/7N13kzMp/4900401657620311773-Photoroom.png"
          alt="DARK Token"
          fill
        />
      </div>
    </PixelBorder>
  );
}
