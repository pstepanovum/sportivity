// FILE: src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createDebugRequestId, debugError, debugLog, summarizeAngles, summarizeFrames, summarizePoseMotion } from "@/lib/debug";
import { analyzeForm } from "@/lib/openai/analyze";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, JointAngles, PoseMotionSummary } from "@/types/analysis";

const EXERCISES: Exercise[] = ["squat", "deadlift", "pushup"];

export async function POST(request: NextRequest) {
  const requestId = createDebugRequestId(request.headers.get("x-sportivity-request-id"));
  const startedAt = Date.now();

  try {
    debugLog("api/analyze", "Incoming analysis request", {
      requestId,
      path: request.nextUrl.pathname,
      method: request.method,
    });

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase environment variables are not configured." }, { status: 503 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    debugLog("api/analyze", "Auth lookup finished", {
      requestId,
      hasUser: Boolean(user),
      userId: user?.id ?? null,
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      frames?: string[];
      exercise?: Exercise;
      angles?: JointAngles;
      poseSummary?: PoseMotionSummary;
    };

    if (!Array.isArray(body.frames) || body.frames.length === 0) {
      return NextResponse.json({ error: "frames required" }, { status: 400 });
    }

    if (!body.exercise || !EXERCISES.includes(body.exercise)) {
      return NextResponse.json({ error: "invalid exercise" }, { status: 400 });
    }

    debugLog("api/analyze", "Payload validated", {
      requestId,
      exercise: body.exercise,
      frames: summarizeFrames(body.frames),
      angles: summarizeAngles(body.angles),
      poseSummary: summarizePoseMotion(body.poseSummary),
    });

    const feedback = await analyzeForm(body.frames, body.exercise, body.angles, body.poseSummary, requestId);
    debugLog("api/analyze", "Analysis completed", {
      requestId,
      durationMs: Date.now() - startedAt,
      feedback,
    });
    return NextResponse.json({ feedback });
  } catch (err) {
    debugError("api/analyze", "Analysis request failed", err, {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
