import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteSession } from "@/lib/db/queries";

export async function POST(request: Request) {
  const token = await getSessionToken(request);
  const sql = getDb();

  if (sql && token) {
    try {
      await deleteSession(sql, token);
    } catch (err) {
      console.error("Failed to delete session row:", err);
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
