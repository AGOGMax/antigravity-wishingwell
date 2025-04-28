import { IMAGEKIT_LOGOS } from "@/assets/imageKit";
import Image from "next/image";

interface PMWTitleProps {
  width?: number;
}

export default function PMWTitle({ width = 60 }: PMWTitleProps) {
  return (
    <Image
      src={IMAGEKIT_LOGOS.PINK_MIST_WHALE_LOGO}
      alt="Pink Mist Whale"
      className="mb-5"
      width={100}
      height={100}
      style={{ width: `${width}%` }}
    />
  );
}
