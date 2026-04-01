// FILE: src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import "./globals.css";

const coinbaseSans = localFont({
  src: [
    {
      path: "../../public/font/Coinbase-Sans/Coinbase_Sans-Regular-web-1.32.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Sans/Coinbase_Sans-Medium-web-1.32.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Sans/Coinbase_Sans-Bold-web-1.32.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-sans",
  display: "swap",
});

const coinbaseDisplay = localFont({
  src: [
    {
      path: "../../public/font/Coinbase-Display/Coinbase_Display-Regular-web-1.32.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Display/Coinbase_Display-Medium-web-1.32.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Display/Coinbase_Display-Bold-web-1.32.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-display",
  display: "swap",
});

const coinbaseMono = localFont({
  src: [
    {
      path: "../../public/font/Coinbase-Mono/Coinbase_Mono-Regular-web.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Mono/Coinbase_Mono-Medium-web.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Coinbase-Mono/Coinbase_Mono-Bold-web.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-coinbase-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sportivity — AI Form Coach",
  description: "Upload your workout video and get instant AI-powered form feedback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${coinbaseSans.variable} ${coinbaseDisplay.variable} ${coinbaseMono.variable}`}>
      <body className="min-h-screen bg-white_smoke-500 font-sans">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
