import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, getServiceRoleKey } from "./env";

/**
 * Server Supabase client for use in Server Components, Route Handlers and
 * Server Actions. Reads/writes the auth cookie so the user's session and
 * RLS context carry through.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies can't be mutated.
          // Middleware refreshes the session on every request, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Admin client using the service role key. Bypasses RLS entirely — only use
 * it inside Route Handlers, after confirming the caller is an admin, for the
 * specific actions that genuinely need elevated privileges (inviting a team
 * member, confirming a permanent deletion, writing to the audit log on the
 * caller's behalf). Never import this into client code.
 */
export function createAdminClient() {
  return createPlainClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
