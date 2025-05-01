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
    <div className="flex items-center p-4 border-4 border-yellow-400 rounded-lg bg-[#00224E] gap-4 w-full max-w-md">
      <Image
        src={IMAGEKIT_ICONS.DAI_COIN}
        alt="DAI Token"
        width={60}
        height={60}
        className="object-contain"
      />

      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-40 h-12">
          <Image
            src={IMAGEKIT_LOGOS.JACKPOT_LOGO}
            alt="Jackpot"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex justify-between w-full mt-2">
          <span className="text-orange-400 text-sm font-bold">{`${daiAmount} $DAI`}</span>
          <span className="text-pink-400 text-sm font-bold">{`${darkAmount} $DARK`}</span>
        </div>
      </div>

      <Image
        src={IMAGEKIT_ICONS.PILL_DARK_X_CLAIMED_TRANSPARENT}
        alt="DARK Token"
        width={60}
        height={60}
        className="object-contain"
      />
    </div>
  );
}
