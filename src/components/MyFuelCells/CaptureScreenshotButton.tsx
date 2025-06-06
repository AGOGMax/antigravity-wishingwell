import {
  PiCameraDuotone,
  PiCopyFill,
  PiDownloadFill,
  PiXCircleDuotone,
} from "react-icons/pi";
import { useState } from "react";
import { cn } from "@/lib/tailwindUtils";
import html2canvas from "html2canvas";
import toast, { ToastOptions } from "react-hot-toast";

const COPY_TOAST_SETTINGS: ToastOptions = {
  duration: 5000,
  position: "top-center",
  style: {
    fontSize: "16px",
    width: "auto",
    maxWidth: "50vw",
    padding: "12px 16px",
  },
  icon: <PiCopyFill />,
};

const DOWNLOAD_TOAST_SETTINGS: ToastOptions = {
  duration: 5000,
  position: "top-center",
  style: {
    fontSize: "16px",
    width: "auto",
    maxWidth: "50vw",
    padding: "12px 16px",
  },
  icon: <PiDownloadFill />,
};

const ERROR_TOAST_SETTINGS: ToastOptions = {
  duration: 5000,
  position: "top-center",
  style: {
    fontSize: "16px",
    width: "auto",
    maxWidth: "50vw",
    padding: "12px 16px",
  },
  icon: <PiXCircleDuotone />,
};

export const copyScreenshot = async (
  element: HTMLElement | null,
): Promise<boolean> => {
  if (!element) {
    toast("Element not found.", ERROR_TOAST_SETTINGS);
    return false;
  }

  try {
    await document.fonts.ready;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#000000",
      logging: false,
      scrollY: -window.scrollY,
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast("Failed to create image.", ERROR_TOAST_SETTINGS);
          return resolve(false);
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast("Screenshot copied to clipboard!", COPY_TOAST_SETTINGS);
          resolve(true);
        } catch (err) {
          console.error("Clipboard write failed:", err);
          toast("Copy failed. Try using Chrome or Edge.", ERROR_TOAST_SETTINGS);
          resolve(false);
        }
      }, "image/png");
    });
  } catch (err) {
    console.error("Screenshot capture failed:", err);
    toast("Screenshot failed.", ERROR_TOAST_SETTINGS);
    return false;
  }
};

export const downloadScreenshot = async (
  element: HTMLElement | null,
  filename = "screenshot.png",
): Promise<boolean> => {
  if (!element) {
    toast("Element not found.", ERROR_TOAST_SETTINGS);
    return false;
  }

  try {
    await document.fonts.ready;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#000000",
      logging: false,
      scrollY: -window.scrollY,
    });

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    link.click();

    toast("Screenshot downloaded!", DOWNLOAD_TOAST_SETTINGS);
    return true;
  } catch (err) {
    console.error("Screenshot download failed:", err);
    toast("Screenshot download failed.", ERROR_TOAST_SETTINGS);
    return false;
  }
};

interface captureSSButton {
  screenshotRef: HTMLElement | null;
  buttonText: string;
  className?: string;
}
export default function CaptureScreenshotButton({
  screenshotRef,
  buttonText,
  className,
}: captureSSButton) {
  const handleCopy = async () => {
    await copyScreenshot(screenshotRef);
  };

  const handleDownload = async () => {
    await downloadScreenshot(screenshotRef);
  };

  const [showPopOver, setShowPopOver] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowPopOver(!showPopOver);
          console.log("popover", showPopOver);
        }}
        className={cn(
          "flex items-center gap-2 border-[2px] border-agwhite rounded-[8px] px-4 py-2 mx-auto",
          className,
        )}
      >
        <PiCameraDuotone className="text-agwhite text-lg" />{" "}
        <span className="text-agwhite leading-none">{buttonText}</span>
      </button>

      {showPopOver ? (
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 flex flex-col items-center bg-[#121212] border border-white rounded-md shadow-lg px-2 py-2 space-y-2 z-50 min-w-[180px] w-max text-sm">
          <button
            onClick={() => {
              handleCopy(), setShowPopOver(false);
            }}
            className="w-max flex items-center justify-center gap-2 text-left text-white hover:text-black hover:bg-white rounded px-2 py-1 transition-colors duration-150"
          >
            <PiCopyFill /> <span>Copy to Clipboard</span>
          </button>
          <button
            onClick={() => {
              handleDownload(), setShowPopOver(false);
            }}
            className="w-max flex items-center justify-center gap-2 text-left text-white hover:text-black hover:bg-white rounded px-2 py-1 transition-colors duration-150"
          >
            <PiDownloadFill /> <span>Download as PNG</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
