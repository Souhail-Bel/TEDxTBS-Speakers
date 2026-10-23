import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side landing point for every Supabase auth email link (invite,
 * password recovery, etc.). The app's Supabase clients run PKCE flow
 * (@supabase/ssr's default), which Supabase's default email templates
 * — built around `{{ .ConfirmationURL }}` — don't produce links for. So
 * each email template is pointed here instead (see README), and this route
 * verifies the token server-side with `verifyOtp`, which writes the session
 * into cookies via the server client. By the time the browser lands on
 * `next`, it already has a real session — no client-side URL parsing needed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const redirectUrl = next.startsWith("http") ? next : new URL(next, origin).toString();
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Invalid, expired, or already-used link.
  const url = new URL("/login", origin);
  url.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(url);
}