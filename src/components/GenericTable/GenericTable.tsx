"use client";

import { Gradients } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import { ReactNode } from "react";

type TableProps = {
  header: React.ReactNode[];
  body: Array<Array<number | string | boolean | ReactNode>>;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function GenericTable({
  header,
  body,
  className,
  headerClassName,
  bodyClassName,
}: TableProps) {
  return (
    <div
      className={cn(
        "max-h-[300px] max-w-[80vw] w-full lg:w-fit overflow-y-auto [scroll-snap-type]:[y_mandatory] rounded-[6px] md:mr-[8px]",
        className,
      )}
    >
      <table className="w-full">
        <thead>
          <tr>
            {header.map((head, i) => (
              <th
                key={i}
                className={cn(Gradients.redToBlue, `p-[1px] sticky top-0 z-10`)}
              >
                <div className={cn("bg-agblack", "px-[12px] py-[10px] h-full")}>
                  <div
                    className={cn(
                      Gradients.whiteGradientText,
                      "uppercase tracking-widest text-[14px] leading-[24px] font-sans",
                      "[&_svg]:text-[24px] text-center",
                      "grid grid-flow-col gap-[8px]",
                      "[&_img]:[min-w-[24px] min-h-[24px]] h-full flex items-center justify-center",
                      headerClassName,
                    )}
                  >
                    {head}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(Gradients.tableBlue, "relative")}>
          {body?.length ? (
            body.map((row, i) => (
              <tr key={i} className="[scroll-snap-align]:[start]">
                {row.map((cell, j) => (
                  <td key={j} className="border-[1px] border-agpurple">
                    <div
                      className={cn(
                        "uppercase tracking-widest text-[14px] font-general-sans font-medium",
                        "[&_svg]:text-[24px]",
                        "relative flex gap-[8px] items-centerr justify-center",
                        "px-[12px] py-[10px]",
                        bodyClassName,
                      )}
                    >
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="w-full h-full">
              <td colSpan={header?.length} className="h-full">
                <div className=" flex justify-center items-center min-h-[200px]">
                  <p>No Data Found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
