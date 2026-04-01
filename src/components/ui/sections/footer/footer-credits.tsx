// FILE: src/components/ui/sections/footer/footer-credits.tsx
import { USAFlag } from "@/components/icons/flags/usa-flag";

export function FooterCredits() {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 bg-white_smoke-700/80 px-6 py-2 md:py-1.5">
      <span className="text-xs text-grey-500">Designed by</span>
      <a
        href="https://pstepanov.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-charcoal-300 transition-opacity hover:opacity-70"
      >
        Pavel Stepanov
      </a>
      <USAFlag className="h-2 w-3" />
    </div>
  );
}
