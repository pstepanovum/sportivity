// FILE: src/components/layout/Footer.tsx
import { FooterCredits } from "@/components/ui/sections/footer/footer-credits";

export function Footer() {
  return (
    <footer className="bg-transparent">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 pb-8 pt-2 text-sm text-grey-500 sm:grid sm:grid-cols-2 sm:gap-6">
        <p>Sportivity helps athletes capture lifts, review movement quality, and get fast AI coaching between sets.</p>
        <p className="sm:text-right">Upload, record, analyze, and track progress over time with form scores, cues, and session history.</p>
      </div>
      <FooterCredits />
    </footer>
  );
}
