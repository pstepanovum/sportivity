// FILE: src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Exercise, JointAngles } from "@/types/analysis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

export function getInitials(value?: string | null): string {
  if (!value) return "SP";

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "SP";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function getFirstName(value?: string | null): string | null {
  if (!value) return null;

  const [firstPart] = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!firstPart) return null;

  const cleaned = firstPart.includes("@") ? firstPart.split("@")[0] : firstPart;
  const normalized = cleaned.replace(/[^a-zA-Z'-]/g, "");

  if (!normalized) return null;

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function exerciseLabel(exercise: Exercise): string {
  switch (exercise) {
    case "squat":
      return "Squat";
    case "deadlift":
      return "Deadlift";
    case "pushup":
      return "Push-up";
    default:
      return exercise;
  }
}

export function exerciseTint(exercise: Exercise): string {
  switch (exercise) {
    case "squat":
      return "bg-soft_periwinkle-900 text-medium_slate_blue-300";
    case "deadlift":
      return "bg-mauve-900 text-mauve-300";
    case "pushup":
      return "bg-powder_petal-800 text-powder_petal-200";
    default:
      return "bg-silver-800 text-charcoal-400";
  }
}

export function scoreBadgeVariant(score: number) {
  if (score >= 80) return "brand" as const;
  if (score >= 60) return "success" as const;
  if (score >= 40) return "warning" as const;
  return "error" as const;
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function averageAngles(angleSets: JointAngles[]): JointAngles | undefined {
  if (angleSets.length === 0) return undefined;

  const keys: Array<keyof JointAngles> = [
    "leftKnee",
    "rightKnee",
    "leftHip",
    "rightHip",
    "leftElbow",
    "rightElbow",
    "spine",
  ];

  const averaged = keys.reduce<JointAngles>((acc, key) => {
    const values = angleSets
      .map((set) => set[key])
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    if (values.length > 0) {
      acc[key] = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
    }

    return acc;
  }, {});

  return Object.keys(averaged).length > 0 ? averaged : undefined;
}

export function dataUrlFromBase64(base64: string, mime = "image/jpeg") {
  return `data:${mime};base64,${base64}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to serialize selected video."));
    };

    reader.onerror = () => reject(reader.error ?? new Error("Unable to read selected video."));
    reader.readAsDataURL(file);
  });
}

export async function loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrlFromBase64(base64);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to decode image frame."));
  });

  return image;
}

export function captureFrame(video: HTMLVideoElement, time?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to create frame context."));
      return;
    }

    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1] ?? "");
    };

    if (time !== undefined) {
      const handleSeeked = () => {
        draw();
        video.removeEventListener("seeked", handleSeeked);
      };

      video.addEventListener("seeked", handleSeeked, { once: true });
      video.currentTime = time;
      return;
    }

    draw();
  });
}

export async function sampleFrames(video: HTMLVideoElement, count = 4): Promise<string[]> {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const safeCount = Math.max(1, count);
  const originalTime = video.currentTime;

  if (duration <= 0) {
    return [await captureFrame(video)];
  }

  const times = Array.from({ length: safeCount }, (_, index) => (index + 0.5) * (duration / safeCount));
  const frames: string[] = [];

  for (const time of times) {
    frames.push(await captureFrame(video, time));
  }

  video.currentTime = originalTime;
  return frames;
}
