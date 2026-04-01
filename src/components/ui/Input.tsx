// FILE: src/components/ui/Input.tsx
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-charcoal-300">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-full border bg-white px-4 py-2.5 text-sm text-charcoal-300 transition-colors",
          "placeholder:text-grey-600 focus:border-medium_slate_blue-500",
          error ? "border-powder_petal-300 text-powder_petal-100" : "border-silver-700",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-powder_petal-300">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-grey-600">{hint}</p> : null}
    </div>
  ),
);

Input.displayName = "Input";
