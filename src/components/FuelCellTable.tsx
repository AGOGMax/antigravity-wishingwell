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
    if (!tableData?.journeySummary) {
      return {
        body: [],
        totalRow: {
          cells: [],
          blackBackground: true,
        },
      };
    }

    const totals = {
      totalUserFuelCells: 0,
      // totalDarkAmount: 0,
      // totalUsdValue: 0,
      totalUserDarkAmount: 0,
      totalUserDarkUsdValue: 0,
      // totalProjectedDark: 0,
      // totalProjectedDarkUsdValue: 0,
      totalUserProjectedDark: 0,
      totalUserProjectedUsdValue: 0,
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
      const userProjectedDark = projected * userFuelCells;
      const userProjectedUsd = projectedUsdValue * userFuelCells;
      console.log("user usd value", priceNum);

      totals.totalUserFuelCells += userFuelCells;
      // totals.totalDarkAmount += dark;
      // totals.totalUsdValue += usdValue;
      totals.totalUserDarkAmount += yourTotalDark;
      totals.totalUserDarkUsdValue += userUsdValue;
      // totals.totalProjectedDark += projected;
      // totals.totalProjectedDarkUsdValue += projectedUsdValue;
      totals.totalUserProjectedDark += userProjectedDark;
      totals.totalUserProjectedUsdValue += userProjectedUsd;

      return {
        cells: [
          `${journeyId} (${Number(dark.toFixed(3)).toLocaleString()})`,
          userFuelCells.toLocaleString(),
          // `$${Number(usdValue.toFixed(3)).toLocaleString()}`,
          `${Number(yourTotalDark.toFixed(3)).toLocaleString()}`,
          `$${Number(userUsdValue.toFixed(3)).toLocaleString()}`,
          // Number(projected.toFixed(3)).toLocaleString(),
          // `$${Number(projectedUsdValue.toFixed(3)).toLocaleString()}`,
          Number(userProjectedDark.toFixed(3)).toLocaleString(),
          `$${Number(userProjectedUsd.toFixed(3)).toLocaleString()}`,
          // "?",
          // "?",
        ],
      };
    });

    const {
      totalUserFuelCells,
      // totalDarkAmount,
      // totalUsdValue,
      totalUserDarkAmount,
      totalUserDarkUsdValue,
      // totalProjectedDark,
      // totalProjectedDarkUsdValue,
      totalUserProjectedDark,
      totalUserProjectedUsdValue,
    } = totals;

    const totalRow = {
      cells: [
        "Total",
        totalUserFuelCells.toLocaleString(),
        // Number(totalDarkAmount.toFixed(3)).toLocaleString(),
        // `$${Number(totalUsdValue.toFixed(3)).toLocaleString()}`,
        `${Number(totalUserDarkAmount.toFixed(3)).toLocaleString()}`,
        `$${Number(totalUserDarkUsdValue.toFixed(3)).toLocaleString()}`,
        // Number(totalProjectedDark.toFixed(3)).toLocaleString(),
        // `$${Number(totalProjectedDarkUsdValue.toFixed(3)).toLocaleString()}`,
        Number(totalUserProjectedDark.toFixed(3)).toLocaleString(),
        `$${Number(totalUserProjectedUsdValue.toFixed(3)).toLocaleString()}`,
        // "?",
        // "?",
      ],
      blackBackground: true,
    };

    return { body, totalRow };
  }, [tableData, price]);

  const { body, totalRow } = data;

  return (
    <GenericTable
      header={[
        "Journey (And Dark Matter)",
        "Fuel Cells",
        // "Dark Value",
        // "USD Value",
        "Your Total Dark",
        "Total USD Value",
        // `Projected Dark After J${currentJourneyId}`,
        // `Projected USD After J${currentJourneyId}`,
        `Total Projected Dark After J${currentJourneyId}`,
        `Total Projected  USD After J${currentJourneyId}`,
        // `Projected Dark After J${currentJourneyId + 1}`,
        // `Projected USD After J${currentJourneyId + 1}`,
      ]}
      body={[...body, totalRow]}
      className="my-4"
      headerClassName="text-white"
      bodyClassName="text-gray-200"
      highlightPositiveInColumns={[3, 5, 7]}
    />
  );
}
