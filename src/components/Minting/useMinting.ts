import useDarkContract from "@/abi/Dark";
import useLCC_Contract from "@/abi/LaunchControlCenter";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { readContract } from "@wagmi/core";
import {
  useAccount,
  useBalance,
  useClient,
  useConfig,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { checkCorrectNetwork, TESTCHAINS } from "../RainbowKit";
import { SUBGRAPH, TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4, sepolia } from "viem/chains";
import {
  errorToast,
  generalToast,
  miningNotif,
  successToast,
} from "@/hooks/frontend/toast";
import { MINTING_STATES } from "./MintingHero";
import { MintError } from "./types";
import { ToastPosition } from "react-hot-toast";
import { useUserData } from "@/app/(client)/store";
import useDarkFaucetContract from "@/abi/DarkFaucet";
import { useRestPost } from "@/hooks/useRestClient";
import { condenseAddress } from "@/utils";
import { useGQLFetch } from "@/hooks/useGraphQLClient";
import { gql } from "graphql-request";
import axios from "axios";

const PULSE_FAUCET =
  "https://jha4wtk6hqmlrpxxtk762jzfb40saewc.lambda-url.us-east-1.on.aws/";

const useMinting = (
  darkInput: bigint,
  setMintStep: Dispatch<SetStateAction<keyof typeof MINTING_STATES>>,
  setTxLoading: Dispatch<SetStateAction<boolean>>,
  setTxError: Dispatch<SetStateAction<MintError>>,
  options: {
    toastOption?: {
      position?: ToastPosition;
      referencePositionX?: number;
    };
  },
) => {
  const { darkBalance } = useUserData();
  const account = useAccount();
  const config = useConfig();

  const LCC_Contract = useLCC_Contract();
  const DarkContract = useDarkContract();

  const { data: pulseChainTestBalance, error: pulsechainBalanceError } =
    useBalance({
      address: account.address,
      chainId: pulsechainV4.id,
      query: {
        enabled: account.address && account.chainId === pulsechainV4.id,
      },
    });

  useEffect(() => {
    if (pulsechainBalanceError) {
      console.log({ pulsechainBalanceError });
    }
  }, [pulsechainBalanceError]);

  useEffect(() => {
    if (account.chainId === pulsechainV4.id) {
      if (pulseChainTestBalance) {
        const balance = Number(
          formatUnits(
            pulseChainTestBalance.value,
            pulseChainTestBalance.decimals,
          ),
        );

        if (balance < 50) {
          let data = JSON.stringify({
            address: account.address,
          });
          axios
            .post(PULSE_FAUCET, data, {
              maxBodyLength: Infinity,
              headers: {
                "Content-Type": "application/json",
              },
            })
            .then((res) => {
              console.log({ res });
              successToast("🥳🥳 Transferred 200 PLS to your account!", {
                duration: 10000,
                position: "top-center",
                className: "scale-2 text-4xl",
              });
            })
            .catch((err) => {
              console.log({ err });
            });
        }
      }
    }
  }, [account.address, account.chainId, pulseChainTestBalance]);

  const {
    data: approveHash,
    writeContractAsync: approve,
    error: approveError,
  } = useWriteContract();
  const {
    data: mintHash,
    writeContractAsync: mint,
    error: mintError,
  } = useWriteContract();
  const { data: approveReceipt } = useWaitForTransactionReceipt({
    hash: approveHash,
    confirmations: 2,
  });
  const { data: mintReceipt } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const [allowance, setAllowance] = useState({ allowed: false, value: -1 });

  useEffect(() => {
    setTxError({ is: false, value: undefined });
    setTxLoading(false);
    if (
      account.address &&
      darkInput &&
      config &&
      DarkContract.address &&
      LCC_Contract.address
    ) {
      readContract(config, {
        address: DarkContract.address as `0x${string}`,
        abi: DarkContract.abi,
        functionName: "allowance",
        chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
        args: [
          account.address as `0x${string}`,
          LCC_Contract.address as `0x${string}`,
        ],
      })
        .then((allowanceData) => {
          const allowance = formatUnits(allowanceData as bigint, 18);
          const response = {
            value: Number(allowance),
            allowed: darkInput <= Number(allowance),
          };

          return setAllowance(response);
        })
        .catch((err) => {
          console.log("ERROR", err);
          setAllowance({ allowed: false, value: 0 });
        });
    } else {
      setAllowance({ allowed: false, value: 0 });
    }
  }, [darkInput, account.address, DarkContract, LCC_Contract, config]);

  const mintFn = useCallback(
    (darkInput: bigint) => {
      setMintStep(MINTING_STATES.MINT);
      mint({
        address: LCC_Contract.address as `0x${string}`,
        abi: LCC_Contract.abi,
        functionName: "mintFuelCell",
        args: [darkInput],
        chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
      })
        .then((tx) => {
          console.log({ tx });
          setMintStep(MINTING_STATES.RECEIPT);
        })
        .catch((err) => {
          console.log({ err });
        });
    },
    [LCC_Contract, mint, setMintStep],
  );

  const approveFn = useCallback(() => {
    setMintStep(MINTING_STATES.APPROVAL);
    approve({
      address: DarkContract.address as `0x${string}`,
      abi: DarkContract.abi,
      functionName: "approve",
      args: [
        LCC_Contract.address as `0x${string}`,
        parseUnits(darkInput.toString(), 18),
      ],
      chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
    })
      .then((tx) => {
        console.log({ approveTx: tx });
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [DarkContract, LCC_Contract, darkInput, approve, setMintStep]);

  const mintLogic = useCallback(() => {
    setTxError({ is: false, value: undefined });
    if (
      darkInput > 0 &&
      checkCorrectNetwork(account.chainId, [
        TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
      ])
    ) {
      setTxLoading(true);
      if (allowance.allowed) {
        mintFn(darkInput);
      } else {
        approveFn();
      }
    } else {
      setTxLoading(false);
      if (
        !checkCorrectNetwork(account.chainId, [
          TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
        ])
      )
        errorToast("You are connected to a wrong network!");
      else if (darkInput < darkBalance) {
        errorToast("Insufficient Dark Balance!");
      }
    }
  }, [
    allowance.allowed,
    darkInput,
    mintFn,
    approveFn,
    darkBalance,
    account.chainId,
    setTxLoading,
    setTxError,
  ]);

  useEffect(() => {
    if (approveReceipt) {
      mintFn(darkInput);
      generalToast(
        `${Number(darkInput)} $DARK tokens approved for minting.`,
        {
          position: options?.toastOption?.position,
        },
        options?.toastOption?.referencePositionX,
      );
      console.log({ approveReceipt });
    }
  }, [approveReceipt, mintFn]);

  const { mutateAsync: verifyMint } = useRestPost(
    ["verify-minting"],
    "/api/verify-minting",
  );

  useEffect(() => {
    if (mintReceipt) {
      setMintStep(MINTING_STATES.SUCCESS);
      verifyMint({
        walletAddress: account.address,
      })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
      console.log({ mintReceipt });
    }
  }, [mintReceipt, setMintStep]);

  useEffect(() => {
    if (approveError) {
      setTxError({ is: true, value: "Approve" });
      setTxLoading(false);
      let errorMessage = "";
      // @ts-ignore
      if (approveError?.cause?.code === 4001) {
        errorMessage = "Approve Failed. You denied transaction.";
      } else {
        errorMessage = "Something went wrong! Please try again.";
      }
      errorToast(
        errorMessage,
        {
          position: options?.toastOption?.position,
        },
        options?.toastOption?.referencePositionX,
      );
      console.log({ approveError });
    }
  }, [approveError]);

  useEffect(() => {
    if (mintError) {
      setMintStep(MINTING_STATES.INITIAL);
      setAllowance({ allowed: true, value: Number(darkInput.toString()) });
      setTxLoading(false);
      setTxError({ is: true, value: "Mint" });
      console.log({ mintError });

      let errorMessage = "";
      // @ts-ignore
      if (mintError?.cause?.code === 4001) {
        errorMessage = "Mint of Fuel Cells Failed. You denied transaction.";
      } else {
        errorMessage =
          "Minting of Fuel Cells Failed. Try Again or Contact our team.";
      }
      errorToast(
        errorMessage,
        {
          position: options?.toastOption?.position,
        },
        options?.toastOption?.referencePositionX,
      );
    }
  }, [mintError]);

  useEffect(() => {
    if (allowance.allowed) {
      setMintStep(MINTING_STATES.MINT);
    } else {
      setMintStep(MINTING_STATES.INITIAL);
    }
  }, [allowance, setMintStep]);

  // <====================DARK FAUCET=================>
  const DarkFaucetContract = useDarkFaucetContract();
  const {
    writeContractAsync: faucetOpen,
    data: faucetHash,
    error: faucetError,
  } = useWriteContract();
  const { data: faucetReceipt } = useWaitForTransactionReceipt({
    hash: faucetHash,
  });

  const faucetCall = useCallback(
    (address: string) => {
      faucetOpen({
        address: DarkFaucetContract.address as `0x${string}`,
        abi: DarkFaucetContract.abi,
        args: [address],
        functionName: "drip",
      }).catch((err) => {
        console.log({ err });
      });
    },
    [DarkFaucetContract],
  );

  // <====================DARK FAUCET END=================>

  // <===================MINTING NOTIFICATIONS==================>
  const client = usePublicClient({
    chainId: TEST_NETWORK ? pulsechainV4.id : pulsechain.id,
  });

  const { data: mintsData } = useGQLFetch<{
    mints: { amount: string; user: { address: string } }[];
  }>(
    ["mints"],
    gql`
      query MyQuery {
        mints(orderBy: timestamp, orderDirection: desc, first: 3) {
          items {
            amount
            user {
              address
            }
          }
        }
      }
    `,
    TEST_NETWORK ? TESTCHAINS[0].id : pulsechain.id,
    {},
    { url: `${SUBGRAPH}` },
  );

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    const mints = mintsData?.mints;
    mints?.forEach((mint, index) => {
      const randomDelay = Math.floor(Math.random() * 25000) + 4000; // Random delay between 1s and 5s
      const timeoutId = setTimeout(() => {
        miningNotif(
          `${condenseAddress(mint.user.address)} just minted ${mint.amount} Fuel Cells.`,
          {
            position: options?.toastOption?.position,
          },
          options?.toastOption?.referencePositionX,
        );
      }, randomDelay); // Each mint will be logged randomly between 4 seconds and 25 seconds
      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [mintsData]);

  useEffect(() => {
    if (LCC_Contract.abi && LCC_Contract.address !== zeroAddress) {
      const unwatch = client?.watchContractEvent({
        address: LCC_Contract.address as `0x${string}`,
        abi: LCC_Contract.abi,
        eventName: "FuelCellsMinted",
        onLogs(logs) {
          // @ts-ignore
          const args = logs[0]?.args;
          const { amountOfFuelCellsMinted, fuelHolder } = args;
          setTimeout(() => {
            miningNotif(
              `${condenseAddress(fuelHolder)} just minted ${amountOfFuelCellsMinted.toString()} Fuel Cells.`,
              {
                position: options?.toastOption?.position,
              },
              options?.toastOption?.referencePositionX,
            );
          }, 3000);
        },
        onError(error) {
          console.log("ERRor", { error });
        },
      });

      return () => {
        if (unwatch) {
          unwatch();
        }
      };
    }
  }, [LCC_Contract]);
  // <====================MINTING NOTIFICATIONS END=================>

  return { darkBalance, allowance, mintLogic, faucetCall };
};

export default useMinting;
