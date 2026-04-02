// FILE: src/app/settings/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsView } from "@/components/settings/SettingsView";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveCoachStyle, resolveCoachVoice } from "@/lib/openai/voice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createBreadcrumbJsonLd, createPageMetadata, PRIVATE_PAGE_ROBOTS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPageMetadata({
  title: "Settings",
  description: "Update your Sportivity profile, coaching voice, coach vibe, and avatar settings.",
  path: "/settings",
  robots: PRIVATE_PAGE_ROBOTS,
});

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
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/dashboard" },
          { name: "Settings", path: "/settings" },
        ])}
      />
      <SettingsView
        userId={user.id}
        initialAvatarUrl={profile?.avatar_url ?? null}
        initialCoachStyle={resolveCoachStyle(user.user_metadata.coach_style)}
        initialCoachVoice={resolveCoachVoice(user.user_metadata.coach_voice)}
        initialEmail={user.email ?? ""}
        initialName={profile?.full_name ?? (user.user_metadata.full_name as string | undefined) ?? null}
      />
    </>
  );
}
