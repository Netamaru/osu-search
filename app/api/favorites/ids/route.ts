import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getUserFavoriteIds } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured || !user) {
    return NextResponse.json({ ids: [] });
  }

  const sql = getDb()!;
  try {
    const ids = await getUserFavoriteIds(sql, user.osu_id);
    return NextResponse.json({ ids });
  } catch (err) {
    console.error("Failed to fetch favorite ids:", err);
    return NextResponse.json({ ids: [] });
  }
}
