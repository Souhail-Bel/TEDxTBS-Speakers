import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRecaptcha } from "@/lib/auth/recaptcha";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const recaptchaToken = typeof body?.recaptchaToken === "string" ? body.recaptchaToken : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return NextResponse.json(
      { error: "The “I'm not a robot” check didn't go through. Please try again." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: "That email and password don't match. Double-check and try again." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
