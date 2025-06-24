import { AutomaticTextAnimation } from "@/components/animation/SeparateText";
import { AnimatePresence, motion } from "framer-motion";
import { CSSProperties, useEffect, useRef, useState } from "react";

export type states = "pending" | "progress" | "success" | "failed";

export type STEPPERS = {
  big: states;
  bigger: states;
  biggest: states;
};

function SVGChevron({
  direction,
  color,
  delay,
  state,
}: {
  direction: "up" | "down" | "left" | "right";
  color: string;
  delay: number;
  state?: states;
}) {
  const rotate = {
    up: 90,
    down: 270,
    left: 180,
    right: 0,
  };
  const DEFAULT_SCALE = 0.659411764706;
  return (
    <motion.div
      animate={{
        scale:
          state === "progress"
            ? [DEFAULT_SCALE, DEFAULT_SCALE * 1.2, DEFAULT_SCALE]
            : DEFAULT_SCALE,
        x: state === "progress" ? "10%" : "0%",
      }}
      initial={{ scale: DEFAULT_SCALE, x: "0%" }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        delay: (delay || 0) * 0.1,
      }}
      style={{
        transform: `rotate(${rotate[direction]}deg)`,
        margin: "0 -10%",
      }}
      className="relative z-0"
    >
      <svg
        width="22"
        height="17"
        viewBox="0 0 22 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.39453 0.682617H9.56884L18.1927 8.19256L9.56884 15.7025H4.39453L13.0184 8.19256L4.39453 0.682617Z"
          fill={color}
          // fill-opacity="0.66"
        />
      </svg>
      {state === "progress" && (
        <svg
          width="22"
          height="17"
          viewBox="0 0 22 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 left-0 blur-sm z-[-1]"
        >
          <path
            d="M4.39453 0.682617H9.56884L18.1927 8.19256L9.56884 15.7025H4.39453L13.0184 8.19256L4.39453 0.682617Z"
            fill={color}
            // fill-opacity="0.66"
          />
        </svg>
      )}
    </motion.div>
  );
}

const statesColors: { [key in states]: string } = {
  pending: "#FEFFFFA8",
  progress: "#F5EB00",
  success: "#00B031",
  failed: "red",
};

function Lines({ state, style }: { state: states; style?: CSSProperties }) {
  return (
    <div style={style} className="flex justify-center items-center w-[58.64px]">
      {/* <svg
            width="22"
            height="17"
            viewBox="0 0 22 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.39453 0.682617H9.56884L18.1927 8.19256L9.56884 15.7025H4.39453L13.0184 8.19256L4.39453 0.682617Z"
              fill={statesColors[state]}
              // fill-opacity="0.66"
            />
          </svg> */}
      <SVGChevron
        direction="right"
        color={statesColors[state]}
        delay={0}
        state={state}
      />
      <SVGChevron
        direction="right"
        color={statesColors[state]}
        delay={1}
        state={state}
      />
      <SVGChevron
        direction="right"
        color={statesColors[state]}
        delay={2}
        state={state}
      />
      <SVGChevron
        direction="right"
        color={statesColors[state]}
        delay={3}
        state={state}
      />
      <div className="scale-[1.5] ml-[-2.5%] origin-center">
        <SVGChevron
          direction="right"
          color={statesColors[state]}
          delay={4}
          state={state}
        />
      </div>
    </div>
  );
}

const statesCircleCSS: { [key in states]: CSSProperties } = {
  pending: {
    boxShadow: "inset 0px 0px 0px 2px #FEFFFFA8",
  },
  progress: {
    backgroundColor: "#F5EB00",
    boxShadow: "none",
    width: "32px",
    height: "32px",
  },
  success: {
    backgroundColor: "#00B031",
    width: "32px",
    height: "32px",
    boxShadow: "none",
  },
  failed: {
    width: "32px",
    height: "32px",
    backgroundColor: "red",
    boxShadow: "none",
  },
};

