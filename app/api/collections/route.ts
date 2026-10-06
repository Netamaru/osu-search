import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createCollection, getUserCollections } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);

  if (!dbConfigured) {
    return NextResponse.json({ collections: [] });
  }

  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Please log in to view your collections." },
      { status: 401 },
    );
  }

  const sql = getDb()!;
  try {
    const collections = await getUserCollections(sql, user.osu_id);
    return NextResponse.json({ collections });
  } catch (err) {
    console.error("Failed to list collections:", err);
    return NextResponse.json({ error: "server_error", message: "Could not fetch collections." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  if (!dbConfigured) {
    return NextResponse.json({ error: "db_not_configured", message: "Database not configured." }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please log in to create a collection." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name?: string; description?: string; is_public?: boolean };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "bad_request", message: "Collection name is required." }, { status: 400 });
    }

    const sql = getDb()!;
    const collection = await createCollection(
      sql,
      user.osu_id,
      name,
      body.description || "",
      body.is_public ?? false,
    );

    return NextResponse.json({ collection }, { status: 201 });
  } catch (err) {
    console.error("Failed to create collection:", err);
    return NextResponse.json({ error: "server_error", message: "Could not create collection." }, { status: 500 });
  }
}
