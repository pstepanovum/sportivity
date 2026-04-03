// FILE: src/components/ui/sections/footer/footer-credits.tsx
import { USAFlag } from "@/components/icons/flags/usa-flag";

export function FooterCredits() {
  return (
    <div className="border-t border-silver-800 px-6 pt-4">
      <div className="flex justify-center overflow-visible">
        <div className="relative inline-flex overflow-visible text-silver-800">
          <svg
            aria-hidden="true"
            viewBox="0 0 74 59"
            className="pointer-events-none absolute bottom-0 right-[calc(100%-1px)] h-[48px] w-[62px]"
            fill="currentColor"
          >
            <path d="M74,59V57H0v2Zm0-2V0h0A36.611,36.611,0,0,0,41.134,20.43L33.2,36.569A37.109,37.109,0,0,1,0,57Z" />
          </svg>

          <div className="relative flex min-h-12 items-center gap-1.5 bg-silver-800 px-5 py-2.5">
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

          <svg
            aria-hidden="true"
            viewBox="0 0 74 59"
            className="pointer-events-none absolute bottom-0 left-[calc(100%-1px)] h-[48px] w-[62px]"
            fill="currentColor"
          >
            <path d="M0,59V57H74v2Zm0-2V0H0A36.611,36.611,0,0,1,32.866,20.43L40.8,36.569A37.109,37.109,0,0,0,74,57Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
