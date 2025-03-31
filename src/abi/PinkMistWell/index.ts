import { TEST_NETWORK } from "@/constants";
import { pulsechain, pulsechainV4 } from "viem/chains";

interface IContract {
  address?: `0x${string}`;
  abi?: any;
}

import abi from "./abi.json";
import { CONTRACTS } from "../config";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { TESTCHAINS } from "@/components/RainbowKit";

const contracts: Record<
  number,
  { address: `0x${string}` | undefined; abi: any }
> = {
  [pulsechain.id]: {
    address: CONTRACTS[pulsechain.id].pinkMistWell,
    abi,
  },
  [pulsechainV4.id]: {
    address: CONTRACTS[pulsechainV4.id].pinkMistWell,
    abi,
  }
};

const usePinkMistWellContract = (): IContract => {
  const [contract, setContract] = useState<IContract>({
    abi: {},
    address: zeroAddress,
  });
  useEffect(() => {
    if (TEST_NETWORK) {
      const id = TESTCHAINS[0].id;
      setContract(contracts[id]);
    } else {
      setContract(contracts[pulsechain.id]);
    }
  }, []);

  return contract;
};

export default usePinkMistWellContract;
