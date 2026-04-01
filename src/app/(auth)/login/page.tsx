// FILE: src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Badge, Button, Card, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { createAuthCallbackUrl, hasSupabaseEnv } from "@/lib/supabase/config";
import { getSupabaseAuthErrorMessage } from "@/lib/supabase/errors";

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "We couldn't finish signing you in. Try the link again.",
  missing_auth_code: "That sign-in link is incomplete or expired.",
  otp_verification_failed: "We couldn't verify that email link. Request a fresh one.",
  supabase_not_configured: "Supabase isn't configured in this environment yet.",
};

export default function LoginPage() {
  const router = useRouter();
  const hasEnv = hasSupabaseEnv();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  useEffect(() => {
    const callbackError = new URLSearchParams(window.location.search).get("error");

    if (!callbackError) {
      return;
    }

    setError(CALLBACK_ERROR_MESSAGES[callbackError] ?? "We couldn't complete that sign-in request.");
  }, []);

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!hasEnv) {
        throw new Error("Supabase environment variables are not configured in this deployment yet.");
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/analyze");
      router.refresh();
    } catch (err) {
      setError(
        getSupabaseAuthErrorMessage(
          err instanceof Error ? { message: err.message } : (err as { code?: string; message?: string } | null),
          "Unable to sign in.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email first so we know where to send the link.");
      return;
    }

    if (!hasEnv) {
      setError("Supabase environment variables are not configured in this deployment yet.");
      return;
    }

    setIsMagicLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: createAuthCallbackUrl(window.location.origin),
        },
      });

      if (magicError) {
        throw magicError;
      }

      setMessage("Magic link sent. Open the email on this device to continue.");
    } catch (err) {
      setError(
        getSupabaseAuthErrorMessage(
          err instanceof Error ? { message: err.message } : (err as { code?: string; message?: string } | null),
          "Unable to send magic link.",
        ),
      );
    } finally {
      setIsMagicLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <Card className="space-y-5">
        <div className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo variant="black" className="h-6 w-auto" />
          </div>
          <h1 className="text-3xl font-medium text-charcoal-200">Welcome back</h1>
          <p className="text-sm text-grey-500">Sign in to review reps, save sessions, and track your progress.</p>
        </div>

        <form className="space-y-4" onSubmit={handlePasswordLogin}>
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />

          {error ? <Badge variant="error">{error}</Badge> : null}
          {message ? <Badge variant="success">{message}</Badge> : null}

          <div className="space-y-3">
            <Button type="submit" className="w-full" loading={isLoading}>
              Sign in
            </Button>
            <Button type="button" variant="ghost" className="w-full" loading={isMagicLoading} onClick={() => void handleMagicLink()}>
              Or continue with magic link
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-grey-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-charcoal-300">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
