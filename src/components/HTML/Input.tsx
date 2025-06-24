// Tools Website

"use client";

import { cn } from "@/lib/tailwindUtils";
import { FC, forwardRef, Ref, useRef, useState } from "react";
import { motion, MotionProps } from "framer-motion";
import { fontSizeClamping } from "../../lib/uiUtils";
import _ from "lodash";

// Define the props for the Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  integer?: boolean;
  error?: boolean;
  inputValue: number;
  setInputValue: (arg0: number) => void;
}

// Input component with forwardRef to allow ref forwarding
const Input: FC<InputProps & MotionProps> = forwardRef(
  (props: InputProps & MotionProps, ref: Ref<HTMLInputElement>) => {
    const {
      className,
      integer,
      error,
      inputValue,
      setInputValue,
      ...inputProps
    } = props;

    const classOfElements = cn(
      "text-agwhite text-[32px] leading-[32px] font-sans",
      "bg-[transparent]",
      "w-full",
      "outline-none",
      error && "text-brred", // Apply error class if error prop is true
      className, // Merge the passed className with the default classes
    );

    const parentRef = useRef<HTMLDivElement>(null);
    const [inputInFocus, setInputInFocus] = useState<boolean>(true);
    const integerPartOfValue = inputValue.toString().includes(".")
      ? inputValue.toString().split(".")[0]
      : inputValue;

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const inputValue = integer
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;
      const numericValue = integer ? parseInt(inputValue) : Number(inputValue);

      if (inputValue === "" || isNaN(numericValue)) {
        e.target.value = "0";
        setInputValue(0);
      } else {
        e.target.value = numericValue.toString();
        setInputValue(e.target.valueAsNumber);
      }
    }

    function handleInputFocus() {
      setInputInFocus(true);
      (parentRef.current?.children[0] as HTMLInputElement).focus();
    }

    return (
      <div
        ref={parentRef}
        className="relative w-full h-fit cursor-pointer overflow-hidden"
        onClick={handleInputFocus}
      >
        <motion.input
          ref={ref}
          type="number"
          className={classOfElements}
          defaultValue={0}
          style={{
            fontSize: fontSizeClamping(
              16,
              32,
              String(inputValue).length,
              String(integerPartOfValue).length > 3 ? 6 : 8,
            ),
            ...inputProps.style,
          }}
          animate={{
            transform: inputInFocus
              ? "translateY(0%)"
              : String(inputValue).length > 3
                ? "translateY(-100%)"
                : "translateY(0%)",
          }}
          onChange={handleInputChange}
          onBlur={() => setInputInFocus(false)}
          autoFocus
          {...inputProps} // Spread the remaining input props
        />
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            userSelect: "none",
            fontSize: fontSizeClamping(
              16,
              32,
              String(inputValue).length,
              String(integerPartOfValue).length > 3 ? 5 : 8,
            ),
            ...inputProps.style,
          }}
          animate={{
            transform: inputInFocus
              ? "translateY(100%)"
              : String(inputValue).length > 3
                ? "translateY(0%)"
                : "translateY(100%)",
          }}
          className={classOfElements}
        >
          {String(inputValue).includes(".")
            ? inputValue.toLocaleString("en-US", {
                maximumFractionDigits: String(inputValue).split(".")[1].length,
              })
            : inputValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </motion.div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
