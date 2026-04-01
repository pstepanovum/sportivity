// FILE: src/app/dashboard/page.tsx
import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title="Dashboard setup required"
        description="The dashboard needs your Supabase URL and publishable key so sessions and auth can load correctly."
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

  return <DashboardView />;
}
