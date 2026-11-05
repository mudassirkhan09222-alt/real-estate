import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDB, type CategoryRow } from "@/lib/db";

const NS = { "Cache-Control": "no-store" };

export async function GET() {
  const cats = getDB().prepare("SELECT * FROM categories ORDER BY name").all() as CategoryRow[];
  return NextResponse.json(cats.map(c => ({ id: String(c.id), name: c.name })), { headers: NS });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 422, headers: NS });
  try {
    const r = getDB().prepare("INSERT INTO categories (name) VALUES (?)").run(name.trim());
    return NextResponse.json({ id: String(r.lastInsertRowid), name: name.trim() }, { status: 201, headers: NS });
  } catch {
    return NextResponse.json({ error: "Already exists" }, { status: 409, headers: NS });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await req.json().catch(() => ({}));
  const ok = getDB().prepare("DELETE FROM categories WHERE id = ?").run(Number(id)).changes > 0;
  return NextResponse.json({ ok }, { headers: NS });
}
