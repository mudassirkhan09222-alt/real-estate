import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

const NS = { "Cache-Control": "no-store" };
const MAX_MB = 25;

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400, headers: NS });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400, headers: NS });
  if (files.length > 10) return NextResponse.json({ error: "Max 10 files" }, { status: 400, headers: NS });

  const results: { url: string; alt: string }[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: `Not an image: ${file.name}` }, { status: 415, headers: NS });
    if (file.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 413, headers: NS });
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await saveImage(buf);
    results.push({ url, alt: file.name.replace(/\.[^.]+$/, "") });
  }
  return NextResponse.json({ images: results }, { headers: NS });
}
