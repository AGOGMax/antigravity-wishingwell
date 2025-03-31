"use client";
import { Text, PixelBorder, Progress, Button } from "nes-ui-react";
// import { useAccount } from "wagmi";
import Grid from "../Components/Grid";
import { useSchema } from "sanity";
import { useEffect, useState } from "react";

export default function PMWGame() {
  // const account = useAccount();
  const totalParticipants = 369;
  const currentParticipated = 369;
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  useEffect(() => {
    if (currentParticipated < totalParticipants) {
      return setIsRegistrationOpen(true);
    }
    return setIsRegistrationOpen(false);
  }, [currentParticipated, totalParticipants]);

  function getRandomNumber(): number {
    return Math.floor(Math.random() * 369) + 1;
  }

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
      <Grid totalParticipants={totalParticipants} />

      {isRegistrationOpen ? (
        <div className="flex items-center">
          <Button color="primary" onClick={() => console.log("Player Entered")}>
            <Text size="large">Enter Game</Text>
          </Button>
          <Button disabled>
            <Text size="large">Sniper Shot</Text>
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <Button disabled>
            <Text size="large">Game Full</Text>
          </Button>
          <Button
            color="primary"
            onClick={() => console.log("Shot a random player")}
          >
            <Text size="large">Sniper Shot</Text>
          </Button>
        </div>
      )}
    </div>
  );
}
