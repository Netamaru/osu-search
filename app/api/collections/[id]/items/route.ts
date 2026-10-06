import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { addCollectionItem, removeCollectionItem } from "@/lib/db/queries";
import type { Beatmapset } from "@/lib/osu/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in." }, { status: 401 });
  }

  const sql = getDb()!;
  try {
    const body = (await request.json()) as { beatmapset?: Beatmapset; notes?: string };
    if (!body.beatmapset || !body.beatmapset.id) {
      return NextResponse.json({ error: "bad_request", message: "Invalid beatmapset data." }, { status: 400 });
    }

    const success = await addCollectionItem(
      sql,
      id,
      user.osu_id,
      body.beatmapset,
      body.notes || "",
    );

    if (!success) {
      return NextResponse.json({ error: "forbidden", message: "Could not add beatmap to collection." }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to add beatmap to collection:", err);
    return NextResponse.json({ error: "server_error", message: "Could not add beatmap to collection." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const beatmapsetId = url.searchParams.get("beatmapsetId");
  if (!beatmapsetId || !/^\d+$/.test(beatmapsetId)) {
    return NextResponse.json({ error: "bad_request", message: "Invalid beatmapset ID." }, { status: 400 });
  }

  const sql = getDb()!;
  try {
    const success = await removeCollectionItem(sql, id, user.osu_id, Number(beatmapsetId));
    if (!success) {
      return NextResponse.json({ error: "not_found", message: "Item not found in collection." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to remove item from collection:", err);
    return NextResponse.json({ error: "server_error", message: "Could not remove beatmap." }, { status: 500 });
  }
}
