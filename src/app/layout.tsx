// FILE: src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/components/layout/AppShell";
import { MARKETING_KEYWORDS, SITE_CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, absoluteUrl } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: MARKETING_KEYWORDS,
  authors: [{ name: SITE_CREATOR }],
  creator: SITE_CREATOR,
  publisher: SITE_CREATOR,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/twitter-image")],
  },
  category: "fitness",
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico", rel: "shortcut icon" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sportivity",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${coinbaseSans.variable} ${coinbaseDisplay.variable} ${coinbaseMono.variable}`}
    >
      <body className="min-h-screen bg-white_smoke-500 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
