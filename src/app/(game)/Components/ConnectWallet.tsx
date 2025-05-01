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
    <div className="flex-grow flex flex-col items-center justify-center gap-6">
      <p className="text-xl text-white text-center font-medium">
        Please Connect Your Wallet to Play The Game.
      </p>
      <button
        onClick={handleLogin}
        className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg 
                 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-pink-500/30
                 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
      >
        Connect Wallet
      </button>
    </div>
  );
}
