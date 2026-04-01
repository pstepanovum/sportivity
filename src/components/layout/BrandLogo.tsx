// FILE: src/components/layout/BrandLogo.tsx
import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = {
  color: "/logo-color.svg",
  black: "/logo-black.svg",
  white: "/logo-white.svg",
} as const;

interface BrandLogoProps {
  variant?: keyof typeof LOGO_SRC;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ variant = "color", className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt="Sportivity"
      width={381}
      height={75}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
