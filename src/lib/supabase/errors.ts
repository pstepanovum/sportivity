// FILE: src/lib/supabase/errors.ts
interface SupabaseLikeError {
  code?: string | null;
  message?: string | null;
  status?: number;
}

export function getSupabaseAuthErrorMessage(error: SupabaseLikeError | null | undefined, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (error.code === "over_email_send_rate_limit") {
    return "Too many emails were sent recently. Wait a bit, then try again.";
  }

  if (error.code === "email_address_not_authorized") {
    return "This email address is not authorized for this project yet.";
  }

  if (error.message?.toLowerCase().includes("email rate limit exceeded")) {
    return "Too many emails were sent recently. Wait a bit, then try again.";
  }

  if (error.message?.toLowerCase().includes("user already registered")) {
    return "That email already has an account. Try signing in instead.";
  }

  if (error.message?.toLowerCase().includes("email not confirmed")) {
    return "Verify your email first, then sign in.";
  }

  return error.message ?? fallback;
}
