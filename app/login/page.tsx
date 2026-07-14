"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const demoAccounts = [
  { label: "Student", email: "student@codementor.ai", password: "Password123!", color: "from-emerald-500 to-teal-600", emoji: "🎓" },
  { label: "Mentor", email: "mentor@codementor.ai", password: "Password123!", color: "from-amber-500 to-orange-600", emoji: "👨‍🏫" },
  { label: "Admin", email: "admin@codementor.ai", password: "Password123!", color: "from-indigo-500 to-purple-600", emoji: "⚙️" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Login failed.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLogin(email, password);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Animated background orbs */}
      <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" style={{ animationDuration: "6s" }} />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDuration: "8s", animationDelay: "1s" }} />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-pulse rounded-full bg-cyan-500/5 blur-3xl" style={{ animationDuration: "10s", animationDelay: "2s" }} />

      {/* Background image overlay */}
      <div className="absolute inset-0 bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/40 to-slate-900" />

      {/* Floating decorative elements */}
      <div className="absolute left-12 top-1/4 hidden h-3 w-3 rounded-full bg-indigo-400/20 sm:block animate-float" />
      <div className="absolute right-16 top-1/3 hidden h-2 w-2 rounded-full bg-purple-400/20 sm:block animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/4 hidden h-4 w-4 rounded-full bg-cyan-400/10 sm:block animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute right-1/3 top-1/5 hidden h-2 w-2 rounded-full bg-emerald-400/20 sm:block animate-float" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Glowing border card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent p-[1px] shadow-2xl shadow-indigo-500/20">
          <div className="rounded-3xl bg-slate-900/80 p-4 sm:p-8 backdrop-blur-2xl">
            {/* Animated gradient ring behind logo */}
            <div className="absolute left-1/2 top-12 -translate-x-1/2">
              <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-xl" style={{ animationDuration: "4s" }} />
            </div>

            <div className="relative text-center">
              <div className="relative mx-auto mb-5 flex h-18 w-18 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-md" style={{ animationDuration: "3s" }} />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-2xl shadow-indigo-500/40 ring-1 ring-white/20">
                  C
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-xl sm:text-2xl font-bold text-transparent">
                Welcome to CodeMentor AI
              </h1>
              <p className="mt-2 text-sm text-indigo-200/60">
                AI-powered code review learning platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" aria-label="Login form">
              {error ? (
                <div className="animate-slide-in-right rounded-xl border border-red-400/30 bg-gradient-to-r from-red-500/10 to-red-600/5 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
                  {error}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-indigo-200/80">
                  Email address
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative w-full rounded-xl border border-indigo-400/20 bg-white/5 px-4 py-3.5 text-sm font-medium text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-indigo-300/30 hover:border-indigo-400/30 focus:border-indigo-400/60 focus:bg-indigo-500/5 focus:ring-2 focus:ring-indigo-400/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-indigo-200/80">
                  Password
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="relative w-full rounded-xl border border-indigo-400/20 bg-white/5 px-4 py-3.5 text-sm font-medium text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-indigo-300/30 hover:border-indigo-400/30 focus:border-indigo-400/60 focus:bg-indigo-500/5 focus:ring-2 focus:ring-indigo-400/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                <span className="relative">{loading ? "Signing in…" : "Sign in to dashboard"}</span>
              </button>
            </form>

            <div className="mt-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-indigo-300/50">
                  <span>⚡</span> Quick Access
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.label}
                    onClick={() => handleLogin(account.email, account.password)}
                    disabled={loading}
                    aria-label={`Sign in as ${account.label}`}
                    className="group relative overflow-hidden rounded-xl border border-indigo-400/15 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 px-3 py-3.5 text-center backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50"
                  >
                    <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${account.color} shadow-lg shadow-black/20 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-110`}>
                      <span className="text-sm">{account.emoji}</span>
                    </div>
                    <div className="text-xs font-semibold text-white/90">{account.label}</div>
                    <div className="mt-0.5 truncate text-[10px] text-indigo-300/50">{account.email}</div>
                    <div className="text-[10px] text-indigo-300/40">••••••••</div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-indigo-300/30">
                Click any account to sign in instantly — no password needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
