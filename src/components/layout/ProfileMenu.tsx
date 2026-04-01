// FILE: src/components/layout/ProfileMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import { Avatar, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  email?: string;
  isSigningOut?: boolean;
  name?: string | null;
  onSignOut: () => void | Promise<void>;
}

export function ProfileMenu({ email, isSigningOut = false, name, onSignOut }: ProfileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full focus-visible:ring-2 focus-visible:ring-medium_slate_blue-500 focus-visible:ring-offset-2"
      >
        <Avatar
          name={name ?? email}
          className={cn(
            "h-11 w-11 transition-colors",
            isOpen && "bg-medium_slate_blue-500 text-white",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-3 w-[240px] rounded-2xl border border-silver-800 bg-white p-4 transition-all",
          isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
        role="menu"
      >
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
  );
}
