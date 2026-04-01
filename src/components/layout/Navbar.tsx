// FILE: src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Button } from "@/components/ui";
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

  const navLinks =
    user || pathname.startsWith("/dashboard") || pathname.startsWith("/analyze")
      ? [
          { href: "/", label: "Home" },
          { href: "/analyze", label: "Analyze" },
        ]
      : [];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/dashboard");
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-85" aria-label="Sportivity home">
            <BrandLogo variant="black" className="h-4 w-auto sm:h-5" priority />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={cn(
                  "text-sm transition-colors",
                  isLinkActive(link.href) ? "text-charcoal-200" : "text-grey-500 hover:text-charcoal-300",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <ProfileMenu
                name={user.name}
                email={user.email}
                isSigningOut={isSigningOut}
                onSignOut={handleSignOut}
              />
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

        <nav className={cn("gap-2 overflow-x-auto pb-4 md:hidden", navLinks.length > 0 ? "flex" : "hidden")}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={cn(
                "inline-flex min-w-max items-center rounded-full px-3 py-2 text-sm transition-colors",
                isLinkActive(link.href)
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
