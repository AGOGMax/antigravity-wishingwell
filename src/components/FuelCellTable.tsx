"use client";

import GenericTable from "@/components/GenericTable/GenericTable";
import { useEffect, useMemo, useState } from "react";

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

  const data = useMemo(() => {
    if (!tableData?.journeySummary) return { body: [], totalRow: [] };

    const totals = {
      totalUserFuelCells: 0,
      totalDarkAmount: 0,
      totalUsdValue: 0,
      totalUserDarkAmount: 0,
      totalUserDarkUsdValue: 0,
      totalProjectedDark: 0,
      totalProjectedDarkUsdValue: 0,
    };

    const body = tableData.journeySummary.map((journey) => {
      const {
        journeyId,
        darkAmount,
        userFuelCells = 0,
        projectedDark,
      } = journey;

      const dark = parseFloat(darkAmount);
      const projected = parseFloat(projectedDark);
      const priceNum = parseFloat(price);
      const usdValue = dark * priceNum;
      const yourTotalDark = dark * userFuelCells;
      const userUsdValue = usdValue * userFuelCells;
      const projectedUsdValue = projected * priceNum;

      totals.totalUserFuelCells += userFuelCells;
      totals.totalDarkAmount += dark;
      totals.totalUsdValue += usdValue;
      totals.totalUserDarkAmount += yourTotalDark;
      totals.totalUserDarkUsdValue += userUsdValue;
      totals.totalProjectedDark += projected;
      totals.totalProjectedDarkUsdValue += projectedUsdValue;

      return [
        journeyId,
        userFuelCells,
        dark.toFixed(3),
        `$${usdValue.toFixed(3)}`,
        `$${yourTotalDark.toFixed(3)}`,
        `$${userUsdValue.toFixed(3)}`,
        projected.toFixed(3),
        `$${projectedUsdValue.toFixed(3)}`,
        "?",
        "?",
      ];
    });

    const {
      totalUserFuelCells,
      totalDarkAmount,
      totalUsdValue,
      totalUserDarkAmount,
      totalUserDarkUsdValue,
      totalProjectedDark,
      totalProjectedDarkUsdValue,
    } = totals;

    const totalRow = [
      "Total",
      totalUserFuelCells,
      totalDarkAmount.toFixed(3),
      `$${totalUsdValue.toFixed(3)}`,
      `$${totalUserDarkAmount.toFixed(3)}`,
      `$${totalUserDarkUsdValue.toFixed(3)}`,
      totalProjectedDark.toFixed(3),
      `$${totalProjectedDarkUsdValue.toFixed(3)}`,
      "?",
      "?",
    ];

    return { body, totalRow };
  }, [tableData, price]);

  const { body, totalRow } = data;

  const [isGreenArr, setIsGreenArr] = useState([] as Array<boolean>);

  useEffect(() => {
    const arr = tableData?.journeySummary?.map((journey) => {
      if (
        parseFloat(journey.darkAmount) *
          parseFloat(price ? price : "0") *
          (journey.userFuelCells ?? 0) >
        0
      ) {
        return true;
      }
      return false;
    });

    setIsGreenArr(arr);
  }, [tableData.journeySummary]);

  return (
    <GenericTable
      header={[
        "Journey",
        "Fuel Cells",
        "Dark Value",
        "USD Value",
        "Your Total Dark",
        "Total USD Value",
        `Projected Dark After J${currentJourneyId}`,
        `Projected USD After J${currentJourneyId}`,
        `Projected Dark After J${currentJourneyId + 1}`,
        `Projected USD After J${currentJourneyId + 1}`,
      ]}
      body={[...body, totalRow]}
      className="my-4"
      headerClassName="text-white"
      bodyClassName="text-gray-200"
      isGreenArr={isGreenArr}
    />
  );
}
