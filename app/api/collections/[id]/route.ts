import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteCollection, getCollectionWithItems, updateCollection } from "@/lib/db/queries";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }

  const { user } = await getCurrentUser(request);

  try {
    const collection = await getCollectionWithItems(sql, id);
    if (!collection) {
      return NextResponse.json({ error: "not_found", message: "Collection not found." }, { status: 404 });
    }

    const isOwner = Boolean(user && user.osu_id === collection.user_id);
    if (!collection.is_public && !isOwner) {
      return NextResponse.json({ error: "forbidden", message: "This collection is private." }, { status: 403 });
    }

    return NextResponse.json({ collection, is_owner: isOwner });
  } catch (err) {
    console.error("Failed to get collection details:", err);
    return NextResponse.json({ error: "server_error", message: "Could not fetch collection." }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = (await request.json()) as { name?: string; description?: string; is_public?: boolean };
    const updated = await updateCollection(sql, id, user.osu_id, body);
    if (!updated) {
      return NextResponse.json({ error: "not_found_or_forbidden", message: "Could not update collection." }, { status: 404 });
    }
    return NextResponse.json({ collection: updated });
  } catch (err) {
    console.error("Failed to update collection:", err);
    return NextResponse.json({ error: "server_error", message: "Could not update collection." }, { status: 500 });
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

  const sql = getDb()!;
  try {
    const deleted = await deleteCollection(sql, id, user.osu_id);
    if (!deleted) {
      return NextResponse.json({ error: "not_found_or_forbidden", message: "Could not delete collection." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete collection:", err);
    return NextResponse.json({ error: "server_error", message: "Could not delete collection." }, { status: 500 });
  }
}
