// Tools Website
"use client";

import { Gradients } from "@/lib/tailwindClassCombinators";
import { cn } from "@/lib/tailwindUtils";
import { ReactNode } from "react";

type TableProps = {
  header: React.ReactNode[];
  body: Array<
    Array<
      | Number
      | string
      | boolean
      | ReactNode
      | { value: Number | string | boolean; sticker: ReactNode }
    >
  >;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function Table({
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
                className={cn(Gradients.redToBlue, "p-[1px] sticky top-0 z-10")}
              >
                <div className={cn("bg-agblack", "px-[12px] py-[10px] h-full")}>
                  <div
                    className={cn(
                      "uppercase tracking-widest text-[14px] leading-[24px] font-sans",
                      "[&_svg]:text-[24px]",
                      "grid grid-flow-col gap-[8px]",
                      "text-nowrap",
                      "[&_img]:[min-w-[24px] min-h-[24px]] h-full text-agwhite",
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
          {body.length ? (
            body.map((row, i) => (
              <tr key={i} className="[scroll-snap-align]:[start]">
                {row.map((cell, j) => (
                  <td key={j} className="border-[1px] border-agpurple">
                    <div
                      className={cn(
                        "uppercase tracking-widest text-[14px] font-general-sans font-medium",
                        "[&_svg]:text-[24px]",
                        "relative flex gap-[8px]",
                        "px-[12px] py-[10px] text-agwhite",
                        bodyClassName,
                      )}
                    >
                      {cell !== null &&
                      typeof cell === "object" &&
                      "sticker" in cell &&
                      "value" in cell ? (
                        <>
                          {`${cell.value}`}
                          {cell.sticker}
                        </>
                      ) : (
                        `${cell}`
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="w-full h-full">
              <td colSpan={header.length} className="h-full">
                <div className=" flex justify-center items-center min-h-[200px] text-agwhite">
                  <p>No fuel cells selected</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
