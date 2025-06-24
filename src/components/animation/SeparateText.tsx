"use client";

import { motion, MotionProps, Variants } from "framer-motion";

interface SeperateTextProps extends MotionProps {
  text: string;
  variants: {
    container: Variants;
    children: Variants;
  };
}

export default function SeparateText({
  text,
  variants,
  ...props
}: SeperateTextProps) {
  return (
    <motion.div {...props} variants={variants.container} className="flex">
      <span className="sr-only">{text}</span>
      {text.split("").map((letter, index) => (
        <motion.span
          key={index}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={variants.children}
          className="not-sr-only"
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

export class HoverTextAnimation {
  static Fading({ text }: { text: string }) {
    return (
      <SeparateText
        text={text}
        variants={{
          container: {
            initial: {},
            hover: {
              transition: { staggerChildren: 0.05 },
            },
          },
          children: {
            initial: { filter: "blur(0)" },
            hover: {
              filter: ["blur(0)", "blur(2px)", "blur(0)"],
            },
          },
        }}
      />
    );
  }

  static BounceReveal({ text }: { text: string }) {
    return (
      <SeparateText
        text={text}
        variants={{
          container: {
            initial: {},
            hover: {
              transition: { staggerChildren: 0.1 },
            },
          },
          children: {
            initial: { scale: 1, opacity: 1 },
            hover: {
              opacity: [0, 1],
              scale: [0, 1],
            },
          },
        }}
      />
    );
  }

  static RollingIn({ text }: { text: string }) {
    return (
      <SeparateText
        text={text}
        variants={{
          container: {
            initial: {},
            hover: {
              transition: { staggerChildren: 0.5 / text.length },
            },
          },
          children: {
            initial: { opacity: 1, y: 0 },
            hover: { opacity: [1, 0, 0, 0, 1], y: [0, 20, -20, 0] },
          },
        }}
      />
    );
  }
}

export class AutomaticTextAnimation {
  static Typing({
    text,
    loopDuration = 1,
  }: {
    text: string;
    loopDuration?: number;
  }) {
    return (
      <SeparateText
        text={text}
        initial="initial"
        animate="hover"
        variants={{
          container: {
            initial: {},
            hover: {
              transition: { staggerChildren: 0.1, repeat: Infinity },
            },
          },
          children: {
            initial: { opacity: 0 },
            hover: {
              opacity: 1,
              transition: {
                duration: loopDuration,
                repeat: Infinity,
              },
            },
          },
        }}
      />
    );
  }

  static TypingWithDelay({
    text,
    loopDuration = 1,
  }: {
    text: string;
    loopDuration?: number;
  }) {
    return (
      <SeparateText
        text={text}
        initial="initial"
        animate="hover"
        variants={{
          container: {
            initial: {},
            hover: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5,
                repeat: Infinity,
              },
            },
          },
          children: {
            initial: { opacity: 0 },
            hover: {
              opacity: 1,
              transition: {
                duration: loopDuration,
                repeat: Infinity,
              },
            },
          },
        }}
      />
    );
  }

  static TypingWithRandomDelay({
    text,
    loopDuration,
  }: {
    text: string;
    loopDuration?: number;
  }) {
    return (
      <SeparateText
        text={text}
        initial="initial"
        animate="hover"
        variants={{
          container: {
            initial: {},
            hover: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5,
              },
            },
          },
          children: {
            initial: { opacity: 0 },
            hover: {
              opacity: 1,
              transition: {
                duration: loopDuration,
                repeat: Infinity,
              },
            },
          },
        }}
      />
    );
  }

  static Loading() {
    return (
      <SeparateText
        text={"..."}
        initial="initial"
        animate="hover"
        variants={{
          container: {
            initial: {},
            hover: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5,
                repeat: Infinity,
              },
            },
          },
          children: {
            initial: { y: 1 },
            hover: {
              y: [0, "-0.25em", 0],
              transition: {
                duration: 0.33,
                repeat: Infinity,
              },
            },
          },
        }}
      />
    );
  }
}
