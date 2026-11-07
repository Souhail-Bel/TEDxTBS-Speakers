"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { TedxLogo } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/client";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "link_invalid"
      ? "That link has expired or was already used. Ask an admin to send a new one, or use “Forgot your password” below."
      : null
  );
  const [forgotSent, setForgotSent] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError("Please check the “I'm not a robot” box.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        recaptchaRef.current?.reset();
        setLoading(false);
        return;
      }

      window.location.assign(next);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      recaptchaRef.current?.reset();
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError("Couldn't send the reset email. Double-check the address and try again.");
      return;
    }
    setForgotSent(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10">
      {/* Subtle Stage Photography Backdrop */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/images/hero-stage.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#080808]/65 via-[#080808]/85 to-[#080808]"
        aria-hidden="true"
      />
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
        <div className="mb-7 flex flex-col items-center text-center">
          <TedxLogo className="flex flex-col items-center" />
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[#A6A0A0]">
            Speakers Management Platform
          </p>
        </div>

        <div className="tedx-table-shell rounded-2xl p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777070]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@tedxtbs.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777070]" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                {RECAPTCHA_SITE_KEY && (
                  <div className="flex justify-center pt-1">
                    <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} theme="dark" />
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/12 px-3.5 py-2.5 text-xs text-[#FF8590]"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {loading ? "Signing in…" : "Sign in to TEDxTBS"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("forgot");
                  }}
                  className="w-full text-center text-xs text-[#8A8282] transition-colors hover:text-[#FF5C6C]"
                >
                  Forgot your password?
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="forgot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {forgotSent ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-[#F5F5F5]">
                      If that email belongs to an account, a reset link is on its way. Check your
                      inbox (and spam folder).
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setMode("login");
                        setForgotSent(false);
                      }}
                    >
                      Back to sign in
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-xs leading-relaxed text-[#A6A0A0]">
                      Enter your coordinator email and we&apos;ll send a link to reset your password.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@tedxtbs.com"
                      />
                    </div>

                    {error && (
                      <p className="rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/12 px-3.5 py-2.5 text-xs text-[#FF8590]">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full" loading={loading}>
                      {loading ? "Sending…" : "Send reset link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="flex w-full items-center justify-center gap-1.5 text-xs text-[#8A8282] transition-colors hover:text-[#FF5C6C]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-[#6E6666]">
          Internal platform for the TEDxTBS Curation &amp; Speaker Relations team.
        </p>
      </motion.div>
    </div>
  );
}
