import useContract from "@/abi/wishwell";
import { POLL_TIME, TEST_NETWORK } from "@/constants";
import { useEffect, useState } from "react";
import { pulsechain } from "viem/chains";
import { useAccount, useTransactionReceipt, useWriteContract } from "wagmi";
import { errorToast, generalToast, successToast } from "../frontend/toast";
import { checkCorrectNetwork, TESTCHAINS } from "@/components/RainbowKit";
import { gql } from "graphql-request";
import { useRestPost } from "../useRestClient";
import { UserData } from "@/components/header/UserConnected";
import { useUserData } from "@/app/(client)/store";
import { useGQLFetch } from "../useGraphQLClient";
import { hydrateUserAndNFT } from "@/components/header/utils";

type Props = {};

const useWishwell = () => {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [registering, setIsRegistering] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [poll, setPoll] = useState<boolean>(false);
  const [nftURI, setNftURI] = useState("");
  const account = useAccount();
  const AntiGravity = useContract();

  useEffect(() => {
    if (account.address && account.chainId) {
      setLoading(true);
      setIsRegistered(false);
      setIsSuccess(false);
      setPoll(false);
    }
  }, [account.address, account.chainId]);

  const { mutateAsync: mutateUserData } = useRestPost<UserData>(
    ["user"],
    "/api/user",
  );

  const { mutateAsync: mutateNFTData1 } = useRestPost<any>(
    ["generate-nft-era1"],
    "/api/generate-nft",
  );

  const { mutateAsync: mutateNFTData2 } = useRestPost<any>(
    ["generate-nft-era2"],
    "/api/generate-nft",
  );

  const { nftURLera1, wishwellPoints, mutation: storeUser } = useUserData();

  const { data: tokenData, isError } = useGQLFetch<{
    users: { address: string; wishwellId: { tokenId: string } }[];
  }>(
    ["tokenIDs", account.address as string],
    gql`
      query TokenIds($address_contains: String) {
        users(where: { address_contains: $address_contains }, limit: 1) {
          items {
            address
            wishwell {
              tokenId
            }
          }
        }
      }
    `,
    account.chainId || (TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id),
    { address: account.address },
    {
      enabled:
        account.isConnected && !error && checkCorrectNetwork(account.chainId),
    },
  );

  useEffect(() => {
    if (tokenData) {
      const tokenId = tokenData?.users?.[0]?.wishwellId?.tokenId;
      if (tokenId) {
        setTokenId(tokenId);
      } else {
        setIsRegistered(false);
        setLoading(false);
      }
    } else {
      setIsRegistered(false);
      setLoading(false);
    }
    if (isError) {
      console.log("Error in Fetching token IDs from Subgraph");
      setError(true);
    }
  }, [tokenData, isError]);

  useEffect(() => {
    if (Number(tokenId) > 0) {
      setIsRegistered(true);
      setPoll(true);
      if (nftURLera1) {
        setIsSuccess(true);
      }
    }
  }, [tokenId, nftURLera1]);

  useEffect(() => {
    if (isRegistered) {
      let timer: any;
      hydrateUserAndNFT(
        account,
        mutateUserData,
        mutateNFTData1,
        mutateNFTData2,
        storeUser,
      );
      if (poll) {
        timer = setInterval(() => {
          hydrateUserAndNFT(
            account,
            mutateUserData,
            mutateNFTData1,
            mutateNFTData2,
            storeUser,
          );
        }, POLL_TIME ?? 30000);
      }

      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    }
  }, [poll, isRegistered]);

  const {
    data: registerHash,
    error: registerError,
    writeContract: register,
  } = useWriteContract();

  const { data: registerReceipt, isFetched: registerFetched } =
    useTransactionReceipt({
      hash: registerHash,
    });

  const registerFn = async () => {
    setIsRegistering(true);
    generalToast("Getting you registered!", {
      duration: 10000,
    });

    await register({
      // @ts-ignore
      address: AntiGravity?.address,
      abi: AntiGravity?.abi,
      functionName: "register",
    });
  };

  useEffect(() => {
    if (registerError) {
      let errorMessage = "";
      // @ts-ignore
      if (registerError.cause.code === 4001) {
        errorMessage = "Transaction was rejected. Approve to continue";
      } else {
        errorMessage = "Something went wrong";
      }
      errorToast(errorMessage, {
        duration: 3000,
      });
      setIsRegistering(false);
      setIsRegistered(false);
    }
  }, [registerError]);

  useEffect(() => {
    if (registerReceipt) {
      successToast("Registered successful", {
        duration: 3000,
      });
      hydrateUserAndNFT(
        account,
        mutateUserData,
        mutateNFTData1,
        mutateNFTData2,
        storeUser,
      );
      setIsRegistered(true);
      setIsRegistering(false);
    }
  }, [registerReceipt]);

  return {
    tokenId,
    isRegistered,
    isSuccess,
    loading,
    error,
    nftURI,
    setError,
    poll,
    registerKit: {
      registerFn,
      registerError,
      register,
      registerIdle: !registering,
      registerFetched,
    },
  };
};

export default useWishwell;
