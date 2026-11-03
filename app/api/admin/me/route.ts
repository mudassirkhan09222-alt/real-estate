import { NextResponse } from "next/server";
import { isAuthed, getEmail } from "@/lib/auth";

export async function GET() {
  const authed = await isAuthed();
  return NextResponse.json({ authed, email: authed ? await getEmail() : null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
