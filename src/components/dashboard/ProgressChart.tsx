// FILE: src/components/dashboard/ProgressChart.tsx
import type { Database } from "@/types/supabase";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

interface ProgressChartProps {
  sessions: SessionRow[];
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const ordered = [...sessions].sort((a, b) => {
    const left = new Date(a.created_at ?? 0).getTime();
    const right = new Date(b.created_at ?? 0).getTime();
    return left - right;
  });

  const width = 640;
  const height = 260;
  const padding = { top: 24, right: 20, bottom: 36, left: 20 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const points = ordered.map((session, index) => {
    const x = padding.left + (ordered.length === 1 ? plotWidth / 2 : (index / (ordered.length - 1)) * plotWidth);
    const y = padding.top + (1 - session.score / 100) * plotHeight;
    return { x, y, score: session.score, created_at: session.created_at ?? new Date().toISOString() };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-medium text-charcoal-300">Score over time</h2>
        <p className="text-sm text-grey-500">Watch how your form score changes as you log more sessions.</p>
      </div>

      {points.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
            {[25, 50, 75].map((line) => {
              const y = padding.top + (1 - line / 100) * plotHeight;
              return (
                <g key={line}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e0e0e0" strokeDasharray="4 6" />
                  <text x={width - padding.right} y={y - 6} fill="#999999" fontSize="11" textAnchor="end">
                    {line}
                  </text>
                </g>
              );
            })}

            <path d={path} fill="none" stroke="#7161ef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((point) => (
              <g key={`${point.created_at}-${point.score}`}>
                <circle cx={point.x} cy={point.y} r="5" fill="#7161ef" />
                <circle cx={point.x} cy={point.y} r="10" fill="rgba(113, 97, 239, 0.16)" />
              </g>
            ))}

            <text x={padding.left} y={height - 10} fill="#999999" fontSize="11">
              {formatDate(ordered[0]?.created_at ?? new Date())}
            </text>
            <text x={width - padding.right} y={height - 10} fill="#999999" fontSize="11" textAnchor="end">
              {formatDate(ordered[ordered.length - 1]?.created_at ?? new Date())}
            </text>
          </svg>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-silver-700 bg-white_smoke-800 p-6 text-sm text-grey-500">
          Run your first analysis to start building a progress line.
        </div>
      )}
    </Card>
  );
}
