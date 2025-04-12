import { condenseAddress } from "@/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { PiWarningCircle } from "react-icons/pi";

export const UserWalletAddress: React.FC = () => {
  const account = useAccount();

  return (
    <div className="flex text-lg">
      <ConnectButton.Custom>
        {({ chain, openChainModal, mounted, openAccountModal }) => {
          if (chain && chain.unsupported) {
            return (
              <div>
                <div
                  className="flex text-red-400 w-full h-full p-3 bg-agblack gap-2 items-center rounded-lg cursor-pointer focus:outline-none peer"
                  onClick={openChainModal}
                >
                  <PiWarningCircle className="text-brred w-8 h-8" />
                  <p className="uppercase font-extrabold mb-0 text-brred bg-clip-text z-[100]">
                    {condenseAddress(`${account.address}`)}
                  </p>
                </div>
                <div className="peer-hover:flex hidden absolute bg-brred -bottom-8 z-10 rounded font-normal text-base px-8">
                  Wrong network
                </div>
              </div>
            );
          } else if (chain) {
            return (
              <>
                <div className="lg:flex w-full h-full bg-agblack p-3 gap-2 items-center rounded-lg cursor-pointer focus:outline-none">
                  <p
                    className="flex flex-col justify-start mb-0 items-start gap-0 text-[16px] leading-[16px] uppercase bg-gradient-to-b font-extrabold from-[#B4EBF8] to-[#789DFA] text-transparent bg-clip-text"
                    onClick={openAccountModal}
                  >
                    {condenseAddress(`${account.address}`)}
                  </p>
                </div>
              </>
            );
          }
        }}
      </ConnectButton.Custom>
    </div>
  );
};
