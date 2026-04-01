// FILE: src/components/analyze/AnalyzeExperience.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";

import { AnalyzeButton } from "@/components/analyze/AnalyzeButton";
import { ExerciseSelector } from "@/components/analyze/ExerciseSelector";
import { FeedbackPanel } from "@/components/analyze/FeedbackPanel";
import { PoseOverlay } from "@/components/analyze/PoseOverlay";
import { type VideoSelection, VideoUploader } from "@/components/analyze/VideoUploader";
import { Badge, Card, Spinner } from "@/components/ui";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { Exercise } from "@/types/analysis";

export function AnalyzeExperience() {
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);
  const [exercise, setExercise] = useState<Exercise>("squat");
  const [selection, setSelection] = useState<VideoSelection>({
    file: null,
    url: null,
    duration: null,
  });

  const { status, feedback, error, analyze, reset, overlayLandmarks, isPoseReady, poseError } = useAnalysis();

  useEffect(() => {
    reset();
  }, [exercise, reset, selection.url]);

  const canAnalyze = Boolean(selection.url && (sourceVideoRef.current?.readyState ?? 0) >= 1);
  const isBusy = status === "extracting" || status === "analyzing";

  return (
    <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8">
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-charcoal-200">Analyze your rep</h1>
            <p className="text-sm text-grey-500">
              Upload one clean set, let MediaPipe track the pose, and get AI coaching in seconds.
            </p>
          </div>
          <ExerciseSelector value={exercise} onChange={setExercise} />
          <div className="flex flex-wrap gap-2">
            <Badge variant={isPoseReady ? "brand" : "default"}>
              {isPoseReady ? "Pose engine ready" : "Warming up pose engine"}
            </Badge>
            {selection.file ? <Badge>{selection.file.name}</Badge> : null}
          </div>
          <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4 md:hidden">
            <p className="text-sm font-medium text-charcoal-300">Mobile capture plan</p>
            <p className="mt-1 text-sm text-grey-500">
              On phones, Sportivity opens the rear camera, stacks the recording controls, and still lets you swap to a saved clip
              from your library without leaving the page.
            </p>
          </div>
          {poseError ? <Badge variant="error">{poseError}</Badge> : null}
        </Card>

        <VideoUploader videoRef={sourceVideoRef} value={selection} onChange={setSelection} />

        <div className="space-y-3">
          <AnalyzeButton
            status={status}
            disabled={!canAnalyze || isBusy}
            onClick={() => {
              if (!sourceVideoRef.current) return;
              void analyze(sourceVideoRef.current, exercise, selection.file);
            }}
          />
          {error ? <Badge variant="error">{error}</Badge> : null}
        </div>
      </div>

      <div className="space-y-6">
        {selection.url ? (
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-charcoal-300">Rep playback</h2>
                <p className="text-sm text-grey-500">
                  Overlay tracks the moving skeleton during playback and keeps coached joints highlighted.
                </p>
              </div>
              {isBusy ? (
                <div className="flex items-center gap-2 rounded-full bg-white_smoke-700 px-3 py-1.5 text-sm text-charcoal-300">
                  <Spinner className="h-4 w-4" />
                  {status === "extracting" ? "Extracting frames" : "Analyzing form"}
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
              <video
                ref={resultVideoRef}
                src={selection.url}
                controls
                playsInline
                className="aspect-video w-full object-cover"
              />
              {feedback ? (
                <PoseOverlay videoRef={resultVideoRef} landmarks={overlayLandmarks} feedback={feedback} />
              ) : null}
            </div>
          </Card>
        ) : (
          <Card className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <span className="rounded-full bg-medium_slate_blue-900 p-4 text-medium_slate_blue-500">
              <ChartLineUpIcon size={24} />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-medium text-charcoal-300">Your coaching results will show up here</h2>
              <p className="text-sm text-grey-500">Pick an exercise, upload a clip, and run the analysis to see your score.</p>
            </div>
          </Card>
        )}

        {feedback ? <FeedbackPanel feedback={feedback} exercise={exercise} /> : null}
      </div>
    </div>
  );
}
