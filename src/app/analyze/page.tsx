// FILE: src/app/analyze/page.tsx
import { redirect } from "next/navigation";

import { AnalyzeExperience } from "@/components/analyze/AnalyzeExperience";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyzePage() {
  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title="Supabase setup required"
        description="Add your Supabase URL and publishable key before using the analysis workflow."
        actionHref="/"
        actionLabel="Back to home"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AnalyzeExperience />;
}
