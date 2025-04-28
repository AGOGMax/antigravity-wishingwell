import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Cabinet Grotesk", "sans-serif"],
      "general-sans": ["General Sans", "sans-serif"],
    },
    extend: {
      backgroundPosition: {
        "team-bg": "center top",
      },
      objectPosition: {
        "value-bg": "center 20%",
        "landing-bg": "70% top",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        agblack: "#030404",
        brblue: "#3C00DC",
        brred: "#FF5001",
        blue: "#3C00DC",
        agyellow: "#F5EB00",
        agwhite: "#FEFFFF",
        bgblue: "#3C00DC54",
        agorange: "#FF5001",
        successgreen: "#00B031",
        aggray: "#888888",
      },
      boxShadow: {
        button: "0 6px 0 0 #030404",
      },
      dropShadow: {
        pressed: "0 0 0 4px linear-gradient(#e66465, #9198e5);",
      },
      keyframes: {
        marquee: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        marqueeRev: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        carouselMarquee: {
          from: {
            transform: "translateX(0%)",
          },
          to: {
            transform: "translateX(-100%)",
          },
        },
      },
    },
    screens: {

      xs: "375px",
      // => @media (min-width: 375px) { ... }

      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... },

      "3xl" : "1950px",
      // => @media (min-width: 1920px) { ... },

      tall: { raw: "(max-height: 700px)" },
      // => @media (min-height: 800px) { ... }
    },
  },
  plugins: [],
};
export default config;
