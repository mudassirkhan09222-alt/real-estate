"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("mudassirkhan09222@gmail.com");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setError(d.error || "Invalid email or password"); return; }
    router.replace("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo card */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", marginBottom: 14 }}>
            <Image src="/Real_state_Logo.png" alt="Warsi" width={52} height={52} style={{ objectFit: "contain" }} />
          </div>
          <h1 style={{ color: "#0f172a", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Welcome back</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Sign in to Warsi Real Estate CMS</p>
        </div>

        {/* Form card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "32px 30px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Email address</label>
              <input
                value={email} onChange={e => setEmail(e.target.value)} type="email" required
                style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 13px", color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Password</label>
              <input
                value={password} onChange={e => setPassword(e.target.value)} type="password" required autoFocus
                style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 13px", color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: "#1e2a3b", color: "#fff", border: "none", borderRadius: 9,
              padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 2,
            }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 16 }}>
          Access restricted to authorised administrators only.
        </p>
      </div>
    </div>
  );
}
