// FILE: src/app/analyze/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnalyzeExperience } from "@/components/analyze/AnalyzeExperience";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPageMetadata({
  title: "Analyze your workout video",
  description: "Upload a workout clip to analyze exercise form, pose tracking, movement quality, and AI coaching cues in Sportivity.",
  path: "/analyze",
  robots: PRIVATE_PAGE_ROBOTS,
});

export default async function AnalyzePage() {
  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title="Supabase setup required"
        description="Add your Supabase URL and publishable key before using the analysis workflow."
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
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/dashboard" },
          { name: "Analyze", path: "/analyze" },
        ])}
      />
      <AnalyzeExperience />
    </>
  );
}
