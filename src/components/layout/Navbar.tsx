// FILE: src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Avatar, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

interface UserState {
  email?: string;
  name?: string | null;
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Analyze" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hasEnv = hasSupabaseEnv();

  useEffect(() => {
    if (!hasEnv) {
      return;
    }

    const supabase = createClient();
    let previousUserId: string | null = null;

    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
        startTransition(() => {
          router.refresh();
        });
        return;
      }

      if (event === "SIGNED_OUT") {
        previousUserId = null;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hasEnv]);

  const handleSignOut = async () => {
    if (!hasEnv) {
      return;
    }

    const supabase = createClient();
    setIsSigningOut(true);
    await supabase.auth.signOut();
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
    setIsSigningOut(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-85" aria-label="Sportivity home">
            <BrandLogo variant="black" className="h-4 w-auto sm:h-5" priority />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href ? "text-charcoal-200" : "text-grey-500 hover:text-charcoal-300",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-3 sm:flex">
                  <Avatar name={user.name ?? user.email} />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-charcoal-300">{user.name ?? "Athlete"}</p>
                    <p className="text-xs text-grey-600">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void handleSignOut()} loading={isSigningOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={cn(
                "inline-flex min-w-max items-center rounded-full px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-white/80 text-charcoal-200"
                  : "bg-white/50 text-grey-500 hover:bg-white/70 hover:text-charcoal-300",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
