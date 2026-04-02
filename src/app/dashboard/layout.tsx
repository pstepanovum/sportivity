// FILE: src/app/dashboard/layout.tsx
import type { Metadata } from "next";

import { PRIVATE_PAGE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Home",
    template: "%s | Sportivity",
  },
  description: "Review recent sessions, track form scores, and open full training breakdowns in Sportivity.",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
