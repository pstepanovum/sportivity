// FILE: src/components/ui/Button.tsx
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-medium_slate_blue-500 text-white hover:bg-medium_slate_blue-400 active:bg-medium_slate_blue-300",
  secondary:
    "bg-silver-800 text-charcoal-300 hover:bg-silver-700 active:bg-silver-600",
  ghost:
    "bg-transparent text-charcoal-400 hover:bg-white_smoke-600 active:bg-white_smoke-500",
  danger:
    "bg-signal_red-500 text-white hover:bg-signal_red-400 active:bg-signal_red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-4 text-sm gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-medium_slate_blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  ),
);

Button.displayName = "Button";
