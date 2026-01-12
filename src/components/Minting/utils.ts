import { Dispatch } from "react";
import { MAX_INPUT, MINTING_STATES } from "./MintingHero";
import { MintError, STEPPERS } from "./types";
import { IMAGEKIT_ICONS } from "@/assets/imageKit";

// This is the "Re-export" that fixes the build
export { MAX_INPUT }; 

export const setCurrentMintState = (
// ... rest of your code
  currentState: keyof typeof MINTING_STATES,
  setMintState: Dispatch<React.SetStateAction<STEPPERS>>,
  txLoading: boolean
) => {
  switch (currentState) {
    case MINTING_STATES.INITIAL:
      setMintState({
        Approve: "pending",
        Mint: "pending",
        Success: "pending",
      });
      return;

    case MINTING_STATES.APPROVAL:
      setMintState({
        Approve: "progress",
        Mint: "pending",
        Success: "pending",
      });
      return;

    case MINTING_STATES.MINT:
      setMintState({
        Approve: "success",
        Mint: txLoading ? "progress" : "pending",
        Success: "pending",
      });
      return;

    case MINTING_STATES.RECEIPT:
      setMintState({
        Approve: "success",
        Mint: "success",
        Success: "progress",
      });
      return;

    case MINTING_STATES.SUCCESS:
      setMintState({
        Approve: "success",
        Mint: "success",
        Success: "success",
      });
      return;
  }
};

export const getButtonCofigs = (
  darkInput: number,
  darkBalance: number,
  currentState: keyof typeof MINTING_STATES,
  txLoading: boolean,
  txError: MintError,
  handleNFTNotificationReveal: () => void
) => {
  if (txError.is) {
    return {
      text: "Retry",
      loading: false,
      disabled: false,
      icon: IMAGEKIT_ICONS.ERROR,
      variants: {
        hover: {
          animationName: "wiggle",
          animationDuration: "1s",
          animationFillMode: "forwards",
          animationTimingFunction: "linear",
        },
      },
    };
  }
  if (darkInput > MAX_INPUT) {
    return {
      text: "Minting Limit Exceeded",
      loading: false,
      disabled: true,
      icon: IMAGEKIT_ICONS.ERROR,
      variants: {
        hover: {
          animationName: "wiggle",
          animationDuration: "1s",
          animationFillMode: "forwards",
          animationTimingFunction: "linear",
        },
      },
    };
  }
  if (!txLoading && Number(darkInput) > darkBalance) {
    return {
      text: "Insufficient $DARK balance",
      loading: false,
      disabled: true,
      icon: IMAGEKIT_ICONS.ERROR,
      variants: {
        hover: {
          animationName: "wiggle",
          animationDuration: "1s",
          animationFillMode: "forwards",
          animationTimingFunction: "linear",
        },
      },
    };
  }
  switch (currentState) {
    case MINTING_STATES.INITIAL:
      return {
        text: "Approve Contract",
        loading: false,
        disabled: darkInput < 1,
        icon: IMAGEKIT_ICONS.TICK,
        variants: {
          hover: {
            rotate: 360,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };
    case MINTING_STATES.APPROVAL:
      return {
        text: "Approving",
        loading: true,
        disabled: true,
        icon: IMAGEKIT_ICONS.CUBE,
        variants: {
          hover: {
            scale: 1.2,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };
    case MINTING_STATES.MINT:
      return {
        text: txLoading ? "Minting" : "Mint Now",
        loading: txLoading,
        disabled: txLoading || darkInput < 1,
        icon: IMAGEKIT_ICONS.CUBE,
        variants: {
          hover: {
            scale: 1.2,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };

    case MINTING_STATES.RECEIPT:
      return {
        text: "BUILDING FUEL CELLS",
        loading: true,
        disabled: true,
        icon: IMAGEKIT_ICONS.CUBE,
        variants: {
          hover: {
            scale: 1.2,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };

    case MINTING_STATES.SUCCESS: {
      handleNFTNotificationReveal();
      return {
        text: "Minted Fuel Cells!",
        loading: false,
        disabled: false,
        icon: IMAGEKIT_ICONS.CUBE,
        variants: {
          hover: {
            scale: 1.2,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };
    }
    default:
      return {
        text: "Approve Contract",
        loading: false,
        disabled: darkInput < 1,
        icon: IMAGEKIT_ICONS.CUBE,
        variants: {
          hover: {
            scale: 1.2,
            transition: {
              duration: 1,
              type: "spring",
            },
          },
        },
      };
  }
};

export const getCurrentBuyAnimation = (highlight: boolean) => {
  return {
    darkness: {
      filter: highlight ? "brightness(1.2) contrast(1.1)" : "brightness(1) contrast(1)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };
};
