"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const denied = params.get("denied") === "1";
  const redirect = params.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7">
          <h1 className="font-display text-2xl text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Manage products, orders and discounts.
          </p>

          {denied && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-clay/10 px-3 py-2.5 text-sm text-clay">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              This account is not authorised for admin access.
            </p>
          )}

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-clay">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : (
                <>
                  <Lock className="h-4 w-4" /> Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LoginForm />
    </Suspense>
  );
}
