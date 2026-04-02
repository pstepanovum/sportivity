// FILE: src/components/layout/ProfileMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { GearIcon } from "@phosphor-icons/react/dist/csr/Gear";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import { Avatar, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  avatarUrl?: string | null;
  email?: string;
  isSigningOut?: boolean;
  name?: string | null;
  onSignOut: () => void | Promise<void>;
  variant?: "desktop" | "mobile";
}

export function ProfileMenu({
  avatarUrl,
  email,
  isSigningOut = false,
  name,
  onSignOut,
  variant = "desktop",
}: ProfileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = variant === "mobile";

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => () => clearCloseTimeout(), []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={isMobile ? undefined : openMenu}
      onMouseLeave={isMobile ? undefined : scheduleCloseMenu}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          clearCloseTimeout();
          setIsOpen((current) => !current);
        }}
        onFocus={openMenu}
        className="rounded-full focus-visible:ring-2 focus-visible:ring-medium_slate_blue-500 focus-visible:ring-offset-2"
      >
        <Avatar
          name={name ?? email}
          src={avatarUrl}
          className={cn(
            "transition-colors",
            isMobile
              ? "h-9 w-9 border border-silver-700 bg-transparent text-xs font-medium text-charcoal-300"
              : "h-11 w-11",
            isOpen && !avatarUrl && "bg-medium_slate_blue-500 text-white",
          )}
        />
      </button>

      {isMobile ? (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-charcoal-100/10 transition-opacity",
              isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className={cn(
              "fixed inset-x-6 z-50 transition-all",
              isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
            )}
            style={{ bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 4.75rem)" }}
          >
            <div className="rounded-[1.75rem] border border-silver-800 bg-white p-4" role="menu">
              <div className="space-y-1">
                <p className="text-sm font-medium text-charcoal-300">{name ?? "Athlete"}</p>
                <p className="text-xs text-grey-600">{email}</p>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-silver-800 pt-4">
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <GearIcon size={18} />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={isSigningOut}
                  onClick={() => void onSignOut()}
                  className="w-full justify-start"
                >
                  <SignOutIcon size={18} />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className={cn(
            "absolute right-0 top-full z-50 w-[240px] pt-3 transition-all",
            isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
          )}
        >
          <div className="rounded-2xl border border-silver-800 bg-white p-4" role="menu">
            <div className="space-y-1">
              <p className="text-sm font-medium text-charcoal-300">{name ?? "Athlete"}</p>
              <p className="text-xs text-grey-600">{email}</p>
            </div>

            <div className="mt-4 border-t border-silver-800 pt-4">
              <Button
                variant="ghost"
                size="sm"
                loading={isSigningOut}
                onClick={() => void onSignOut()}
                className="w-full justify-start"
              >
                <SignOutIcon size={18} />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
