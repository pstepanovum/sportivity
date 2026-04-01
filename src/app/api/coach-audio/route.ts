// FILE: src/app/api/coach-audio/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createDebugRequestId, debugError, debugLog } from "@/lib/debug";
import { buildCoachScript, buildCoachSpeechInstructions, resolveCoachStyle, resolveCoachVoice } from "@/lib/openai/voice";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFeedback, Exercise } from "@/types/analysis";

function isAnalysisFeedback(value: unknown): value is AnalysisFeedback {
  if (!value || typeof value !== "object") return false;

  const candidate = value as AnalysisFeedback;
  return (
    typeof candidate.overall === "string" &&
    typeof candidate.score === "number" &&
    Array.isArray(candidate.correct) &&
    Array.isArray(candidate.errors) &&
    typeof candidate.summary_cue === "string"
  );
}

export async function POST(request: NextRequest) {
  const requestId = createDebugRequestId(request.headers.get("x-sportivity-request-id"));
  const startedAt = Date.now();

  try {
    debugLog("api/coach-audio", "Incoming coach audio request", {
      requestId,
      path: request.nextUrl.pathname,
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      exercise?: Exercise;
      feedback?: AnalysisFeedback;
    };

    if (!body.exercise || !["squat", "deadlift", "pushup"].includes(body.exercise)) {
      return NextResponse.json({ error: "invalid exercise" }, { status: 400 });
    }

    if (!isAnalysisFeedback(body.feedback)) {
      return NextResponse.json({ error: "feedback required" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const voice = resolveCoachVoice(user.user_metadata?.coach_voice);
    const style = resolveCoachStyle(user.user_metadata?.coach_style);
    const fullName =
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
      user.email ??
      null;

    const script = buildCoachScript({
      exercise: body.exercise,
      feedback: body.feedback,
      fullName,
      style,
    });

    debugLog("api/coach-audio", "Prepared speech script", {
      requestId,
      exercise: body.exercise,
      voice,
      style,
      script,
      durationMs: Date.now() - startedAt,
    });

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        response_format: "mp3",
        instructions: buildCoachSpeechInstructions(style),
        input: script,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      debugError("api/coach-audio", "OpenAI speech generation failed", details, {
        requestId,
        status: response.status,
      });
      return NextResponse.json({ error: "Unable to generate coach audio." }, { status: 502 });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    debugLog("api/coach-audio", "Coach audio generated", {
      requestId,
      voice,
      bytes: audioBuffer.byteLength,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      audioBase64,
      mimeType: "audio/mpeg",
      script,
      voice,
    });
  } catch (err) {
    debugError("api/coach-audio", "Coach audio request failed", err, {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Coach audio failed." }, { status: 500 });
  }
}
