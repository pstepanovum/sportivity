// FILE: src/components/ui/Card.tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-2xl border border-silver-800 bg-white p-6", className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardDivider() {
  return <div className="my-4 border-t border-silver-800" />;
}
