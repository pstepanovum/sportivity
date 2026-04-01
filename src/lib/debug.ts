// FILE: src/lib/debug.ts
import type { JointAngles } from "@/types/analysis";

export function createDebugRequestId(seed?: string | null) {
  if (seed && seed.trim().length > 0) {
    return seed.trim();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function debugLog(scope: string, message: string, details?: unknown) {
  const prefix = `[Sportivity][${new Date().toISOString()}][${scope}] ${message}`;

  if (details === undefined) {
    console.log(prefix);
    return;
  }

  console.log(prefix, details);
}

export function debugError(scope: string, message: string, error: unknown, details?: Record<string, unknown>) {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

  console.error(`[Sportivity][${new Date().toISOString()}][${scope}] ${message}`, {
    ...details,
    error: normalizedError,
  });
}

export function debugClientEvent(scope: string, message: string, details?: unknown) {
  debugLog(scope, message, details);

  if (typeof window === "undefined") {
    return;
  }

  void fetch("/api/debug/client-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scope,
      message,
      details,
      loggedAt: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch(() => undefined);
}

export function summarizeFrames(frames: string[]) {
  return {
    frameCount: frames.length,
    frameSizes: frames.map((frame, index) => ({
      index,
      base64Chars: frame.length,
    })),
  };
}

export function summarizeAngles(angles?: JointAngles) {
  if (!angles) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(angles).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])),
  );
}
