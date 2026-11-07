"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { TedxLogo } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The Supabase client auto-detects the recovery/invite token from the
    // URL hash on load and exchanges it for a session.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      if (!data.session) {
        setError(
          "This link has expired or was already used. Ask an admin to send a new one, or use “Forgot your password” on the sign-in page."
        );
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Couldn't set your password. Please try again.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 1200);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4">
      <div
        className="pointer-events-none fixed -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(227,27,43,0.22) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[390px]"
      >
        <div className="mb-6 flex justify-center">
          <TedxLogo className="flex flex-col items-center" />
        </div>

        <div className="tedx-table-shell rounded-2xl p-6 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF3B4E]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#F5F5F5]">
                {isWelcome ? "Welcome to TEDxTBS" : "Reset your password"}
              </h1>
              <p className="text-xs text-[#8A8282]">
                {isWelcome
                  ? "Set a password to finish activating your coordinator account."
                  : "Choose a secure new password."}
              </p>
            </div>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
              <p className="text-sm font-medium text-[#F5F5F5]">
                Password saved. Entering dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  disabled={!ready}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  disabled={!ready}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/12 px-3.5 py-2.5 text-xs text-[#FF8590]">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" loading={loading} disabled={!ready}>
                {loading ? "Saving…" : "Set password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
