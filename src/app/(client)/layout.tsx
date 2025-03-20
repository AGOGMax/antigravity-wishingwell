import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import "@rainbow-me/rainbowkit/styles.css";
import RainbowKitContext from "@/components/RainbowKit";
import { Toaster } from "react-hot-toast";
import IMAGEKIT from "./home/images";
import StarFieldCanvas from "@/components/background/Starfeild";
import SaturnCanvasORImage from "./SaturnCanvasORImage";
import AnimatedNebulaBG from "@/components/AnimatedNebulaBG";

const inter = Inter({ subsets: ["latin"] });

const title = "Antigravity | Join The Space Cult!";
const description = "Join The Space Cult.";
const previewImage = IMAGEKIT.PREVIEW_IMAGE;
const websiteUrl = new URL("https://agproject.io");

export const metadata: Metadata = {
  title: title,
  description: description,
  // manifest: "./site.webmanifest",
  metadataBase: websiteUrl,
  applicationName: "Antigravity",
  openGraph: {
    type: "website",
    url: websiteUrl,
    title: title,
    description: description,
    siteName: "Antigravity",
    images: [
      {
        url: previewImage,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HexrayVision",
    creator: "@HexrayVision",
    title: title,
    description: description,
    images: {
      url: previewImage,
      alt: "Antigravity Preview image",
    },
  },
  other: {
    "twitter:url": "https://agproject.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <RainbowKitContext>
          <div className="bg-agblack min-h-[100vh]">
            <div className="flex flex-col min-h-screen min-w-screen overflow-hidden">
              <div className="relative z-0 flex flex-col min-h-screen">
                {children}
                <div className="w-full h-[100vh] 10 fixed top-0 left-0 -z-[1]">
                  <SaturnCanvasORImage />
                  <StarFieldCanvas
                    count={50}
                    xRange={100}
                    yRange={100}
                    zRange={100}
                    speed={0.1}
                  />
                  <AnimatedNebulaBG />
                </div>
              </div>
            </div>
          </div>
        </RainbowKitContext>
      </body>
    </html>
  );
}
