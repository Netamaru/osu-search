import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCachedBeatmapset, markBeatmapsetDeleted, upsertBeatmapsetCache } from "@/lib/db/queries";
import { MissingCredentialsError, OsuApiError, osuGet } from "@/lib/osu/client";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import type { Beatmapset } from "@/lib/osu/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "not_found", message: "Beatmap not found." }, { status: 404 });
  }

  const numericId = Number(id);
  const sql = getDb();

  const resolved = resolveCredentials(request);
  if (!resolved.ok) {
    // If client credentials are missing, check if we have it in our cache first
    if (sql) {
      try {
        const cached = await getCachedBeatmapset(sql, numericId);
        if (cached) {
          return NextResponse.json(cached);
        }
      } catch (err) {
        console.error("Cache fallback error:", err);
      }
    }
    const failure = credentialsFailure(resolved);
    return NextResponse.json(failure.body, { status: failure.status });
  }

  try {
    const beatmapset = await osuGet<Beatmapset>(`/beatmapsets/${id}`, resolved.credentials);

    // Sync to cache in background if DB is connected
    if (sql) {
      upsertBeatmapsetCache(sql, beatmapset).catch((err) => {
        console.error("Background cache upsert error:", err);
      });
    }

    return NextResponse.json(beatmapset, {
      headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    // If osu! 404s (e.g. map deleted from official osu!) or errors, check DB cache!
    if (sql) {
      try {
        const cached = await getCachedBeatmapset(sql, numericId);
        if (cached) {
          if (error instanceof OsuApiError && error.status === 404) {
            markBeatmapsetDeleted(sql, numericId, true).catch(() => {});
          }
          return NextResponse.json({
            ...cached,
            is_deleted_from_osu: true,
          });
        }
      } catch (cacheErr) {
        console.error("Failed to check database cache for deleted beatmap:", cacheErr);
      }
    }

    if (error instanceof MissingCredentialsError) {
      return NextResponse.json({ error: "missing_credentials", message: error.message }, { status: 503 });
    }
    if (error instanceof OsuApiError) {
      const status = error.status === 404 ? 404 : error.status;
      return NextResponse.json(
        { error: status === 404 ? "not_found" : "osu", message: error.message },
        { status },
      );
    }
    return NextResponse.json({ error: "osu", message: "Could not load this beatmap." }, { status: 502 });
  }
}
