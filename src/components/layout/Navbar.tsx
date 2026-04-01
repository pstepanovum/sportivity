// FILE: src/components/layout/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Avatar, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

interface UserState {
  email?: string;
  name?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hasEnv = hasSupabaseEnv();

  useEffect(() => {
    if (!hasEnv) return;

    const supabase = createClient();
    let previousUserId: string | null = null;

    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      previousUserId = currentUser?.id ?? null;
      setUser(
        currentUser
          ? {
              email: currentUser.email,
              name: (currentUser.user_metadata.full_name as string | undefined) ?? currentUser.email ?? null,
            }
          : null,
      );
    };

    void loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(
        session?.user
          ? {
              email: session.user.email,
              name: (session.user.user_metadata.full_name as string | undefined) ?? session.user.email ?? null,
            }
          : null,
      );

      const nextUserId = session?.user?.id ?? null;

      if (event === "SIGNED_IN" && nextUserId && nextUserId !== previousUserId) {
        previousUserId = nextUserId;
        startTransition(() => router.refresh());
        return;
      }

      if (event === "SIGNED_OUT") previousUserId = null;
    });

    return () => subscription.unsubscribe();
  }, [hasEnv]);

  const handleSignOut = async () => {
    if (!hasEnv) return;
    const supabase = createClient();
    setIsSigningOut(true);
    await supabase.auth.signOut();
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
    setIsSigningOut(false);
  };

  const isAppPage =
    user || pathname.startsWith("/dashboard") || pathname.startsWith("/analyze");

  const isLinkActive = (href: string) => pathname.startsWith(href);
  const userLabel = user?.name ?? user?.email ?? "Athlete";

  // ─── Pill navbar (dashboard / analyze) ───────────────────────────────────

  if (isAppPage) {
    const appLinks = [
      { href: "/dashboard", label: "Home", icon: <ChartBarIcon size={20} /> },
      { href: "/analyze", label: "Analyze", icon: <LightningIcon size={22} weight="fill" /> },
    ];

    return (
      <>
        {/* ── Pill navbar — desktop only ── */}
        <header className="sticky top-0 z-50 hidden md:block pt-4 pb-2">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div className="flex w-full items-center justify-between rounded-full border border-silver-700 bg-white/90 px-2 py-1.5 backdrop-blur-md">
              {/* Left: favicon + links grouped together */}
              <div className="flex items-center gap-1">
                <Link
                  href="/dashboard"
                  aria-label="Sportivity home"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white_smoke-700"
                >
                  <Image src="/favicon/favicon.svg" alt="Sportivity" width={24} height={24} className="h-6 w-6" priority />
                </Link>

                <div className="mx-1 h-4 w-px bg-silver-700" />

                <nav className="flex items-center gap-0.5">
                  {appLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        isLinkActive(link.href)
                          ? "bg-silver-800 text-grey-400"
                          : "text-grey-500 hover:bg-white_smoke-700 hover:text-charcoal-300",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right: profile */}
              {user ? (
                <div className="flex items-center gap-2 pr-0.5">
                  <Avatar
                    name={userLabel}
                    className="h-8 w-8 border border-silver-700 bg-transparent text-xs font-medium text-charcoal-300"
                  />
                  <p className="max-w-[10rem] truncate text-sm font-medium text-charcoal-300">{userLabel}</p>
                  <Button variant="ghost" size="sm" loading={isSigningOut} onClick={() => void handleSignOut()} className="px-4">
                    Log out
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* ── Pill tab bar — mobile only, floating at bottom ── */}
        <div
          className="fixed bottom-0 inset-x-0 z-50 md:hidden px-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex w-full items-center justify-between rounded-full border border-silver-700 bg-white/90 px-2 py-1.5 backdrop-blur-md">
            <nav className="flex min-w-0 flex-1 items-center gap-0.5">
              {appLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className={cn(
                      "inline-flex min-w-0 flex-1 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-silver-800 text-grey-400"
                        : "text-grey-500 hover:bg-white_smoke-700 hover:text-charcoal-300",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <Avatar
                  name={userLabel}
                  className="h-8 w-8 shrink-0 border border-silver-700 bg-transparent text-xs font-medium text-charcoal-300"
                />
                <p className="hidden max-w-[5.5rem] truncate text-xs font-medium text-charcoal-300 min-[390px]:block">
                  {userLabel}
                </p>
                <Button variant="ghost" size="sm" loading={isSigningOut} onClick={() => void handleSignOut()} className="px-3">
                  Log out
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  // ─── Full-width navbar (landing page) ────────────────────────────────────

  const showAnnouncementBar = true;

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      {showAnnouncementBar ? (
        <div className="bg-medium_slate_blue-500">
          <div className="mx-auto max-w-5xl px-6 py-2 text-center text-xs font-medium tracking-[0.01em] text-white">
            Built with Codex for sharper reps
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-6">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-85" aria-label="Sportivity home">
            <BrandLogo variant="black" className="h-4 w-auto sm:h-5" priority />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
