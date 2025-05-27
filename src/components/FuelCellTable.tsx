"use client";

import GenericTable from "@/components/GenericTable/GenericTable";

interface tableData {
  tableData: {
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
  price: string;
}

export default function FuelCellTable({ tableData, price }: tableData) {
  const currentJourneyId = tableData?.journeySummary?.length;
  const body = tableData?.journeySummary?.map((journey) => [
    journey.journeyId,
    journey.userFuelCells ?? 0,
    journey.darkAmount,
    `$${(parseFloat(journey.darkAmount) * parseFloat(price ? price : "0")).toFixed(3)}`,
    journey.projectedDark,
    `$${(parseFloat(journey.projectedDark) * parseFloat(price ? price : "0")).toFixed(3)}`,
    "?",
    "?",
  ]);

  return (
    <GenericTable
      header={[
        "Journey #",
        "Fuel Cells",
        "Total Dark",
        "USD Value",
        `Projected Dark After J${currentJourneyId}`,
        `Projected USD After J${currentJourneyId}`,
        `Projected Dark After J${currentJourneyId + 1}`,
        `Projected USD After J${currentJourneyId + 1}`,
      ]}
      body={body}
      className="my-4"
      headerClassName="text-white"
      bodyClassName="text-gray-200"
    />
  );
}
