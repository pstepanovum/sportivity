// FILE: src/app/dashboard/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPageMetadata({
  title: "Home",
  description: "Review recent workout sessions, form score trends, saved replays, and Sportivity coaching feedback.",
  path: "/dashboard",
  robots: PRIVATE_PAGE_ROBOTS,
});

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title="Dashboard setup required"
        description="The dashboard needs your Supabase URL and publishable key so sessions and auth can load correctly."
        actionHref="/"
        actionLabel="Back to home"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: "Home", path: "/dashboard" }])} />
      <DashboardView />
    </>
  );
}
