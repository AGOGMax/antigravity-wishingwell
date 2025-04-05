"use client";
import {
  Text,
  PixelBorder,
  Progress,
  Button,
  Input,
  Toolbar,
  Separator,
} from "nes-ui-react";
import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import usePinkMistWellContract from "@/abi/PinkMistWell";
import { useReadContracts, useReadContract } from "wagmi";
import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";
import useEnterGame from "@/hooks/sc-fns/useEnterGame";
import useEliminateUser from "@/hooks/sc-fns/useEliminateUser";

export default function PMWGame() {
  const account = useAccount();
  const userAddress = account?.address as `0x${string}`;
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const { openConnectModal } = useConnectModal();
  const PMWContract = usePinkMistWellContract();
  const [userTickets, setUserTickets] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);

  const {
    data: PMWReader,
    error: PMWError,
    isFetched: PMWFetched,
    refetch: refetchPMWReader,
  } = useReadContracts({
    contracts: [
      "getCurrentRoundActiveTickets",
      "MAX_ENTRIES",
      "currentRoundId",
    ].map((functionName) => ({
      address: PMWContract.address as `0x${string}`,
      abi: PMWContract.abi,
      functionName,
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
    })),
  });

  const [currentParticipatedCount, setcurrentParticipatedCount] = useState(0);
  const [currentParticipatedList, setcurrentParticipatedList] = useState(
    [] as Array<Array<string>>,
  );
  const totalParticipants = Number(PMWReader?.[1].result);
  const currentRoundId = PMWReader?.[2].result;

  useEffect(() => {
    if (PMWFetched) {
      setcurrentParticipatedList(PMWReader?.[0].result as Array<Array<string>>);
      setcurrentParticipatedCount(
        (PMWReader?.[0].result as Array<Array<string>>)[0]?.length,
      );
    }
  }, [PMWReader?.[0].result]);

  const {
    data: getUserTicketsReader,
    isFetched: isUserTicketsFetched,
    refetch: refetchUserTickets,
  } = useReadContracts({
    contracts: ["getUserTickets", "getUserActiveTicketCount"].map(
      (functionName) => ({
        address: PMWContract.address as `0x${string}`,
        abi: PMWContract.abi,
        functionName,
        args: [currentRoundId, userAddress],
      }),
    ),
  });

  const {
    data: roundsDataReader,
    isFetched: isRoundsFetched,
    refetch: refetchRounds,
  } = useReadContract({
    address: PMWContract.address as `0x${string}`,
    abi: PMWContract.abi,
    functionName: "rounds",
    args: [currentRoundId],
  });

  const [isRoundClosed, setIsRoundClosed] = useState(true);
  useEffect(() => {
    if (isRoundsFetched) {
      setIsRoundClosed((roundsDataReader as Array<boolean>)?.[3]);
    }
  }, [roundsDataReader]);

  const [userAllTickets, setUserAllTickets] = useState(
    [] as Array<Array<number>>,
  );

  const [userActiveTicketCount, setUserActiveTicketCount] = useState(0);

  useEffect(() => {
    if (isUserTicketsFetched) {
      setUserAllTickets(
        getUserTicketsReader?.[0].result as Array<Array<number>>,
      );
      setUserActiveTicketCount(Number(getUserTicketsReader?.[1].result));
    }
  }, [getUserTicketsReader]);
  console.log("user active ticket count", userActiveTicketCount);

  useEffect(() => {
    setMaxTickets(totalParticipants - currentParticipatedCount);
  }, [currentParticipatedCount, totalParticipants]);

  useEffect(() => {
    if (isRoundClosed) {
      return setIsRegistrationOpen(false);
    }
    return setIsRegistrationOpen(true);
  }, [roundsDataReader]);

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
      refetchUserTickets();
      refetchRounds();
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
      <Toolbar
        style={{
          padding: "10px 15px",
          width: "80vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="w-[33%]">
          <Text size="large">
            Your Active Tickets: {userActiveTicketCount || 0}
          </Text>
        </div>
        <Separator />
        <div className="w-[33%]">
          <Text size="large">ROUND-{Number(currentRoundId)}</Text>
        </div>
        {account.isConnected && (
          <div className="w-[33%]">
            <Separator />
            <Text size="large">0x...{String(userAddress)?.slice(-3)}</Text>
          </div>
        )}
      </Toolbar>
      {account.isConnected ? (
        <>
          <div className="flex flex-col items-center">
            <Text>
              {isRegistrationOpen
                ? `${currentParticipatedCount} out of 
            ${totalParticipants}...`
                : ""}
            </Text>
            {isRegistrationOpen && (
              <Progress
                value={currentParticipatedCount}
                max={totalParticipants}
                color="pattern"
                style={{ width: "40vw" }}
              />
            )}
          </div>
          <Grid
            currentParticipatedList={currentParticipatedList}
            userAddress={userAddress}
          />

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
                  color={
                    userTickets < 0 || userTickets > maxTickets
                      ? "error"
                      : "none"
                  }
                />
                <Text size="medium" color="warning">
                  Max Tickets: {maxTickets}
                </Text>
              </div>
              <Button
                color="primary"
                size="large"
                disabled={
                  userTickets <= 0 ||
                  userTickets > maxTickets ||
                  isEnterGameTransactionLoading
                }
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
