import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { bootstrapDB } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

const NS = { "Cache-Control": "no-store" };

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  await bootstrapDB();
  const db   = sql();
  const rows = await db`SELECT id, name FROM categories ORDER BY name`;
  return NextResponse.json(rows.map(r => ({ id: String(r.id), name: r.name })), { headers: NS });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 422, headers: NS });
  try {
    await bootstrapDB();
    const db  = sql();
    const r   = await db`INSERT INTO categories (name) VALUES (${name.trim()}) RETURNING id, name`;
    return NextResponse.json({ id: String(r[0].id), name: r[0].name }, { status: 201, headers: NS });
  } catch {
    return NextResponse.json({ error: "Already exists" }, { status: 409, headers: NS });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await req.json().catch(() => ({}));
  await bootstrapDB();
  const db = sql();
  const r  = await db`DELETE FROM categories WHERE id = ${Number(id)} RETURNING id`;
  return NextResponse.json({ ok: r.length > 0 }, { headers: NS });
}
