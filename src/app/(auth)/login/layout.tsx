// FILE: src/app/(auth)/login/layout.tsx
import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to Sportivity to review saved workout sessions, session scores, and AI coaching feedback.",
  path: "/login",
  robots: PRIVATE_PAGE_ROBOTS,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Sign in", path: "/login" },
        ])}
      />
      {children}
    </>
  );
}
