// FILE: src/components/dashboard/SessionBreakdownView.tsx
"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/csr/SpeakerHigh";

import { CoachVoiceCard } from "@/components/analyze/CoachVoiceCard";
import { FeedbackPanel } from "@/components/analyze/FeedbackPanel";
import { PoseOverlay } from "@/components/analyze/PoseOverlay";
import { Badge, Button, Card } from "@/components/ui";
import { createDebugRequestId, debugClientEvent, debugError } from "@/lib/debug";
import { exerciseLabel, exerciseTint, formatDate, formatDuration, scoreBadgeVariant, scoreLabel } from "@/lib/utils";
import type { AnalysisFeedback, CoachVoiceFeedback } from "@/types/analysis";
import type { Database } from "@/types/supabase";

interface SessionBreakdownViewProps {
  feedback: AnalysisFeedback;
  session: Database["public"]["Tables"]["sessions"]["Row"];
}

export function SessionBreakdownView({ feedback, session }: SessionBreakdownViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [coachAudio, setCoachAudio] = useState<CoachVoiceFeedback | null>(null);
  const [coachAudioError, setCoachAudioError] = useState<string | null>(null);
  const [isCoachAudioLoading, setIsCoachAudioLoading] = useState(false);
  const [coachReplayToken, setCoachReplayToken] = useState(0);

  const handleHearFeedback = async () => {
    if (coachAudio) {
      debugClientEvent("sessionBreakdown", "Replaying saved coach feedback", {
        sessionId: session.id,
      });
      setCoachAudioError(null);
      setCoachReplayToken((current) => current + 1);
      return;
    }

    const requestId = createDebugRequestId(`session-${session.id}-voice`);
    setIsCoachAudioLoading(true);
    setCoachAudioError(null);

    debugClientEvent("sessionBreakdown", "Requesting coach feedback for saved session", {
      requestId,
      sessionId: session.id,
      exercise: session.exercise,
      score: session.score,
    });

    try {
      const response = await fetch("/api/coach-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sportivity-request-id": requestId,
        },
        body: JSON.stringify({
          exercise: session.exercise,
          feedback,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | CoachVoiceFeedback
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(body && "error" in body ? body.error ?? "Unable to prepare coach feedback." : "Unable to prepare coach feedback.");
      }

      debugClientEvent("sessionBreakdown", "Coach feedback ready for saved session", {
        requestId,
        sessionId: session.id,
        voice: (body as CoachVoiceFeedback).voice,
      });

      setCoachAudio(body as CoachVoiceFeedback);
      setCoachReplayToken((current) => current + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to prepare coach feedback.";
      setCoachAudioError(message);
      debugError("sessionBreakdown", "Saved session coach feedback failed", error, {
        requestId,
        sessionId: session.id,
      });
    } finally {
      setIsCoachAudioLoading(false);
    }
  };

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

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={isCoachAudioLoading}
            onClick={() => void handleHearFeedback()}
          >
            {!isCoachAudioLoading ? <SpeakerHighIcon size={18} /> : null}
            {coachAudio ? "Replay feedback" : "Hear feedback"}
          </Button>
          <Link href="/analyze">
            <Button size="lg">Analyze a new set</Button>
          </Link>
        </div>
      </div>

      {coachAudio || coachAudioError || isCoachAudioLoading ? (
        <CoachVoiceCard
          audio={coachAudio}
          error={coachAudioError}
          isLoading={isCoachAudioLoading}
          autoPlayToken={coachReplayToken}
        />
      ) : null}

      <Card className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {session.video_url ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
                <video
                  ref={videoRef}
                  src={session.video_url}
                  poster={session.thumbnail_url ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
                <PoseOverlay videoRef={videoRef} landmarks={[]} feedback={feedback} />
              </div>
              <p className="text-sm text-grey-500">Saved replay from the exact clip Sportivity analyzed for this session, with live pose tracking over the video.</p>
            </div>
          ) : session.thumbnail_url ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
                <img
                  src={session.thumbnail_url}
                  alt={`${exerciseLabel(session.exercise)} session preview`}
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
            <Badge className={exerciseTint(session.exercise)}>{exerciseLabel(session.exercise)}</Badge>
            <Badge variant={scoreBadgeVariant(session.score)}>{scoreLabel(session.score)}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Form score</p>
              <p className="mt-1 text-3xl font-medium text-medium_slate_blue-500">{session.score}</p>
            </div>
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Recorded</p>
              <p className="mt-1 text-base font-medium text-charcoal-300">{formatDate(session.created_at ?? new Date())}</p>
            </div>
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <p className="text-sm text-grey-500">Duration</p>
              <p className="mt-1 text-base font-medium text-charcoal-300">
                {session.duration_seconds ? formatDuration(session.duration_seconds) : "Not stored"}
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

      <FeedbackPanel feedback={feedback} exercise={session.exercise} />
    </div>
  );
}
