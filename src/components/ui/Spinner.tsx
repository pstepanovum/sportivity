// FILE: src/components/ui/Spinner.tsx
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-silver-700 border-t-medium_slate_blue-500",
        className,
      )}
    />
  );
}
