// FILE: src/components/analyze/AnalyzeButton.tsx
"use client";

import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";

import { Button } from "@/components/ui";
import type { AnalysisStatus } from "@/types/analysis";

interface AnalyzeButtonProps {
  status: AnalysisStatus;
  disabled?: boolean;
  onClick: () => void;
}

const LABELS: Record<AnalysisStatus, string> = {
  idle: "Analyze my form",
  extracting: "Sampling frames",
  analyzing: "Coaching your rep",
  done: "Analyze again",
  error: "Try analysis again",
};

export function AnalyzeButton({ status, disabled, onClick }: AnalyzeButtonProps) {
  const isLoading = status === "extracting" || status === "analyzing";

  return (
    <Button type="button" size="lg" className="w-full" onClick={onClick} disabled={disabled} loading={isLoading}>
      {!isLoading ? <LightningIcon size={20} weight="fill" /> : null}
      {LABELS[status]}
    </Button>
  );
}
