import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeToken, cookieOpts, COOKIE } from "@/lib/auth";
import { bootstrapDB, findAdmin } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { email, password } = body;

    // Bootstrap DB (SQLite locally, Postgres on Vercel)
    await bootstrapDB();

    const admin = await findAdmin(email);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await makeToken(admin.email);
    (await cookies()).set(COOKIE, token, cookieOpts());
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[login] Error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
