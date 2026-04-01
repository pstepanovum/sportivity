// FILE: src/components/ui/Badge.tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "brand";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-silver-800 text-charcoal-400",
  success: "bg-wisteria-900 text-wisteria-200",
  warning: "bg-powder_petal-800 text-powder_petal-200",
  error: "bg-powder_petal-700 text-powder_petal-100",
  brand: "bg-medium_slate_blue-900 text-medium_slate_blue-300",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
