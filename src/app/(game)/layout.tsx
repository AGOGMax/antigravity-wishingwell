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
        <RainbowKitContext>{children}</RainbowKitContext>
      </body>
    </html>
  );
}
