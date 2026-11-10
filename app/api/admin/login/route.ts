import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeToken, cookieOpts, COOKIE, verifyCredentialsAsync } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const admin = await verifyCredentialsAsync(email, password);
  if (!admin)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await makeToken(admin.email);
  (await cookies()).set(COOKIE, token, cookieOpts());
  return NextResponse.json({ ok: true });
}
