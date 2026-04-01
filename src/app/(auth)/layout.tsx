// FILE: src/app/(auth)/layout.tsx
import { redirect } from "next/navigation";

import { AuthBrand } from "@/components/layout/AuthBrand";
import { AuthDotBackground } from "@/components/layout/AuthDotBackground";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AuthDotBackground />

      <div className="bg-medium_slate_blue-500 relative z-10">
        <div className="mx-auto max-w-5xl px-6 py-2 text-center text-xs font-medium tracking-[0.01em] text-white">
          Built with Codex for sharper reps
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <AuthBrand />
        </div>
        {children}
      </div>
    </div>
  );
}
