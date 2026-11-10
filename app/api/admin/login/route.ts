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

    // Bootstrap DB — also updates admin email/password from env on every cold start
    await bootstrapDB();

    // Try to find admin by the submitted email
    let admin = await findAdmin(email);

    // If not found, check if env email matches and DB has wrong email stored
    if (!admin) {
      const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncompany@gmail.com").toLowerCase().trim();
      const envPass  =  process.env.ADMIN_PASSWORD ?? "Realstate1234";

      // If submitted email matches env email but DB has old email, force-fix DB
      if (email.toLowerCase().trim() === envEmail && password === envPass) {
        // Force update all admins to use current env credentials
        const USE_POSTGRES = !!(process.env.DATABASE_URL &&
          !process.env.DATABASE_URL.startsWith("file:") &&
          !process.env.DATABASE_URL.includes("placeholder"));

        if (USE_POSTGRES) {
          const { neon } = await import("@neondatabase/serverless");
          const sql = neon(process.env.DATABASE_URL!);
          const hash = bcrypt.hashSync(envPass, 12);
          const existing = await sql`SELECT id FROM admins LIMIT 1`;
          if (existing.length > 0) {
            await sql`UPDATE admins SET email = ${envEmail}, password_hash = ${hash}`;
          } else {
            await sql`INSERT INTO admins (email, password_hash) VALUES (${envEmail}, ${hash})`;
          }
        }

        // Now find again
        admin = await findAdmin(email);
        if (!admin) {
          // Still not found — create directly
          const token = await makeToken(envEmail);
          (await cookies()).set(COOKIE, token, cookieOpts());
          return NextResponse.json({ ok: true });
        }
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
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
