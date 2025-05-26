import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { DefaultizedPieValueType } from "@mui/x-charts/models";

type PieData = {
  value: number;
  label: string;
};

type PieChartComponentProps = {
  data: PieData[];
  width?: number;
  height?: number;
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const formattedData = data.map((item, index) => ({
    id: index,
    ...item,
  }));

  const getArcLabel = (params: DefaultizedPieValueType) => {
    const percent = params.value / 338402;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <PieChart
      series={[
        {
          arcLabel: getArcLabel,
          arcLabelMinAngle: 35,
          highlightScope: { fade: "global", highlight: "item" },
          faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
          data: formattedData,
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: "black",
          fontSize: 14,
        },
      }}
      width={width}
      height={height}
    />
  );
};

export default PieChartComponent;
