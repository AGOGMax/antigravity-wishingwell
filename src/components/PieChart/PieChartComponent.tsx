import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

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

  return (
    <PieChart
      series={[
        {
          data: formattedData,
        },
      ]}
      width={width}
      height={height}
    />
  );
};

export default PieChartComponent;
