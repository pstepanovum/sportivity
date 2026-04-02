// FILE: src/app/(auth)/signup/layout.tsx
import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create account",
  description: "Create a Sportivity account to save workout sessions, form scores, voice coaching, and progress over time.",
  path: "/signup",
  robots: PRIVATE_PAGE_ROBOTS,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Create account", path: "/signup" },
        ])}
      />
      {children}
    </>
  );
}