export default function ProgressingStates({
  states: previousStates,
  journeyId,
}: {
  states: { [key in string]: states };
  journeyId: string;
}) {
  const [circleCenterPositions, setCircleCenterPositions] = useState<string[]>(
    [],
  );
  const [states, setStates] = useState<{
    [key in string]: states;
  }>({
    big: "progress",
    bigger: "pending",
    biggest: "pending",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previousStates) {
      setStates(previousStates);
    }
  }, [previousStates]);

  useEffect(() => {
    if (window) {
      const resize_ob = new ResizeObserver(() => {
        setCircleCenterPositions(
          Object.keys(states).map((_, idx) => {
            const circle = document.getElementById(`circle-${idx}`);
            const left = circle?.offsetLeft || 0;
            const width = circle?.offsetWidth || 0;
            return left + width / 2 + "px";
          }),
        );
      });

      resize_ob.observe(containerRef.current as Element);

      window.onresize = () => {
        setCircleCenterPositions(
          Object.keys(states).map((_, idx) => {
            const circle = document.getElementById(`circle-${idx}`);
            const left = circle?.offsetLeft || 0;
            const width = circle?.offsetWidth || 0;
            return left + width / 2 + "px";
          }),
        );
      };
      setCircleCenterPositions(
        Object.keys(states).map((_, idx) => {
          const circle = document.getElementById(`circle-${idx}`);
          const left = circle?.offsetLeft || 0;
          const width = circle?.offsetWidth || 0;
          return left + width / 2 + "px";
        }),
      );
    }
  }, [states]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col place-items-center gap-y-[8px] text-[16px] leading-[19.84px] tracking-widest font-extrabold font-sans uppercase w-full"
    >
      {journeyId !== "undefined" ? (
        <h6 className="text-center">
          {journeyId !== "undefined" ? (
            <span className="text-agyellow">Journey {journeyId}</span>
          ) : (
            <div className="flex justify-center text-agyellow">
              <AutomaticTextAnimation.Loading />
            </div>
          )}
        </h6>
      ) : (
        <h6 className="text-center">No lottery announced</h6>
      )}

      <div className="flex justify-between items-center w-full p-[8px]">
        <AnimatePresence>
          {typeof states === "object" &&
            Object.keys(states).map((userState: string, idx: number) => (
              <>
                <motion.div
                  layout
                  animate={{
                    scale: 1,
                  }}
                  initial={{ scale: 0 }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    bounce: 0.25,
                  }}
                  key={3 * idx}
                  style={{
                    // gridColumn: `${idx * 2 + 1}`,
                    // gridRow: "1",
                    marginTop: states[userState] !== "pending" ? "0" : "8px",
                    marginBottom: states[userState] !== "pending" ? "0" : "8px",
                    width: "16px",
                    height: "16px",
                    ...statesCircleCSS[states[userState]],
                  }}
                  id={`circle-${idx}`}
                  className="relative w-[16px] h-[16px] rounded-full py-[8px] mx-auto transition-all duration-300 z-0"
                >
                  {/* {states[userState] === "success" && <RandomSparkels />} */}
                  {states[userState] === "progress" && (
                    <motion.div
                      animate={{
                        scale: 1.5,
                        opacity: [0, 0.5, 0],
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 w-full h-full bg-agwhite rounded-full origin-center z-1"
                    ></motion.div>
                  )}
                </motion.div>
                {
                  // if not last state, show lines
                  idx !== Object.keys(states).length - 1 && (
                    <Lines
                      state={
                        states[
                          // get the previous state
                          Object.keys(states)[idx + 1]
                        ]
                      }
                      style={
                        {
                          // gridColumn: `${idx * 2 + 2}`,
                          // gridRow: "1",
                        }
                      }
                    />
                  )
                }
              </>
            ))}
        </AnimatePresence>
      </div>

      <div className="w-full h-[1em]">
        {typeof states === "object" &&
          Object.keys(states).map((userState: string, idx: number) => (
            <motion.p
              key={1 * idx}
              style={{
                color: statesColors[states[userState]],
                gridColumn: `${idx * 2 + 1}`,
                gridRow: "2",
                position: "absolute",
                left: circleCenterPositions[idx],
                transform: "translate(-50%, 0)",
              }}
              className="text-center"
            >
              {userState}
            </motion.p>
          ))}
      </div>
    </div>
  );
}
