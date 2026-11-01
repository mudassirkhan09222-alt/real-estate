import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Lightweight admin auth for the CMS demo.
 *
 * A single admin password (ADMIN_PASSWORD env, defaults to "admin" in dev) is
 * exchanged for an HMAC-signed session cookie. Mutations are enforced server-
 * side via `isAuthed()` in the route handlers — client UI is just convenience.
 *
 * For production multi-user auth, swap this for a real session store / OIDC
 * provider; the route handlers only depend on `isAuthed()`, so the surface stays
 * the same.
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";
const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me";
export const AUTH_COOKIE = "mr_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string): string {
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verify(token: string): boolean {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  return sign(`admin:${exp}`);
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  if (!verify(token)) return false;
  const idx = token.lastIndexOf(".");
  const payload = token.slice(0, idx);
  const exp = Number(payload.split(":")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export function verifyCredentials(password: string): boolean {
  const a = Buffer.from(password.normalize("NFC"));
  const b = Buffer.from(ADMIN_PASSWORD.normalize("NFC"));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(AUTH_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
