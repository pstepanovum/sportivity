// FILE: src/app/(auth)/signup/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Badge, Button, Card, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { createAuthCallbackUrl, hasSupabaseEnv } from "@/lib/supabase/config";
import { getSupabaseAuthErrorMessage } from "@/lib/supabase/errors";

export default function SignupPage() {
  const router = useRouter();
  const hasEnv = hasSupabaseEnv();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!hasEnv) {
        throw new Error("Supabase environment variables are not configured in this deployment yet.");
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: createAuthCallbackUrl(window.location.origin),
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.push("/analyze");
        router.refresh();
        return;
      }

      setMessage("Account created. Check your inbox to verify your email before signing in.");
    } catch (err) {
      setError(
        getSupabaseAuthErrorMessage(
          err instanceof Error ? { message: err.message } : (err as { code?: string; message?: string } | null),
          "Unable to create account.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <Card className="space-y-5">
        <div className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo variant="black" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-medium text-charcoal-200">Create your account</h1>
          <p className="text-sm text-grey-500">Start storing scores, sessions, and form cues from every workout.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <Input
            id="full-name"
            label="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Jordan Lee"
            required
          />
          <Input
            id="signup-email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            id="signup-password"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a secure password"
            required
          />

          {error ? <Badge variant="error">{error}</Badge> : null}
          {message ? <Badge variant="success">{message}</Badge> : null}

          <Button type="submit" className="w-full" loading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-grey-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-charcoal-300">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
