// FILE: src/components/layout/Footer.tsx
import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-transparent">
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-2">
        <div className="rounded-[2rem] bg-charcoal-200 px-6 py-7 text-silver-700">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md space-y-3">
              <Link href="/" className="inline-flex transition-opacity hover:opacity-85" aria-label="Sportivity home">
                <BrandLogo variant="white" className="h-8 w-auto" />
              </Link>
              <p className="text-sm text-silver-700">Sportivity helps athletes review form with fast, actionable AI coaching.</p>
            </div>

            <div className="space-y-1 text-sm text-silver-700 md:text-right">
              <p>Built for cleaner reps, smarter training, and steady progress.</p>
              <p>Upload, record, analyze, improve.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
