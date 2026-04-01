// FILE: src/components/layout/AuthBrand.tsx
import Link from "next/link";
import Image from "next/image";

import { BrandLogo } from "@/components/layout/BrandLogo";

export function AuthBrand() {
  return (
    <Link href="/" className="flex flex-col items-center gap-3">
      <Image
        src="/favicon/favicon.svg"
        alt="Sportivity icon"
        width={40}
        height={40}
        priority
        className="h-9 w-9"
      />
      <BrandLogo variant="black" className="h-4 w-auto" priority />
    </Link>
  );
}
