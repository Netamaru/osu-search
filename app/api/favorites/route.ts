import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getUserFavorites, removeFavorite, toggleFavorite } from "@/lib/db/queries";
import type { Beatmapset } from "@/lib/osu/types";

export async function GET(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in." }, { status: 401 });
  }

  const sql = getDb()!;
  try {
    const favorites = await getUserFavorites(sql, user.osu_id);
    return NextResponse.json({ favorites });
  } catch (err) {
    console.error("Failed to get favorites:", err);
    return NextResponse.json({ error: "server_error", message: "Could not fetch favorites." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in to favorite beatmaps." }, { status: 401 });
  }

  const sql = getDb()!;
  try {
    const body = (await request.json()) as { beatmapset?: Beatmapset };
    if (!body.beatmapset || !body.beatmapset.id) {
      return NextResponse.json({ error: "bad_request", message: "Invalid beatmapset data." }, { status: 400 });
    }

    const result = await toggleFavorite(sql, user.osu_id, body.beatmapset);
    return NextResponse.json({ favorited: result.favorited });
  } catch (err) {
    console.error("Failed to toggle favorite:", err);
    return NextResponse.json({ error: "server_error", message: "Could not update favorite." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const idStr = url.searchParams.get("id");
  if (!idStr || !/^\d+$/.test(idStr)) {
    return NextResponse.json({ error: "bad_request", message: "Invalid beatmapset id." }, { status: 400 });
  }

  const sql = getDb()!;
  try {
    await removeFavorite(sql, user.osu_id, Number(idStr));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete favorite:", err);
    return NextResponse.json({ error: "server_error", message: "Could not remove favorite." }, { status: 500 });
  }
}
