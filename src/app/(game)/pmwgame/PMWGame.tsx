"use client";
import { Text, PixelBorder, Progress, Button } from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { useReadContract } from "wagmi";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

export default function PMWGame() {
  const account = useAccount();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const { openConnectModal } = useConnectModal();
  const PMWContract = usePinkMistWellContract();

  const {
    data: currentParticipantsList,
    error: currentParticipantsError,
    isFetched: currentParticipantsFetched,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "getCurrentRoundEntrants",
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  const totalParticipants = 369;
  const [currentParticipated, setCurrentParticipated] = useState(0);

  useEffect(() => {
    if (currentParticipantsFetched) {
      setCurrentParticipated(
        (currentParticipantsList as Array<string>)?.length,
      );
    }
  }, [currentParticipantsList]);

  useEffect(() => {
    if (currentParticipated < totalParticipants) {
      return setIsRegistrationOpen(true);
    }
    return setIsRegistrationOpen(false);
  }, [currentParticipated, totalParticipants]);

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="m-8 flex flex-col justify-center items-center gap-[1rem] box-border">
      <PixelBorder
        doubleSize
        doubleRoundCorners
        style={{
          width: "max-content",
          padding: "8px 16px",
          marginBottom: "16px",
        }}
      >
        <Text size="large" centered>
          <br />
          Pink Mist Well
        </Text>
      </PixelBorder>
      {account.isConnected ? (
        <>
          <div className="flex flex-col items-center">
            <Text>
              {isRegistrationOpen
                ? `${currentParticipated} out of 
            ${totalParticipants}...`
                : "Registration Complete"}
            </Text>
            <Progress
              value={currentParticipated}
              max={totalParticipants}
              color="pattern"
              style={{ width: "40vw" }}
            />
          </div>
          <Grid currentParticipated={currentParticipated} />

          {isRegistrationOpen ? (
            <Button
              color="primary"
              onClick={() => console.log("Player Entered")}
              size="large"
            >
              <Text size="large">Enter Game</Text>
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={() => console.log("Shot a random player")}
              size="large"
            >
              <Text size="large">Sniper Shot</Text>
            </Button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[100%] mt-[100px]">
          <Text size="large">Please Connect Your Wallet to Play The Game.</Text>
          <Button color="primary" size="large" onClick={handleLogin}>
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
