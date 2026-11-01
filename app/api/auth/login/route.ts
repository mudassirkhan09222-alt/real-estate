import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCredentials, createSessionToken, AUTH_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!verifyCredentials(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const store = await cookies();
  store.set(AUTH_COOKIE, createSessionToken(), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}
