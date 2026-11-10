import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeToken, cookieOpts, COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { email, password } = body;

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error("[login] DATABASE_URL is not set");
      return NextResponse.json({ error: "Database not configured. Set DATABASE_URL in Vercel environment variables." }, { status: 500 });
    }

    const { bootstrapDB } = await import("@/lib/db");
    const { neon } = await import("@neondatabase/serverless");

    await bootstrapDB();

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT * FROM admins WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;

    if (!rows[0]) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const admin = rows[0];
    const valid = bcrypt.compareSync(password, admin.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await makeToken(admin.email as string);
    (await cookies()).set(COOKIE, token, cookieOpts());
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[login] Error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
