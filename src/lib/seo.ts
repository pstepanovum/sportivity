// FILE: src/lib/seo.ts
import type { Metadata } from "next";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  const withProtocol =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : value.includes("localhost")
        ? `http://${value}`
        : `https://${value}`;

  return withProtocol.replace(/\/$/, "");
}

export const SITE_NAME = "Sportivity";
export const SITE_URL = normalizeSiteUrl(rawSiteUrl);
export const SITE_TITLE = "Sportivity - AI fitness form coach";
export const SITE_DESCRIPTION =
  "Sportivity is an AI-powered fitness form coach that reviews squat, deadlift, and push-up videos with pose tracking, coaching feedback, session history, and voice recaps.";
export const SITE_CREATOR = "Pavel Stepanov";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const MARKETING_KEYWORDS = [
  "AI fitness form coach",
  "workout form checker",
  "squat form analysis",
  "deadlift form feedback",
  "push-up form feedback",
  "pose tracking workout app",
  "exercise technique analysis",
  "video workout coach",
  "fitness progress tracker",
  "AI workout feedback",
];

export const PRIVATE_PAGE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function createCanonical(path = "/") {
  return absoluteUrl(path);
}

export function createPageMetadata({
  description,
  keywords,
  path = "/",
  robots,
  title,
}: {
  description: string;
  keywords?: string[];
  path?: string;
  robots?: Metadata["robots"];
  title: string;
}): Metadata {
  return {
    title,
    description,
    keywords: keywords ?? MARKETING_KEYWORDS,
    alternates: {
      canonical: createCanonical(path),
    },
    openGraph: {
      title,
      description,
      url: createCanonical(path),
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: SITE_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    robots,
  };
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Person",
      name: SITE_CREATOR,
    },
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo-color.svg"),
    founder: {
      "@type": "Person",
      name: SITE_CREATOR,
    },
  };
}

export function createSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI-powered exercise form feedback",
      "Squat, deadlift, and push-up video analysis",
      "Pose tracking overlay",
      "Workout session history and progress tracking",
      "Personalized voice coaching recap",
    ],
  };
}
