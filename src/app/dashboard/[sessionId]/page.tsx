// FILE: src/app/dashboard/[sessionId]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SessionBreakdownView } from "@/components/dashboard/SessionBreakdownView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFeedback } from "@/types/analysis";
import type { Database } from "@/types/supabase";

export const metadata: Metadata = createPageMetadata({
  title: "Session breakdown",
  description: "Open a saved Sportivity workout session to review the replay, score, voice feedback, and detailed form breakdown.",
  path: "/dashboard",
  robots: PRIVATE_PAGE_ROBOTS,
});

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

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

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  const sessionRecord = session as Database["public"]["Tables"]["sessions"]["Row"] | null;

  if (error || !sessionRecord) {
    notFound();
  }

  const feedback = sessionRecord.feedback as unknown as AnalysisFeedback;

  return (
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/dashboard" },
          { name: "Session breakdown", path: `/dashboard/${sessionId}` },
        ])}
      />
      <SessionBreakdownView session={sessionRecord} feedback={feedback} />
    </>
  );
}
