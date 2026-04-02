// FILE: src/app/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/home/LandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  createBreadcrumbJsonLd,
  createOrganizationJsonLd,
  createPageMetadata,
  createSoftwareApplicationJsonLd,
  createWebsiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI fitness form coach for squat, deadlift, and push-up feedback",
  description:
    "Upload a workout video and get AI-powered form feedback, pose tracking, score breakdowns, session history, and voice coaching for squats, deadlifts, and push-ups.",
  path: "/",
});

export default async function HomePage() {
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
    <>
      <JsonLd data={createWebsiteJsonLd()} />
      <JsonLd data={createOrganizationJsonLd()} />
      <JsonLd data={createSoftwareApplicationJsonLd()} />
      <JsonLd data={createBreadcrumbJsonLd([{ name: "Home", path: "/" }])} />
      <LandingPage />
    </>
  );
}
