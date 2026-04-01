// FILE: src/app/dashboard/[sessionId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FeedbackPanel } from "@/components/analyze/FeedbackPanel";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { Badge, Button, Card } from "@/components/ui";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { exerciseLabel, exerciseTint, formatDate, formatDuration, scoreBadgeVariant, scoreLabel } from "@/lib/utils";
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link href="/" className="inline-flex text-sm text-grey-500 transition-colors hover:text-charcoal-300">
            Back to home
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-charcoal-200">Session breakdown</h1>
            <p className="text-sm text-grey-500">Replay the exact set that was analyzed, then review the saved cues, score, and movement notes.</p>
          </div>
        </div>

        <Link href="/analyze">
          <Button size="lg">Analyze a new set</Button>
        </Link>
      </div>

      <Card className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {sessionRecord.video_url ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
                <video
                  src={sessionRecord.video_url}
                  poster={sessionRecord.thumbnail_url ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              </div>
              <p className="text-sm text-grey-500">Saved replay from the exact clip Sportivity analyzed for this session.</p>
            </div>
          ) : sessionRecord.thumbnail_url ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
                <img
                  src={sessionRecord.thumbnail_url}
                  alt={`${exerciseLabel(sessionRecord.exercise)} session preview`}
                  className="aspect-video w-full object-cover"
                />
              </div>
              <p className="text-sm text-grey-500">This older session only saved a preview frame, so a full replay is not available.</p>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-silver-700 bg-white_smoke-800 text-sm text-grey-500">
              No replay or thumbnail was saved for this session.
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge className={exerciseTint(sessionRecord.exercise)}>{exerciseLabel(sessionRecord.exercise)}</Badge>
            <Badge variant={scoreBadgeVariant(sessionRecord.score)}>{scoreLabel(sessionRecord.score)}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Form score</p>
              <p className="mt-1 text-3xl font-medium text-medium_slate_blue-500">{sessionRecord.score}</p>
            </div>
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Recorded</p>
              <p className="mt-1 text-base font-medium text-charcoal-300">{formatDate(sessionRecord.created_at ?? new Date())}</p>
            </div>
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Duration</p>
              <p className="mt-1 text-base font-medium text-charcoal-300">
                {sessionRecord.duration_seconds ? formatDuration(sessionRecord.duration_seconds) : "Not stored"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-5">
            <p className="text-sm text-grey-500">Coach summary</p>
            <p className="mt-2 text-base font-medium text-charcoal-300">{feedback.overall}</p>
            <p className="mt-3 text-sm text-grey-500">{feedback.summary_cue}</p>
          </div>
        </div>
      </Card>

      <FeedbackPanel feedback={feedback} exercise={sessionRecord.exercise} />
    </div>
  );
}
