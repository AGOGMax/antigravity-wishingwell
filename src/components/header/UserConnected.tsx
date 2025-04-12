import { condenseAddress } from "@/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { PiWarningCircle } from "react-icons/pi";
import { useEffect } from "react";
import { useRestPost } from "@/hooks/useRestClient";
import { useJourneyData, useUserData } from "@/app/(client)/store";
import { hydrateUserAndNFT } from "./utils";
import { Badge } from "@/components/HTML/Badge";
import { pulsechainV4 } from "viem/chains";
export interface UserData {
  rank: string;
  walletAddress: string; // Add the 'walletAddress' property
  wishwellPoints: number; // Add the 'wishwellPoints' property
  miningPoints: number; // Add the 'miningPoints' property
  totalPoints: number;
  wishwellPulsechainTokenId: string;
  wishwellBaseTokenId: string;
  antigravityBaseTokenId: string;
  antigravityPulsechainTokenId: string;
  // Add other properties if necessary
}

export const UserConnected: React.FC = () => {
  const account = useAccount();
  const { mutation: storeUserData, rank } = useUserData();
  const { journey, phase } = useJourneyData();

  const { mutateAsync: mutateUserData } = useRestPost<UserData>(
    ["user"],
    "/api/user",
  );

  const { mutateAsync: mutateNFTData1 } = useRestPost<any>(
    ["generate-nft"],
    "/api/generate-nft",
  );

  const { mutateAsync: mutateNFTData2 } = useRestPost<any>(
    ["generate-nft"],
    "/api/generate-nft",
  );

  useEffect(() => {
    if (account.address) {
      hydrateUserAndNFT(
        account,
        mutateUserData,
        mutateNFTData1,
        mutateNFTData2,
        storeUserData,
      )
        .then(() => {
          console.log("User Data Updated");
        })
        .catch((err) => console.log({ err }));
    }
  }, [account.address, account.chainId, journey, phase]);

  return (
    <div className="flex text-lg">
      <ConnectButton.Custom>
        {({ chain, openChainModal, mounted, openAccountModal }) => {
          if (chain && chain.unsupported) {
            return (
              <div>
                <div
                  className="flex text-red-400 w-full h-full bg-agblack gap-2 items-center rounded-lg cursor-pointer focus:outline-none peer"
                  onClick={openChainModal}
                >
                  <PiWarningCircle className="text-brred w-8 h-8" />
                  <p className="uppercase font-extrabold text-brred bg-clip-text z-[100]">
                    {condenseAddress(`${account.address}`)}
                  </p>
                </div>
                <div className="peer-hover:flex hidden absolute bg-brred -bottom-8 z-10 rounded font-normal text-base px-8">
                  Wrong network
                </div>
              </div>
            );
          } else if (chain) {
            // if (currentChain !== "" && currentChain != chain.name)
            //   location.reload();
            // setCurrentChain(chain.name as string);
            return (
              <>
                {/* desktop */}
                <div className="hidden lg:flex w-full h-full bg-agblack gap-2 items-center rounded-lg cursor-pointer focus:outline-none">
                  <img
                    src={
                      chain.id === pulsechainV4.id
                        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCuUifRyi_k3LEVGmTLdl5keon5NALvBHHqITJYAtBGw&s"
                        : chain.iconUrl
                          ? chain.iconUrl
                          : ""
                    }
                    alt={chain.name ?? ""}
                    className="w-[40px] h-[40px] rounded-full aspect-square"
                    onClick={openChainModal}
                  />
                  <p
                    className="flex flex-col justify-start items-start gap-0 text-[16px] leading-[16px] uppercase bg-gradient-to-b font-extrabold from-[#B4EBF8] to-[#789DFA] text-transparent bg-clip-text"
                    onClick={openAccountModal}
                  >
                    {condenseAddress(`${account.address}`)}
                    <Badge className="text-agwhite border-agwhite pb-[4px] opacity-[66%]">
                      {rank || "LOADING..."}
                    </Badge>
                  </p>
                </div>
                {/* mobile */}
                <div className="flex flex-col lg:hidden w-full h-full bg-agblack gap-2 items-center rounded-lg cursor-pointer focus:outline-none">
                  {chain.hasIcon ? (
                    <>
                      <Badge className="text-agwhite border-agwhite pb-[4px] opacity-[66%] flex lg:hidden">
                        {rank || "LOADING..."}
                      </Badge>
                      <div className="flex justify-center items-center gap-2">
                        <img
                          src={chain.iconUrl ?? ""}
                          alt={chain.name ?? ""}
                          className="w-[40px] h-[40px] rounded-full aspect-square"
                          onClick={openChainModal}
                        />
                        <p
                          className="flex flex-col justify-start items-start gap-0 text-[16px] leading-[16px] uppercase bg-gradient-to-b font-extrabold from-[#B4EBF8] to-[#789DFA] text-transparent bg-clip-text"
                          onClick={openAccountModal}
                        >
                          {condenseAddress(`${account.address}`)}
                          <Badge className="text-agwhite border-agwhite pb-[4px] opacity-[66%] hidden lg:flex">
                            {rank || "LOADING..."}
                          </Badge>
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </>
            );
          }
        }}
      </ConnectButton.Custom>
    </div>
  );
};
