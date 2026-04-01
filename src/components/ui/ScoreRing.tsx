// FILE: src/components/ui/ScoreRing.tsx
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth: strokeWidthProp, className }: ScoreRingProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = strokeWidthProp ?? Math.max(5, Math.round(size * 0.07));
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const color =
    score >= 80 ? "#7161ef" : score >= 60 ? "#b79ced" : score >= 40 ? "#efd9ce" : "#c37047";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center rounded-full bg-white", className)}
      style={{ width: size, height: size }}
      aria-label={`Form score ${Math.round(normalizedScore)}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#ebe7eb" strokeWidth={strokeWidth} />
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring-fill"
            style={
              {
                "--ring-from": circumference,
                "--ring-to": offset,
              } as React.CSSProperties
            }
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-display font-medium tracking-[-0.04em] text-charcoal-300"
          style={{ fontSize: Math.max(18, Math.round(size * 0.24)) }}
        >
          {Math.round(normalizedScore)}
        </span>
        {size >= 84 ? (
          <span className="-mt-0.5 text-[10px] text-grey-600">score</span>
        ) : null}
      </div>
    </div>
  );
}
