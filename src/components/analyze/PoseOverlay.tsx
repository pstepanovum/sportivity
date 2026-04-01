// FILE: src/components/analyze/PoseOverlay.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";

import { LANDMARKS } from "@/lib/mediapipe/angles";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import type { AnalysisFeedback, PosePoint } from "@/types/analysis";

interface PoseOverlayProps {
  videoRef: RefObject<HTMLVideoElement>;
  landmarks: PosePoint[];
  feedback?: AnalysisFeedback | null;
}

const CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [0, 4],
  [1, 2],
  [2, 3],
  [4, 5],
  [5, 6],
  [3, 7],
  [6, 8],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
  [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
  [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
  [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
  [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
  [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
  [15, 17],
  [15, 19],
  [15, 21],
  [16, 18],
  [16, 20],
  [16, 22],
  [27, 29],
  [29, 31],
  [28, 30],
  [30, 32],
];

function getHighlightedIndices(feedback?: AnalysisFeedback | null) {
  const highlighted = new Set<number>();

  feedback?.errors.forEach((error) => {
    const joint = error.joint.toLowerCase();

    if (joint.includes("left knee")) highlighted.add(LANDMARKS.LEFT_KNEE);
    if (joint.includes("right knee")) highlighted.add(LANDMARKS.RIGHT_KNEE);
    if (joint.includes("left hip")) highlighted.add(LANDMARKS.LEFT_HIP);
    if (joint.includes("right hip")) highlighted.add(LANDMARKS.RIGHT_HIP);
    if (joint.includes("left elbow")) highlighted.add(LANDMARKS.LEFT_ELBOW);
    if (joint.includes("right elbow")) highlighted.add(LANDMARKS.RIGHT_ELBOW);
    if (joint.includes("left shoulder")) highlighted.add(LANDMARKS.LEFT_SHOULDER);
    if (joint.includes("right shoulder")) highlighted.add(LANDMARKS.RIGHT_SHOULDER);

    if (joint.includes("spine") || joint.includes("back")) {
      highlighted.add(LANDMARKS.LEFT_SHOULDER);
      highlighted.add(LANDMARKS.RIGHT_SHOULDER);
      highlighted.add(LANDMARKS.LEFT_HIP);
      highlighted.add(LANDMARKS.RIGHT_HIP);
    }
  });

  return highlighted;
}

export function PoseOverlay({ videoRef, landmarks, feedback }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarksRef = useRef<PosePoint[]>(landmarks);
  const isProcessingFrameRef = useRef(false);
  const lastProcessedAtRef = useRef(0);
  const { extractAngles, initialize } = useMediaPipe(false);

  const highlighted = useMemo(() => getHighlightedIndices(feedback), [feedback]);

  useEffect(() => {
    if (landmarks.length > 0) {
      landmarksRef.current = landmarks;
    }
  }, [landmarks]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    let frameId = 0;
    let cancelled = false;

    const draw = () => {
      const activeLandmarks = landmarksRef.current;
      if (activeLandmarks.length === 0) return;

      const width = video.clientWidth;
      const height = video.clientHeight;

      if (!width || !height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(113, 97, 239, 0.4)";

      CONNECTIONS.forEach(([start, end]) => {
        const a = activeLandmarks[start];
        const b = activeLandmarks[end];

        if (!a || !b) return;
        if ((a.visibility !== undefined && a.visibility < 0.3) || (b.visibility !== undefined && b.visibility < 0.3)) {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      });

      activeLandmarks.forEach((point, index) => {
        if (!point || typeof point.x !== "number" || typeof point.y !== "number") return;
        if (point.visibility !== undefined && point.visibility < 0.3) return;

        const x = point.x * width;
        const y = point.y * height;
        const isHighlighted = highlighted.has(index);

        ctx.beginPath();
        ctx.arc(x, y, isHighlighted ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? "#c37047" : "#7161ef";
        ctx.fill();

        if (isHighlighted) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(195, 112, 71, 0.35)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    const updateSkeleton = async (force = false) => {
      const now = performance.now();

      if (!force && (video.paused || video.ended)) {
        return;
      }

      if (!force && now - lastProcessedAtRef.current < 100) {
        return;
      }

      if (isProcessingFrameRef.current || video.readyState < 2) {
        return;
      }

      isProcessingFrameRef.current = true;
      lastProcessedAtRef.current = now;

      try {
        const { landmarks: currentLandmarks } = await extractAngles(video);

        if (!cancelled && currentLandmarks.length > 0) {
          landmarksRef.current = currentLandmarks;
        }
      } catch {
        return;
      } finally {
        isProcessingFrameRef.current = false;
      }
    };

    const renderLoop = () => {
      if (cancelled) {
        return;
      }

      draw();
      void updateSkeleton();
      frameId = window.requestAnimationFrame(renderLoop);
    };

    void initialize().catch(() => undefined);
    draw();
    frameId = window.requestAnimationFrame(renderLoop);

    const handleSeeked = () => {
      void updateSkeleton(true);
      draw();
    };

    const handleLoadedMetadata = () => {
      void updateSkeleton(true);
      draw();
    };

    window.addEventListener("resize", draw);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", draw);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [extractAngles, highlighted, initialize, videoRef]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
}
