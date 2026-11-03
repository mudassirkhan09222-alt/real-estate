import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCredentials, makeToken, cookieOpts, COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const admin = verifyCredentials(email, password);
  if (!admin)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await makeToken(admin.email);          // now async
  (await cookies()).set(COOKIE, token, cookieOpts());
  return NextResponse.json({ ok: true });
}
