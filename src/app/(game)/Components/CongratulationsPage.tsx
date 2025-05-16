import { useEffect, useRef } from "react";
import useSound from "use-sound";

interface CongratsProps {
  winnerDetails: [bigint, string, bigint, bigint, bigint];
}
export default function CongratulationsPage({ winnerDetails }: CongratsProps) {
  const [play] = useSound("/sounds/congratulations.wav", { volume: 1 });

  useEffect(() => {
    play();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <p className="!text-[16px] md:!text-[24px]"> Congratulations!</p>
      <p className="!text-[32px] md:!text-[56px] text-[gold]">
        {Number(winnerDetails[2]) + 1}
      </p>
      <p className="!text-[10px] md:!text-[20px]">Winner: {winnerDetails[1]}</p>
      <p className="!text-[10px] md:!text-[20px]">
        Amount Won: {Number(winnerDetails[3])} $DARK
      </p>
    </div>
  );
}
