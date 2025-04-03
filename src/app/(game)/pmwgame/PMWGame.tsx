"use client";
import { Text, PixelBorder, Progress, Button, Input } from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { useReadContracts } from "wagmi";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";

export default function PMWGame() {
  const account = useAccount();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const { openConnectModal } = useConnectModal();
  const PMWContract = usePinkMistWellContract();
  const [userTickets, setUserTickets] = useState(0);

  const {
    data: PMWReader,
    error: PMWError,
    isFetched: PMWFetched,
    refetch: refetchPMWReader,
  } = useReadContracts({
    contracts: ["getCurrentRoundEntrants", "MAX_ENTRIES"].map(
      (functionName) => ({
        address: PMWContract.address as `0x${string}`,
        abi: PMWContract.abi,
        functionName,
        chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
      }),
    ),
  });

  const totalParticipants = Number(PMWReader?.[1].result);
  const [currentParticipated, setCurrentParticipated] = useState(0);

  useEffect(() => {
    if (PMWFetched) {
      setCurrentParticipated((PMWReader?.[0].result as Array<string>)?.length);
    }
  }, [PMWReader?.[0].result]);

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

  function handleChange(value: string) {
    setUserTickets(value === "" ? 0 : Number(value));
  }

  const {
    enterGame,
    transactionLoading: isEnterGameTransactionLoading,
    approveIsLoading: isEnterGameTokenApprovalLoading,
    enterGameReceipt,
  } = useEnterGame(BigInt(userTickets));

  const {
    eliminateUser,
    transactionLoading: isEliminateUserTransactionLoading,
    eliminateUserReceipt,
  } = useEliminateUser();

  useEffect(() => {
    if (
      !isEnterGameTransactionLoading &&
      (enterGameReceipt || eliminateUserReceipt)
    ) {
      refetchPMWReader();
    }
  }, [isEnterGameTransactionLoading, enterGameReceipt, eliminateUserReceipt]);

  const renderEnterGameButtonState = () => {
    if (isEnterGameTokenApprovalLoading) {
      return "Approving...";
    } else if (isEnterGameTransactionLoading) {
      return "Entering Game...";
    }
    return "Enter Game";
  };

  const renderEliminateUserButtonState = () => {
    if (isEliminateUserTransactionLoading) {
      return "Misting 'em...";
    }
    return "Mist 'em";
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
          Pink Mist Whale
        </Text>
      </PixelBorder>
      {account.isConnected ? (
        <>
          <div className="flex flex-col items-center">
            <Text>
              {isRegistrationOpen
                ? `${currentParticipated} out of 
            ${totalParticipants}...`
                : ""}
            </Text>
            {isRegistrationOpen && (
              <Progress
                value={currentParticipated}
                max={totalParticipants}
                color="pattern"
                style={{ width: "40vw" }}
              />
            )}
          </div>
          <Grid currentParticipated={currentParticipated} />

          {isRegistrationOpen ? (
            <div className="flex items-center justify-center gap-[10px]">
              <div className="flex flex-col">
                <Input
                  type="number"
                  name="userTickets"
                  value={userTickets.toString()}
                  label="Number Of Tickets: "
                  style={{ height: "32px", fontSize: "16px" }}
                  onChange={handleChange}
                />
              </div>
              <Button
                color="primary"
                size="large"
                disabled={userTickets <= 0 || isEnterGameTransactionLoading}
                onClick={enterGame}
              >
                {renderEnterGameButtonState()}
              </Button>
            </div>
          ) : (
            <Button
              color="primary"
              onClick={eliminateUser}
              disabled={isEliminateUserTransactionLoading}
              size="large"
            >
              <Text size="large">{renderEliminateUserButtonState()}</Text>
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
