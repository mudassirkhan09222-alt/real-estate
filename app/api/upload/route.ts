import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAuthed } from "@/lib/auth";
import { optimizeAndStore } from "@/lib/images";
import type { PropertyImage } from "@/lib/types";

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400, headers: NO_STORE });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided (field name: 'files')" }, { status: 400, headers: NO_STORE });
  }
  if (files.length > 12) {
    return NextResponse.json({ error: "Max 12 files per upload" }, { status: 400, headers: NO_STORE });
  }

  const results: PropertyImage[] = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: `Unsupported type: ${file.type || "unknown"}` }, { status: 415, headers: NO_STORE });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large (max ${MAX_BYTES / 1_048_576}MB): ${file.name}` }, { status: 413, headers: NO_STORE });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const optimized = await optimizeAndStore(buffer);
      results.push({
        id: crypto.randomUUID(),
        url: optimized.url,
        width: optimized.width,
        height: optimized.height,
        blurDataURL: optimized.blurDataURL,
        alt: file.name.replace(/\.[^.]+$/, ""),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      return NextResponse.json({ error: `Failed to process ${file.name}: ${message}` }, { status: 422, headers: NO_STORE });
    }
  }

  return NextResponse.json({ images: results }, { headers: NO_STORE });
}
