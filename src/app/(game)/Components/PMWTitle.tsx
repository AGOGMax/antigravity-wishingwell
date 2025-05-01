import { IMAGEKIT_LOGOS } from "@/assets/imageKit";
import Image from "next/image";

export default function PMWTitle({ isTrioLayout = false }) {
  return (
    <div className="w-full flex justify-center">
      <Image
        src={IMAGEKIT_LOGOS.PINK_MIST_WHALE_LOGO}
        alt="Pink Mist Whale"
        className={
          isTrioLayout
            ? "max-w-[300px] w-full md:w-[80%] lg:w-[60%]"
            : "mb-5 max-w-[300px] w-[60%] sm:w-[40%] md:w-[30%]"
        }
        width={isTrioLayout ? 200 : 100}
        height={isTrioLayout ? 200 : 100}
        style={{ height: "auto" }}
      />
    </div>
  );
}
