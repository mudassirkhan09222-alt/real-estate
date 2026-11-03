"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("mudassirkhan09222@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setError(d.error || "Login failed"); return; }
    router.replace("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#161616", border: "1px solid #2a2a2a", borderRadius: 18, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Image src="/Real_state_Logo.png" alt="Warsi Jee" width={110} height={72} style={{ objectFit: "contain" }} />
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, textAlign: "center", margin: "0 0 6px" }}>Welcome Back</h1>
        <p style={{ color: "#666", fontSize: 13, textAlign: "center", margin: "0 0 28px" }}>Warsi Real Estate Admin</p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={LBL}>Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={INP} placeholder="admin@example.com" />
          </div>
          <div>
            <label style={LBL}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required autoFocus style={INP} placeholder="••••••••••••" />
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: "#C8A96E", color: "#0c0c0c", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const LBL: React.CSSProperties = { display: "block", color: "#999", fontSize: 13, marginBottom: 7, fontWeight: 500 };
const INP: React.CSSProperties = { width: "100%", background: "#111", border: "1px solid #2e2e2e", borderRadius: 9, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
