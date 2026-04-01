// FILE: src/hooks/useMediaPipe.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { calculateAngles } from "@/lib/mediapipe/angles";
import { extractLandmarks, initPose } from "@/lib/mediapipe/pose";
import type { JointAngles, PosePoint } from "@/types/analysis";

export function useMediaPipe(autoInitialize = true) {
  const poseRef = useRef<Awaited<ReturnType<typeof initPose>> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      const pose = poseRef.current ?? (await initPose());
      poseRef.current = pose;
      setIsReady(true);
      setError(null);
      return pose;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to initialize pose engine.";
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!autoInitialize) return;
    void initialize();
  }, [autoInitialize, initialize]);

  const extractAngles = useCallback(
    async (source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{
      landmarks: PosePoint[];
      angles: JointAngles;
    }> => {
      const pose = poseRef.current ?? (await initialize());
      const landmarks = await extractLandmarks(pose, source);
      return {
        landmarks,
        angles: calculateAngles(landmarks),
      };
    },
    [initialize],
  );

  return {
    isReady,
    error,
    initialize,
    extractAngles,
  };
}
