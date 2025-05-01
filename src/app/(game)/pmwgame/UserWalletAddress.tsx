import { condenseAddress } from "@/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { PiWarningCircle } from "react-icons/pi";

export const UserWalletAddress: React.FC = () => {
  const { address } = useAccount();

  return (
    <ConnectButton.Custom>
      {({ chain, openChainModal, openAccountModal }) => {
        const baseClasses =
          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all justify-center md:justify-end lg:justify-end";
        const addressClasses =
          "uppercase font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#B4EBF8] to-[#789DFA] text-center";

        if (chain?.unsupported) {
          return (
            <div className="relative group">
              <div
                className={`${baseClasses} bg-red-900/30 text-red-400 hover:bg-red-900/40`}
                onClick={openChainModal}
              >
                <PiWarningCircle className="flex-shrink-0 w-5 h-5" />
                <span className={addressClasses}>
                  {condenseAddress(address || "")}
                </span>
              </div>
              <div className="absolute hidden group-hover:block -bottom-8 left-0 bg-red-500 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                Wrong network - Click to switch
              </div>
            </div>
          );
        }

        return (
          <div
            className={`${baseClasses} hover:bg-white/5`}
            onClick={openAccountModal}
          >
            <span className={`${addressClasses} text-[15px] leading-5`}>
              {condenseAddress(address || "")}
            </span>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
