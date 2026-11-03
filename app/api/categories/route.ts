import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory, deleteCategory } from "@/lib/products";
import { isAuthed } from "@/lib/auth";

const NS = { "Cache-Control": "no-store" };

export async function GET() {
  return NextResponse.json(getCategories(), { headers: NS });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 422, headers: NS });
  const cat = createCategory(name);
  if (!cat) return NextResponse.json({ error: "Already exists" }, { status: 409, headers: NS });
  return NextResponse.json(cat, { status: 201, headers: NS });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await req.json().catch(() => ({}));
  const ok = deleteCategory(String(id));
  return NextResponse.json({ ok }, { headers: NS });
}
