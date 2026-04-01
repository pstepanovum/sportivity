// FILE: src/components/dashboard/DashboardView.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { createDebugRequestId, debugError, debugLog } from "@/lib/debug";
import { clampScore } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

export function DashboardView() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSessions = async () => {
      const requestId = createDebugRequestId();

      try {
        setIsLoading(true);
        debugLog("dashboard", "Loading recent sessions", { requestId });

        const response = await fetch("/api/sessions", {
          headers: {
            "x-sportivity-request-id": requestId,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Unable to load sessions.");
        }

        const data = (await response.json()) as { sessions: SessionRow[] };
        setSessions(data.sessions ?? []);
        setError(null);
        debugLog("dashboard", "Recent sessions loaded", {
          requestId,
          sessionCount: data.sessions?.length ?? 0,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load sessions.");
        debugError("dashboard", "Failed to load recent sessions", err, { requestId });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadSessions();

    return () => controller.abort();
  }, []);

  const totalSessions = sessions.length;
  const averageScore =
    totalSessions > 0 ? clampScore(sessions.reduce((sum, session) => sum + session.score, 0) / totalSessions) : 0;
  const bestScore = totalSessions > 0 ? Math.max(...sessions.map((session) => session.score)) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="brand">Home base</Badge>
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-charcoal-200">Home</h1>
            <p className="text-sm text-grey-500">Review past sessions, spot trends, and keep pushing your form score higher.</p>
          </div>
        </div>

        <Link href="/analyze">
          <Button size="lg">
            Analyze a new set
            <ArrowRightIcon size={20} />
          </Button>
        </Link>
      </div>

      {error ? <Badge variant="error">{error}</Badge> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total sessions", value: totalSessions },
          { label: "Average score", value: averageScore },
          { label: "Best score", value: bestScore },
        ].map((stat) => (
          <Card key={stat.label} className="space-y-2">
            <p className="text-sm text-grey-500">{stat.label}</p>
            <p className="text-3xl font-medium text-charcoal-200">{stat.value}</p>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <Card className="flex min-h-[220px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-charcoal-300">
            <Spinner />
            Loading session history
          </div>
        </Card>
      ) : (
        <>
          <ProgressChart sessions={sessions} />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-medium text-charcoal-300">Recent sessions</h2>
              <p className="text-sm text-grey-500">Every analysis is saved so you can see what keeps improving and what still needs work. Open any card for the full breakdown.</p>
            </div>

            {sessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <Card className="space-y-3 text-center">
                <h3 className="text-base font-medium text-charcoal-300">No sessions yet</h3>
                <p className="text-sm text-grey-500">Run your first analysis to start a history of scores, cues, and improvements.</p>
                <div className="flex justify-center">
                  <Link href="/analyze">
                    <Button size="sm">Start analyzing</Button>
                  </Link>
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
