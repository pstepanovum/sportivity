// FILE: src/app/dashboard/[sessionId]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SessionBreakdownView } from "@/components/dashboard/SessionBreakdownView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFeedback } from "@/types/analysis";
import type { Database } from "@/types/supabase";

export const metadata: Metadata = {
  title: "Session breakdown",
  description: "Open a saved Sportivity session to review score, cues, and workout notes in detail.",
};

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

  return <SessionBreakdownView session={sessionRecord} feedback={feedback} />;
}
