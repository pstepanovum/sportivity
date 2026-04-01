// FILE: src/components/ui/ScoreRing.tsx
interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = Math.max(8, Math.round(size * 0.08));
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const color =
    score >= 80 ? "#7161ef" : score >= 60 ? "#b79ced" : score >= 40 ? "#efd9ce" : "#c37047";

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full bg-white"
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
            className="transition-all duration-700 ease-out"
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-medium tracking-[-0.04em] text-charcoal-300"
          style={{ fontSize: Math.max(20, Math.round(size * 0.24)) }}
        >
          {Math.round(normalizedScore)}
        </span>
        {size >= 84 ? (
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-grey-600">score</span>
        ) : null}
      </div>
    </div>
  );
}
