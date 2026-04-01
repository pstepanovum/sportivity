// FILE: src/components/ui/Ticker.tsx
"use client";

import type { ReactNode } from "react";

interface TickerItem {
  label: string;
  icon?: ReactNode;
}

interface TickerProps {
  text?: string;
  items?: TickerItem[];
  speed?: number;
  copies?: number;
  reverse?: boolean;
  className?: string;
}

export const Ticker = ({
  text,
  items,
  speed = 30,
  copies = 8,
  reverse = false,
  className = "",
}: TickerProps) => {
  const sequence = items && items.length > 0 ? items : text ? [{ label: text }] : [];

  return (
    <div
      className={`relative z-10 w-full overflow-hidden rounded-full border border-silver-800 bg-white_smoke-800 py-1.5 ${className}`}
    >
      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite` }}
      >
        {Array.from({ length: copies }).map((_, copyIndex) => (
          <div key={copyIndex} className="flex items-center">
            {sequence.map((item, itemIndex) => (
              <span
                key={`${copyIndex}-${item.label}-${itemIndex}`}
                className="mx-2.5 inline-flex items-center gap-1 whitespace-nowrap font-mono text-[10px] tracking-[0.06em] text-grey-500"
              >
                {item.icon ? <span className="text-medium_slate_blue-500">{item.icon}</span> : null}
                {item.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
