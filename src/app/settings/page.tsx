// FILE: src/app/settings/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsView } from "@/components/settings/SettingsView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { resolveCoachStyle, resolveCoachVoice } from "@/lib/openai/voice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Update your Sportivity display name and profile photo.",
};

export default async function SettingsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title="Settings setup required"
        description="The settings page needs your Supabase URL and publishable key so profile data can load correctly."
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsView
      userId={user.id}
      initialAvatarUrl={profile?.avatar_url ?? null}
      initialCoachStyle={resolveCoachStyle(user.user_metadata.coach_style)}
      initialCoachVoice={resolveCoachVoice(user.user_metadata.coach_voice)}
      initialEmail={user.email ?? ""}
      initialName={profile?.full_name ?? (user.user_metadata.full_name as string | undefined) ?? null}
    />
  );
}
