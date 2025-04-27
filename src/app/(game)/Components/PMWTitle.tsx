import { IMAGEKIT_LOGOS } from "@/assets/imageKit";
import Image from "next/image";
export default function PMWTitle() {
  return (
    <Image
      src={IMAGEKIT_LOGOS.PINK_MIST_WHALE_LOGO}
      alt="Pink Mist Whale"
      className="w-[60%] mb-5"
      width={100}
      height={100}
    />
  );
}
