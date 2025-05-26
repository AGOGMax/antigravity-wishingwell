"use client";

import axios from "axios";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import FuelCellTable from "@/components/FuelCellTable";
import { LeagueMapping } from "./LeagueMapping";
import { cn } from "@/lib/tailwindUtils";
import PieChartComponent from "@/components/PieChart/PieChartComponent";

type tableDataType = {
  journeySummary: Array<{
    journeyId: number;
    totalFuelCells: number;
    darkAmount: string;
    darkPrice: string;
    excludedFuelCellCount: number;
    projectedDark: string;
    userFuelCells: number;
  }>;
  league: {
    currentLeague: string;
    fuelCellsToNext: number;
    nextLeague: string;
  };
};

export default function MyFuelCells() {
  const account = useAccount();
  const apiEndpoint = account.isConnected
    ? `https://api.agproject.xyz/api/fuel-cells/summary?walletAddress=${account.address}`
    : "https://api.agproject.xyz/api/fuel-cells/summary";
  async function getFuelCellData() {
    try {
      const response = await axios.get(`${apiEndpoint}`);
      const fuelCelldata = response?.data;
      return fuelCelldata;
    } catch (error) {
      console.error("Error while fetching fuel cell data: ", error);
    }
  }

  const [tableData, setTableData] = useState({} as tableDataType);
  const currentJourneyId = tableData?.journeySummary?.length;
  const currentLeague = tableData?.league?.currentLeague;
  const currentEmoji =
    LeagueMapping[currentLeague as keyof typeof LeagueMapping]?.emoji;

  const [selected, setSelected] = useState("alltime");
  const [price, setPrice] = useState(
    process.env.NEXT_PUBLIC_DARK_ALL_TIME_HIGH_PRICE,
  );
  console.log("price env", price);

  useEffect(() => {
    async function fetchData() {
      const data = await getFuelCellData();
      setTableData(data);
      console.log("fuelcelldata", data);
    }

    fetchData();
  }, [apiEndpoint]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPrice(String(event.target.value));
  }

  const data = [
    { value: 49490, label: "Journey 1", color: "#00FF94" },
    { value: 61197, label: "Journey 2", color: "#00E0FF" },
    { value: 106679, label: "Journey 3", color: "#4B56FF" },
    { value: 121036, label: "Journey 4", color: "#FF2D55" },
  ];

  return (
    <div className="text-agwhite relative flex flex-col justify-start items-center w-full gap-[10px] pt-[100px] lg:pt-[200px] z-0">
      <div className="flex flex-col gap-[10px] items-center justify-center m-0">
        {account.isConnected ? (
          <>
            <span className="text-[28px] ">MY NFTS</span>
            <span className="text-[32px] font-bold text-agyellow">
              {currentEmoji} {currentLeague} {currentEmoji}
            </span>
            <span className="text-[24px]">
              {tableData?.league?.fuelCellsToNext} more NFTS to reach{" "}
              {tableData?.league?.nextLeague}!!!
            </span>
          </>
        ) : (
          <span className="text-[32px] font-bold">
            Connect Your Wallet To See Your Fuel Cell Data!
          </span>
        )}
      </div>
      <div className="flex gap-[10px] items-center justify-center">
        <button
          className={cn(
            "border-[2px] rounded-[8px] px-5 py-2 text-agblack",
            selected === "current"
              ? "bg-[#FEE4A9] border-[#FF9C0D]"
              : "bg-[#92E4FC] border-[#10739D]",
          )}
          onClick={() => (
            setSelected("current"),
            setPrice(tableData?.journeySummary[currentJourneyId - 1]?.darkPrice)
          )}
        >
          Current Price
        </button>
        <button
          className={cn(
            "border-[2px] rounded-[8px] px-5 py-2 text-agblack",
            selected === "alltime"
              ? "bg-[#FEE4A9] border-[#FF9C0D]"
              : "bg-[#92E4FC] border-[#10739D]",
          )}
          onClick={() => (setSelected("alltime"), setPrice("135"))}
        >
          All-Time High
        </button>
        <button
          className={cn(
            "border-[2px] rounded-[8px] px-5 py-2 text-agblack",
            selected === "moonmath"
              ? "bg-[#FEE4A9] border-[#FF9C0D]"
              : "bg-[#92E4FC] border-[#10739D]",
          )}
          onClick={() => setSelected("moonmath")}
        >
          Moon Math Project
        </button>
        {selected === "moonmath" && (
          <input
            type="number"
            name="price"
            value={price?.toString()}
            placeholder="Enter a price"
            onChange={handleChange}
            className="bg-black text-white placeholder-white border-[2px] border-[#FF9C0D] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9C0D] transition"
          />
        )}
      </div>
      <FuelCellTable tableData={tableData} price={price || "0"} />
      <div className="flex justify-between bg-black border border-[#3d3d3d] rounded-2xl p-8 mb-8 w-[70%] text-white">
        <div className="flex flex-col gap-2 w-1/2">
          <h2 className="text-2xl font-bold text-white mb-4">
            FUEL CELLS SUPPLY
          </h2>

          <div className="flex justify-between border-b border-[#3d3d3d] py-1">
            <span className="text-sm text-[#f0f0f0]">Total Supply</span>
            <span className="text-sm font-semibold text-[#FFA500]">
              338,402
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-sm text-[#ccc]">Journey #1</span>
            <span className="text-sm font-semibold text-[#00FF94]">49,490</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-[#ccc]">Journey #2</span>
            <span className="text-sm font-semibold text-[#00E0FF]">61,197</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-[#ccc]">Journey #3</span>
            <span className="text-sm font-semibold text-[#4B56FF]">
              106,679
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-[#ccc]">Journey #4</span>
            <span className="text-sm font-semibold text-[#FF2D55]">
              121,036
            </span>
          </div>
        </div>

        <div className="w-1/2 flex justify-center items-center">
          <PieChartComponent data={data} width={300} height={250} />
        </div>
      </div>
    </div>
  );
}
