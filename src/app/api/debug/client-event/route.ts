// FILE: src/app/api/debug/client-event/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      scope?: string;
      message?: string;
      details?: unknown;
      loggedAt?: string;
    };

    const scope = body.scope?.trim() || "client";
    const message = body.message?.trim() || "event";
    const prefix = `[Sportivity][${body.loggedAt ?? new Date().toISOString()}][terminal:${scope}] ${message}`;

    if (body.details === undefined) {
      console.log(prefix);
    } else {
      console.log(prefix, body.details);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Sportivity][api/debug/client-event] Failed to log client event", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
