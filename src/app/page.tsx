"use client";

import { ShieldLogo } from "@/components/ShieldLogo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getSupabase() {
  if (typeof window === "undefined") return null;
  return createClient();
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: trimmedEmail, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("anonymous")) {
        setError(
          "Sign up failed. In Supabase Dashboard go to Authentication → Providers → Email and ensure “Enable Email Signup” is on."
        );
      } else {
        setError(error.message);
      }
      return;
    }
    if (data?.user && !data.user.identities?.length) {
      setError("An account with this email already exists. Sign in instead.");
      return;
    }
    if (data?.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Check your email to confirm your account.");
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    const supabase = getSupabase();
    if (!supabase) return;
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (data?.url) window.location.href = data.url;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f6f8] px-4 py-8 sm:py-12">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-10">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3a5f]">
            <ShieldLogo size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-[#111827]">
              Aegis
            </h1>
            <p className="mt-1 text-[0.8125rem] text-[#6b7280]">Ticket system</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-[#fef2f2] px-4 py-3 text-[0.8125rem] text-[#b91c1c]">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[0.8125rem] font-medium text-[#374151]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 text-[0.9375rem] text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:bg-white focus:outline-none"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-[0.8125rem] font-medium text-[#374151]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 text-[0.9375rem] text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:bg-white focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-[#1e3a5f] text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#2d4a6f] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white text-[0.9375rem] font-medium text-[#374151] transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb] disabled:opacity-50"
          >
            Sign up
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[0.75rem] font-medium uppercase tracking-wider text-[#9ca3af]">or</span>
          <span className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white text-[0.9375rem] font-medium text-[#374151] transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb]"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white text-[0.9375rem] font-medium text-[#374151] transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb]"
          >
            Continue with Apple
          </button>
        </div>
      </div>
    </div>
  );
}
