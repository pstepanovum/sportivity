// FILE: src/lib/mediapipe/angles.ts
import type { JointAngles, PosePoint } from "@/types/analysis";

export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

function angle(a: PosePoint, b: PosePoint, c: PosePoint): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const cross = ab.x * cb.y - ab.y * cb.x;

  return Math.abs(Math.atan2(cross, dot) * (180 / Math.PI));
}

function midpoint(a: PosePoint, b: PosePoint): PosePoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function calculateAngles(landmarks: PosePoint[]): JointAngles {
  if (!landmarks || landmarks.length < 29) return {};

  const lm = (index: number) => landmarks[index];

  const shoulderMid = midpoint(lm(LANDMARKS.LEFT_SHOULDER), lm(LANDMARKS.RIGHT_SHOULDER));
  const hipMid = midpoint(lm(LANDMARKS.LEFT_HIP), lm(LANDMARKS.RIGHT_HIP));
  const verticalReference = { x: hipMid.x, y: hipMid.y + 1 };

  return {
    leftKnee: angle(lm(LANDMARKS.LEFT_HIP), lm(LANDMARKS.LEFT_KNEE), lm(LANDMARKS.LEFT_ANKLE)),
    rightKnee: angle(lm(LANDMARKS.RIGHT_HIP), lm(LANDMARKS.RIGHT_KNEE), lm(LANDMARKS.RIGHT_ANKLE)),
    leftHip: angle(lm(LANDMARKS.LEFT_SHOULDER), lm(LANDMARKS.LEFT_HIP), lm(LANDMARKS.LEFT_KNEE)),
    rightHip: angle(lm(LANDMARKS.RIGHT_SHOULDER), lm(LANDMARKS.RIGHT_HIP), lm(LANDMARKS.RIGHT_KNEE)),
    leftElbow: angle(lm(LANDMARKS.LEFT_SHOULDER), lm(LANDMARKS.LEFT_ELBOW), lm(LANDMARKS.LEFT_WRIST)),
    rightElbow: angle(lm(LANDMARKS.RIGHT_SHOULDER), lm(LANDMARKS.RIGHT_ELBOW), lm(LANDMARKS.RIGHT_WRIST)),
    spine: angle(shoulderMid, hipMid, verticalReference),
  };
}
