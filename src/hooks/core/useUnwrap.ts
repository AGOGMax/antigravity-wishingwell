import { formatUnits } from "viem";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from "wagmi";
import useEAContract from "@/abi/EvilAddress";
import {
  fetchNonPrunedWinnings,
  fetchUserFuelCellsMappingWithTotalYield,
} from "../../toolsUtils/unwrap";
import toast from "react-hot-toast";
import useFuelCellContract from "@/abi/FuelCell";
import useTreasuryContract from "@/abi/Treasury";
import { waitForTransactionReceipt } from "@wagmi/core";

type TABLE_DATA_UF = Record<
  number,
  { fuelCells: number[]; totalYieldPerFuelCell: number }
>;

const useUnwrap = (inputValue: number, optimized: boolean) => {
  const TreasuryContract = useTreasuryContract();
  const EAContract = useEAContract();
  const FuelCellContract = useFuelCellContract();
  const account = useAccount();

  const [totalData, setTotalData] = useState<TABLE_DATA_UF>({});
  const [dataLoading, setDataLoading] = useState(false);

  const fetchAllData = async () => {
    setDataLoading(true);
    let hasNextPage = true;
    let nextCursor;
    let count = 0;
    let tableData: TABLE_DATA_UF[] = [];
    while (hasNextPage) {
      const data = await fetchUserFuelCellsMappingWithTotalYield(
        // `${EAContract.address}`,
        `${account.address}`,
        500,
        nextCursor,
      );
      const { pageInfo, ...dataWithoutPageInfo } = data;
      hasNextPage = pageInfo.hasNextPage;
      nextCursor = pageInfo.endCursor;
      console.log({ data });
      tableData.push(dataWithoutPageInfo);
      count++;
    }
    const finalData: TABLE_DATA_UF = {};
    tableData.map((item) => {
      const keys = Object.keys(item);
      keys.forEach((key) => {
        const nKey = Number(key);
        const fuelCells = finalData?.[nKey]?.fuelCells ?? [];
        finalData[nKey] = {
          fuelCells: [...fuelCells, ...item[nKey]?.fuelCells],
          totalYieldPerFuelCell: item[nKey]?.totalYieldPerFuelCell,
        };
      });
    });

    const nonPrunedWinnings = await fetchNonPrunedWinnings(
      `${account.address ?? ""}`,
    );

    const updatedkeys = Object.keys(finalData);

    updatedkeys.forEach((key) => {
      const nKey = Number(key);
      const fuelCells = finalData[nKey].fuelCells;
      const nonPrunedWinningFuelCells = nonPrunedWinnings[nKey];
      console.log({ nonPrunedWinningFuelCells });
      finalData[nKey].fuelCells = fuelCells.filter(
        (fuelCell) => !nonPrunedWinningFuelCells?.includes(fuelCell),
      );
    });
    setTotalData(finalData);
    setDataLoading(false);
  };

  useEffect(() => {
    if (account.address) {
      fetchAllData();
    }
  }, [account.address]);

  const tableData = useMemo(() => {
    if (totalData && inputValue > 0) {
      const keys = Object.keys(totalData)
        .map(Number)
        .sort((a, b) => (optimized ? a - b : b - a));
      let count = 0;
      let result: (Number | string)[][] = [];
      keys.forEach((key) => {
        const journeyFuelCells = totalData[key].fuelCells;
        const payoutPerFuelCell = formatUnits(
          BigInt(totalData[key].totalYieldPerFuelCell),
          18,
        );
        journeyFuelCells.forEach((fuelCell) => {
          if (count < inputValue) {
            count++;
            result.push([fuelCell, key, Number(payoutPerFuelCell).toFixed(3)]);
          }
        });
      });
      console.log({ result });
      return result;
    }

    return [];
  }, [totalData, inputValue, optimized]);

  const totalFuelCells = useMemo(() => {
    const nKeys = Object.keys(totalData).map(Number);
    let total = 0;
    nKeys.forEach((key) => {
      total += totalData[key].fuelCells.length;
    });
    console.log({ total });

    return total;
  }, [totalData]);

  // <============= UNWRAP FUNCTIONALITY ============>

  const [isApproved, setIsApproved] = useState(false);

  // Declaration of write Function for unwrap
  const { writeContractAsync: unwrap } = useWriteContract();

  // Declaration of write Function for Approval
  const { writeContractAsync: approve } = useWriteContract();
  // Check if Treasury SC is allowed to transfer Fuel Cells
  const { data: isApprovedData, isFetched: approvalFetched } = useReadContract({
    address: FuelCellContract.address as `0x${string}`,
    abi: FuelCellContract.abi,
    functionName: "isApprovedForAll",
    args: [`${account.address}`, `${TreasuryContract.address}`],
  });

  useEffect(() => {
    if (approvalFetched) {
      setIsApproved(isApprovedData as boolean);
    }
  }, [isApprovedData, approvalFetched]);

  const config = useConfig();

  const unwrapFn = async () => {
    if (inputValue > 0 && inputValue <= totalFuelCells) {
      let approved = isApproved;
      try {
        if (!isApproved) {
          const tx = await approve({
            address: FuelCellContract.address as `0x${string}`,
            abi: FuelCellContract.abi,
            functionName: "setApprovalForAll",
            args: [`${TreasuryContract.address}`, true],
          });
          const receipt = await waitForTransactionReceipt(config, { hash: tx });
          toast("Approved Success!");
          setIsApproved(true);
          approved = true;
        }
      } catch (err) {
        const message = "Error during approval! Please Try Again";
        toast.error(message);
        console.log(message, err);
      }
      try {
        const fuelCellsArgs: any = tableData.map((data) => {
          return { fuelCellId: data[0], journeyId: data[1] };
        });

        const tx = await unwrap({
          address: TreasuryContract.address as `0x${string}`,
          abi: TreasuryContract.abi,
          functionName: "unwrap",
          args: [fuelCellsArgs],
        });

        const receipt = await waitForTransactionReceipt(config, { hash: tx });
        fetchAllData();

        toast.success("Unwrap Successful");
      } catch (err) {
        const message = "Error during unwrap! Please Try Again";
        toast.error(message);
        console.log(message, err);
      }
    } else {
      toast.error("Check Fuel Cells input!");
    }
  };

  return { tableData, totalFuelCells, isApproved, unwrapFn, dataLoading };
};

export default useUnwrap;
