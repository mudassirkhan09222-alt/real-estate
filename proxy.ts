/**
 * proxy.ts — Next.js 16 route protection (replaces deprecated middleware.ts).
 * Edge Runtime — uses Web Crypto (SubtleCrypto), NOT Node's crypto module.
 * Protects all /admin/* routes except /admin/login.
 */
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "wr_admin";
const SECRET = process.env.ADMIN_SECRET ?? "warsi-admin-dev-secret";

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i <= 0) return false;

  const payload = token.slice(0, i);
  const sigHex  = token.slice(i + 1);

  try {
    const key    = await getKey();
    const msgBuf = new TextEncoder().encode(payload);

    // Decode hex sig back to bytes
    const sigBytes = new Uint8Array(
      (sigHex.match(/.{1,2}/g) ?? []).map(b => parseInt(b, 16)),
    );

    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, msgBuf);
    if (!ok) return false;

    // Payload is "email:expiry_ms"
    const exp = Number(payload.split(":").pop());
    return Number.isFinite(exp) && exp > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login")    return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!(await isValidToken(token))) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
