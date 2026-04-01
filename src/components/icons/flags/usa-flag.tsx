// FILE: src/components/icons/flags/usa-flag.tsx
import { cn } from "@/lib/utils";

export function USAFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      aria-hidden="true"
      className={cn("h-2 w-3 overflow-hidden rounded-[2px]", className)}
    >
      <rect width="24" height="16" fill="#ffffff" />
      <rect width="24" height="1.23" y="0" fill="#b22234" />
      <rect width="24" height="1.23" y="2.46" fill="#b22234" />
      <rect width="24" height="1.23" y="4.92" fill="#b22234" />
      <rect width="24" height="1.23" y="7.38" fill="#b22234" />
      <rect width="24" height="1.23" y="9.84" fill="#b22234" />
      <rect width="24" height="1.23" y="12.3" fill="#b22234" />
      <rect width="24" height="1.23" y="14.76" fill="#b22234" />
      <rect width="10.5" height="8.62" fill="#3c3b6e" />
      <g fill="#ffffff">
        <circle cx="1.4" cy="1.35" r="0.35" />
        <circle cx="3.5" cy="1.35" r="0.35" />
        <circle cx="5.6" cy="1.35" r="0.35" />
        <circle cx="7.7" cy="1.35" r="0.35" />
        <circle cx="9.1" cy="2.45" r="0.35" />
        <circle cx="1.4" cy="3.55" r="0.35" />
        <circle cx="3.5" cy="3.55" r="0.35" />
        <circle cx="5.6" cy="3.55" r="0.35" />
        <circle cx="7.7" cy="3.55" r="0.35" />
        <circle cx="9.1" cy="4.65" r="0.35" />
        <circle cx="1.4" cy="5.75" r="0.35" />
        <circle cx="3.5" cy="5.75" r="0.35" />
        <circle cx="5.6" cy="5.75" r="0.35" />
        <circle cx="7.7" cy="5.75" r="0.35" />
        <circle cx="9.1" cy="6.85" r="0.35" />
      </g>
    </svg>
  );
}
