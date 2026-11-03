/**
 * Auth helpers — Node.js runtime (API routes, server components).
 * Uses the same HMAC-SHA256 scheme as middleware.ts so tokens are
 * compatible across both runtimes.
 */
import { cookies } from "next/headers";
import { getDB, type AdminRow } from "./db";
import bcrypt from "bcryptjs";

export const COOKIE  = "wr_admin";
const SECRET  = process.env.ADMIN_SECRET ?? "warsi-admin-dev-secret";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Web Crypto helpers (Edge-compatible, works in Node too) ─────────────────

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey(
    "raw", enc, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}

async function sign(payload: string): Promise<string> {
  const key    = await getKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${sigHex}`;
}

async function unsign(token: string): Promise<string | null> {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sigHex  = token.slice(i + 1);
  try {
    const key      = await getKey();
    const msgBuf   = new TextEncoder().encode(payload);
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
    const ok       = await crypto.subtle.verify("HMAC", key, sigBytes, msgBuf);
    if (!ok) return null;
    const exp = Number(payload.split(":")[1]);
    if (!Number.isFinite(exp) || exp < Date.now()) return null;
    return payload.split(":")[0]; // email
  } catch { return null; }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function makeToken(email: string): Promise<string> {
  return sign(`${email}:${Date.now() + MAX_AGE * 1000}`);
}

export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax"  as const,
    secure  : process.env.NODE_ENV === "production",
    path    : "/",
    maxAge  : MAX_AGE,
  };
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return (await unsign(store.get(COOKIE)?.value ?? "")) !== null;
}

export async function getEmail(): Promise<string | null> {
  const store = await cookies();
  return unsign(store.get(COOKIE)?.value ?? "");
}

export function verifyCredentials(email: string, password: string): AdminRow | null {
  const db  = getDB();
  const row = db.prepare("SELECT * FROM admins WHERE email = ?")
                .get(email.toLowerCase().trim()) as AdminRow | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return row;
}
