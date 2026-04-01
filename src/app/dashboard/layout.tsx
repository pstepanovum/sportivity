// FILE: src/app/dashboard/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Home",
    template: "%s | Sportivity",
  },
  description: "Review recent sessions, track form scores, and open full training breakdowns in Sportivity.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
