// FILE: src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createDebugRequestId, debugError, debugLog } from "@/lib/debug";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFeedback, Exercise } from "@/types/analysis";
import type { Database } from "@/types/supabase";

export async function POST(request: NextRequest) {
  const requestId = createDebugRequestId(request.headers.get("x-sportivity-request-id"));
  const startedAt = Date.now();

  try {
    debugLog("api/sessions", "Incoming session save request", {
      requestId,
      path: request.nextUrl.pathname,
      method: request.method,
    });

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase environment variables are not configured." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    debugLog("api/sessions", "Auth lookup finished for save", {
      requestId,
      hasUser: Boolean(user),
      userId: user?.id ?? null,
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      exercise?: Exercise;
      score?: number;
      feedback?: AnalysisFeedback;
      duration_seconds?: number;
      thumbnail_url?: string | null;
      video_url?: string | null;
    };

    if (!body.exercise || typeof body.score !== "number" || !body.feedback) {
      return NextResponse.json({ error: "Missing session payload." }, { status: 400 });
    }

    debugLog("api/sessions", "Session payload validated", {
      requestId,
      exercise: body.exercise,
      score: body.score,
      durationSeconds: body.duration_seconds ?? null,
      hasThumbnail: Boolean(body.thumbnail_url),
      hasVideoUrl: Boolean(body.video_url),
    });

    const payload: Database["public"]["Tables"]["sessions"]["Insert"] = {
      user_id: user.id,
      exercise: body.exercise,
      score: Math.round(body.score),
      feedback: body.feedback as unknown as Database["public"]["Tables"]["sessions"]["Insert"]["feedback"],
      duration_seconds: body.duration_seconds ?? null,
      thumbnail_url: body.thumbnail_url ?? null,
      video_url: body.video_url ?? null,
    };

    const { data, error } = await supabase
      .from("sessions")
      .insert(payload as never)
      .select("*")
      .single();

    const session = data as Database["public"]["Tables"]["sessions"]["Row"] | null;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    debugLog("api/sessions", "Session saved", {
      requestId,
      durationMs: Date.now() - startedAt,
      sessionId: session?.id ?? null,
    });
    return NextResponse.json({ session });
  } catch (err) {
    debugError("api/sessions", "Session save failed", err, {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Unable to save session." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const requestId = createDebugRequestId(request.headers.get("x-sportivity-request-id"));
  const startedAt = Date.now();

  try {
    debugLog("api/sessions", "Incoming sessions fetch", {
      requestId,
      method: "GET",
    });

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase environment variables are not configured." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    debugLog("api/sessions", "Auth lookup finished for fetch", {
      requestId,
      hasUser: Boolean(user),
      userId: user?.id ?? null,
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("id, user_id, exercise, score, feedback, thumbnail_url, duration_seconds, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const sessions = (data ?? []) as Database["public"]["Tables"]["sessions"]["Row"][];

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    debugLog("api/sessions", "Sessions loaded", {
      requestId,
      durationMs: Date.now() - startedAt,
      sessionCount: sessions.length,
      includesReplayVideo: false,
    });
    return NextResponse.json({ sessions });
  } catch (err) {
    debugError("api/sessions", "Sessions fetch failed", err, {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Unable to load sessions." }, { status: 500 });
  }
}
