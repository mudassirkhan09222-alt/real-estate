"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already signed in, skip the login screen.
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authed?: boolean }) => d.authed && router.replace("/admin"))
      .catch(() => {});
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Invalid credentials");
      }
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-espresso-950 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cream-200/60 hover:text-cream-50">
          <ArrowLeft size={15} /> Back to site
        </Link>

        <div className="mt-8 rounded-2xl border border-cream-200/10 bg-espresso-900/60 p-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-espresso-950">
              <Lock size={18} />
            </span>
            <div>
              <p className="font-serif text-xl text-cream-50">Admin sign in</p>
              <p className="text-xs text-cream-200/50">Meridian Reserve CMS</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-cream-200/70">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-cream-200/10 bg-espresso-950/50 px-4 py-3 text-sm text-cream-50 outline-none transition-colors focus:border-gold-500"
                placeholder="••••••••"
              />
            </label>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gold-500 py-3 text-sm font-medium text-espresso-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-cream-200/40">
            Demo password: <code className="rounded bg-cream-200/10 px-1.5 py-0.5">admin</code> (set ADMIN_PASSWORD in production)
          </p>
        </div>
      </div>
    </div>
  );
}
