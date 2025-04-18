import { Separator, Text, Toolbar } from "nes-ui-react";
import { UserWalletAddress } from "../pmwgame/UserWalletAddress";

interface HeaderProps {
  activeTicketsCount: number;
  currentRoundId: number;
  isAccountConnected: boolean;
}

export default function Header({
  activeTicketsCount,
  currentRoundId,
  isAccountConnected,
}: HeaderProps) {
  return (
    <Toolbar
      style={{
        padding: "8px 0",
        width: "80vw",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <div className="w-[33%] flex justify-center items-center">
        <Text size="large" style={{ marginBottom: "0" }} centered>
          Your Active Tickets: {activeTicketsCount || 0}
        </Text>
      </div>
      <Separator />
      <div className="w-[33%] flex justify-center items-center">
        <Text size="large" style={{ marginBottom: "0" }}>
          ROUND-{Number(currentRoundId)}
        </Text>
      </div>
      {isAccountConnected && (
        <>
          <Separator />
          <div className="w-[33%] flex justify-center items-center">
            <UserWalletAddress />
          </div>
        </>
      )}
    </Toolbar>
  );
}
