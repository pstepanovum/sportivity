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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${coinbaseSans.variable} ${coinbaseDisplay.variable} ${coinbaseMono.variable}`}
    >
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Sportivity - AI-powered fitness form coach." />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
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
