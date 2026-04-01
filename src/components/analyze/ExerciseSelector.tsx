// FILE: src/components/analyze/ExerciseSelector.tsx
"use client";

import { BarbellIcon } from "@phosphor-icons/react/dist/csr/Barbell";
import { HandFistIcon } from "@phosphor-icons/react/dist/csr/HandFist";
import { PersonSimpleRunIcon } from "@phosphor-icons/react/dist/csr/PersonSimpleRun";

import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/analysis";

const EXERCISES: Array<{
  id: Exercise;
  label: string;
  Icon: typeof PersonSimpleRunIcon;
}> = [
  { id: "squat", label: "Squat", Icon: PersonSimpleRunIcon },
  { id: "deadlift", label: "Deadlift", Icon: BarbellIcon },
  { id: "pushup", label: "Push-up", Icon: HandFistIcon },
];

interface ExerciseSelectorProps {
  value: Exercise;
  onChange: (exercise: Exercise) => void;
}

export function ExerciseSelector({ value, onChange }: ExerciseSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {EXERCISES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors",
            value === id
              ? "border-medium_slate_blue-500 bg-medium_slate_blue-900 text-medium_slate_blue-300"
              : "border-silver-800 bg-white text-grey-500 hover:border-silver-600",
          )}
        >
          <Icon size={24} weight={value === id ? "fill" : "regular"} />
          {label}
        </button>
      ))}
    </div>
  );
}
