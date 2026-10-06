import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getCollectionIdsForBeatmap } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured || !user) {
    return NextResponse.json({ collectionIds: [] });
  }

  const url = new URL(request.url);
  const beatmapsetId = url.searchParams.get("beatmapsetId");
  if (!beatmapsetId || !/^\d+$/.test(beatmapsetId)) {
    return NextResponse.json({ collectionIds: [] });
  }

  const sql = getDb()!;
  try {
    const collectionIds = await getCollectionIdsForBeatmap(sql, user.osu_id, Number(beatmapsetId));
    return NextResponse.json({ collectionIds });
  } catch (err) {
    console.error("Failed to check collection IDs:", err);
    return NextResponse.json({ collectionIds: [] });
  }
}
