import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
// import "@coinbase/onchainkit/styles.css";
import {
  Inter,
  Manrope,
} from "next/font/google";

// Load Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Load Manrope
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Payne",
  description: "dApp that merchants use to recieve USDC Payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
       className="font-body"
       >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
