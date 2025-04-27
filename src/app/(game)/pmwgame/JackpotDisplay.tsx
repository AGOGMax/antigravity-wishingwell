import Image from "next/image";
import { IMAGEKIT_ICONS, IMAGEKIT_LOGOS } from "@/assets/imageKit";

interface JackpotDisplayProps {
  daiAmount: string;
  darkAmount: string;
}

export default function JackpotDisplay({
  daiAmount,
  darkAmount,
}: JackpotDisplayProps) {
  return (
    <div className="flex items-center justify-center h-fit p-4 m-[0px, 0px,8px, 0px] border-[4px] border-[#FDC62C] rounded-[10px] bg-[#00224E]">
      <div className="w-[8rem] h-[6rem] relative">
        <Image src={IMAGEKIT_ICONS.DAI_COIN} alt="DAI Token" fill />
      </div>

      <div className="flex flex-col items-center">
        <div className="w-[16rem] h-[4rem] relative">
          <Image src={IMAGEKIT_LOGOS.JACKPOT_LOGO} alt="Jackpot" fill />
        </div>

        <div className="flex justify-between w-full mt-2 gap-4 text-white text-lg font-semibold">
          <span className="text-[#E49006]">{`${daiAmount} $DAI`}</span>
          <span className="text-[#4A1B78]">{`${darkAmount} $DARK`}</span>
        </div>
      </div>

      <div className="w-[10rem] h-[6rem] relative ml-2">
        <Image
          src={IMAGEKIT_ICONS.PILL_DARK_X_CLAIMED_TRANSPARENT}
          alt="DARK Token"
          fill
        />
      </div>
    </div>
  );
}
