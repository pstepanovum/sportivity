// FILE: src/app/api/coach-audio-preview/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createDebugRequestId, debugError, debugLog } from "@/lib/debug";
import { buildVoicePreviewInstructions, buildVoicePreviewScript, resolveCoachStyle, resolveCoachVoice } from "@/lib/openai/voice";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestId = createDebugRequestId(request.headers.get("x-sportivity-request-id"));
  const startedAt = Date.now();

  try {
    debugLog("api/coach-audio-preview", "Incoming coach voice preview request", { requestId });

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
      fullName?: string | null;
      style?: string | null;
      voice?: string | null;
    };

    const voice = resolveCoachVoice(body.voice);
    const style = resolveCoachStyle(body.style ?? user.user_metadata?.coach_style);
    const script = buildVoicePreviewScript(
      body.fullName ??
        (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
        user.email ??
        null,
      style,
    );

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
        instructions: buildVoicePreviewInstructions(style),
        input: script,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      debugError("api/coach-audio-preview", "OpenAI voice preview generation failed", details, {
        requestId,
        status: response.status,
      });
      return NextResponse.json({ error: "Unable to preview this voice." }, { status: 502 });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    debugLog("api/coach-audio-preview", "Coach voice preview generated", {
      requestId,
      voice,
      style,
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
    debugError("api/coach-audio-preview", "Coach voice preview request failed", err, {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Voice preview failed." }, { status: 500 });
  }
}
