"use client";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import RainbowKitContext from "@/components/RainbowKit";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <RainbowKitContext>{children}</RainbowKitContext>
      </body>
    </html>
  );
}
