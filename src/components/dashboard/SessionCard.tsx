// FILE: src/components/dashboard/SessionCard.tsx
import Link from "next/link";

import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import type { Database } from "@/types/supabase";
import type { AnalysisFeedback } from "@/types/analysis";
import { Badge, Card, ScoreRing } from "@/components/ui";
import { exerciseLabel, exerciseTint, formatDate, scoreBadgeVariant, scoreLabel } from "@/lib/utils";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

interface SessionCardProps {
  session: SessionRow;
}

export function SessionCard({ session }: SessionCardProps) {
  const feedback = (session.feedback as AnalysisFeedback | null) ?? null;
  const topErrors = feedback?.errors?.slice(0, 2) ?? [];

  return (
    <Link href={`/dashboard/${session.id}`} prefetch={false} className="block">
      <Card className="space-y-4 transition-colors hover:border-medium_slate_blue-500">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge className={exerciseTint(session.exercise)}>{exerciseLabel(session.exercise)}</Badge>
            <p className="text-sm text-grey-500">{formatDate(session.created_at ?? new Date())}</p>
          </div>
          <Badge variant={scoreBadgeVariant(session.score)}>{scoreLabel(session.score)}</Badge>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-4xl font-medium text-medium_slate_blue-500">{session.score}</p>
            <p className="text-sm text-grey-500">Form score</p>
          </div>
          <div className="rounded-full border border-silver-800 bg-white_smoke-800 p-1">
            <ScoreRing score={session.score} size={64} strokeWidth={5} />
          </div>
        </div>

        <div className="space-y-2 border-t border-silver-800 pt-4">
          <h3 className="text-base font-medium text-charcoal-300">Top fixes</h3>
          {topErrors.length > 0 ? (
            topErrors.map((item) => (
              <p key={`${item.joint}-${item.issue}`} className="text-sm text-grey-500">
                <span className="font-medium text-charcoal-300">{item.joint}:</span> {item.issue}
              </p>
            ))
          ) : (
            <p className="text-sm text-grey-500">No major faults were stored for this session.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-silver-800 pt-4 text-sm text-medium_slate_blue-500">
          <span className="font-medium">Session breakdown</span>
          <CaretRightIcon size={18} />
        </div>
      </Card>
    </Link>
  );
}
