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
    <header className="w-full max-w-4xl bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 sm:gap-0">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm sm:text-base font-medium text-white/80 mb-1">
            Your Active Tickets
          </p>
          <p
            className="text-xl font-bold text-[gold] mb-0"
            style={{ fontSize: "1.5rem" }}
          >
            {activeTicketsCount || 0}
          </p>
        </div>

        <div className="h-px w-full sm:h-12 sm:w-px bg-white/20" />

        <div className="flex-1 text-center">
          <p className="text-sm sm:text-base font-medium text-white/80 mb-1">
            Current Round
          </p>
          <p
            className="text-xl font-bold text-[gold] mb-0"
            style={{ fontSize: "1.5rem" }}
          >
            ROUND-{currentRoundId}
          </p>
        </div>

        {isAccountConnected && (
          <>
            <div className="h-px w-full sm:h-12 sm:w-px bg-white/20" />
            <div className="flex-1 text-center sm:text-right">
              <p className="text-sm sm:text-base font-medium text-white/80 mb-1">
                Connected Wallet
              </p>
              <div className="text-lg font-mono font-medium text-white truncate max-w-[180px] mx-auto sm:max-w-none">
                <UserWalletAddress />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
