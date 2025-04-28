import { Button, Text } from "nes-ui-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function ConnectWallet() {
  const { openConnectModal } = useConnectModal();

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openConnectModal) {
      openConnectModal();
    }
  };
  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <Text size="large" centered>
        Please Connect Your Wallet to Play The Game.
      </Text>
      <Button color="primary" size="large" onClick={handleLogin}>
        Connect Wallet
      </Button>
    </div>
  );
}
