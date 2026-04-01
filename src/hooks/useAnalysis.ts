// FILE: src/hooks/useAnalysis.ts
"use client";

import { useCallback, useState } from "react";

import { createDebugRequestId, debugError, debugLog, summarizeAngles, summarizeFrames } from "@/lib/debug";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { averageAngles, loadImageFromBase64, sampleFrames } from "@/lib/utils";
import type { AnalysisFeedback, AnalysisStatus, Exercise, JointAngles, PosePoint } from "@/types/analysis";

export function useAnalysis() {
  const { extractAngles, isReady: isPoseReady, error: poseError } = useMediaPipe();
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [feedback, setFeedback] = useState<AnalysisFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overlayLandmarks, setOverlayLandmarks] = useState<PosePoint[]>([]);

  const analyze = useCallback(
    async (video: HTMLVideoElement, exercise: Exercise) => {
      const requestId = createDebugRequestId();
      setStatus("extracting");
      setError(null);
      setFeedback(null);
      debugLog("useAnalysis", "Starting analysis flow", {
        requestId,
        exercise,
        readyState: video.readyState,
        durationSeconds: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
      });

      try {
        const frames = await sampleFrames(video, 4);
        debugLog("useAnalysis", "Sampled frames from video", {
          requestId,
          ...summarizeFrames(frames),
        });
        let averagedAngles: JointAngles | undefined;
        let representativeLandmarks: PosePoint[] = [];

        try {
          const analyzedFrames = await Promise.all(
            frames.map(async (frame) => {
              const image = await loadImageFromBase64(frame);
              return extractAngles(image);
            }),
          );

          representativeLandmarks =
            analyzedFrames[Math.floor(analyzedFrames.length / 2)]?.landmarks ?? [];
          averagedAngles = averageAngles(analyzedFrames.map((entry) => entry.angles));
          debugLog("useAnalysis", "Pose extraction finished", {
            requestId,
            landmarkCount: representativeLandmarks.length,
            angles: summarizeAngles(averagedAngles),
          });
        } catch (poseIssue) {
          debugError("useAnalysis", "Pose extraction failed, continuing with vision-only analysis", poseIssue, {
            requestId,
          });
        }

        setOverlayLandmarks(representativeLandmarks);
        setStatus("analyzing");
        debugLog("useAnalysis", "Calling /api/analyze", {
          requestId,
          exercise,
          angles: summarizeAngles(averagedAngles),
        });

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sportivity-request-id": requestId,
          },
          body: JSON.stringify({
            frames,
            exercise,
            angles: averagedAngles,
          }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Analysis request failed.");
        }

        const { feedback: result } = (await response.json()) as { feedback: AnalysisFeedback };
        debugLog("useAnalysis", "Analysis response received", {
          requestId,
          feedback: result,
        });

        setFeedback(result);
        setStatus("done");

        const saveRequestId = createDebugRequestId(`${requestId}-save`);
        debugLog("useAnalysis", "Saving session to /api/sessions", {
          requestId: saveRequestId,
          sourceRequestId: requestId,
          score: result.score,
        });

        void fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sportivity-request-id": saveRequestId,
          },
          body: JSON.stringify({
            exercise,
            score: result.score,
            feedback: result,
            duration_seconds: video.duration,
            thumbnail_url: `data:image/jpeg;base64,${frames[0]}`,
          }),
        })
          .then(async (saveResponse) => {
            const body = (await saveResponse.json().catch(() => null)) as { session?: { id?: string }; error?: string } | null;

            if (!saveResponse.ok) {
              throw new Error(body?.error ?? "Unable to save session.");
            }

            debugLog("useAnalysis", "Session saved", {
              requestId: saveRequestId,
              sessionId: body?.session?.id ?? null,
            });
          })
          .catch((saveError) => {
            debugError("useAnalysis", "Session save failed", saveError, { requestId: saveRequestId });
          });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown analysis error.");
        debugError("useAnalysis", "Analysis flow failed", err, { requestId });
      }
    },
    [extractAngles],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setFeedback(null);
    setError(null);
    setOverlayLandmarks([]);
  }, []);

  return {
    status,
    feedback,
    error,
    analyze,
    reset,
    overlayLandmarks,
    isPoseReady,
    poseError,
  };
}
