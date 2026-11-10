/**
 * One-time admin reset endpoint.
 * GET /api/admin/reset?key=ADMIN_SECRET
 * Forces admin email+password in DB to match current env variables.
 * Delete this file after first successful login.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  // Security: require the ADMIN_SECRET as query param
  const key = req.nextUrl.searchParams.get("key");
  if (!key || key !== (process.env.ADMIN_SECRET ?? "warsi-admin-dev-secret")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncompany@gmail.com").toLowerCase().trim();
  const envPass  =  process.env.ADMIN_PASSWORD ?? "Realstate1234";
  const hash     =  bcrypt.hashSync(envPass, 12);

  try {
    if (process.env.DATABASE_URL &&
        !process.env.DATABASE_URL.startsWith("file:") &&
        !process.env.DATABASE_URL.includes("placeholder")) {

      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      // Ensure table exists
      await sql`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)`;

      const existing = await sql`SELECT id FROM admins LIMIT 1`;
      if (existing.length > 0) {
        await sql`UPDATE admins SET email = ${envEmail}, password_hash = ${hash}`;
      } else {
        await sql`INSERT INTO admins (email, password_hash) VALUES (${envEmail}, ${hash})`;
      }

      return NextResponse.json({
        ok: true,
        message: `Admin updated in Postgres → ${envEmail}`,
      });
    } else {
      // Local SQLite
      const { bootstrapDB } = await import("@/lib/db");
      await bootstrapDB();
      return NextResponse.json({ ok: true, message: `Admin reset in SQLite → ${envEmail}` });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
