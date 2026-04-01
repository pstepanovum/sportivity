// FILE: src/lib/supabase/route.ts
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import type { Database } from "@/types/supabase";

export function createRouteClient(request: NextRequest, response: NextResponse) {
  let activeResponse = response;

  const supabase = createServerClient<Database, "public", Database["public"]>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value);
          activeResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, "");
          activeResponse.cookies.set(name, "", options);
        },
      },
    },
  );

  return {
    supabase,
    getResponse() {
      return activeResponse;
    },
  };
}
