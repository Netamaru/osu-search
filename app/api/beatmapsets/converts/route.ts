import { NextResponse } from "next/server";
import type { ClientCredentials } from "@/lib/credentials";
import { OsuApiError, osuGet } from "@/lib/osu/client";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import type { Beatmap, Beatmapset } from "@/lib/osu/types";

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_IDS = 5;

const cache = new Map<number, { expires: number; converts: Beatmap[] }>();

async function convertsFor(id: number, credentials: ClientCredentials): Promise<Beatmap[]> {
  const hit = cache.get(id);
  if (hit && hit.expires > Date.now()) return hit.converts;

  try {
    const beatmapset = await osuGet<Beatmapset>(`/beatmapsets/${id}`, credentials);
    const converts = beatmapset.converts ?? [];
    cache.set(id, { expires: Date.now() + CACHE_TTL_MS, converts });
    return converts;
  } catch (error) {
    if (error instanceof OsuApiError && error.status === 404) {
      cache.set(id, { expires: Date.now() + CACHE_TTL_MS, converts: [] });
      return [];
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const resolved = resolveCredentials(request);
  if (!resolved.ok) {
    const failure = credentialsFailure(resolved);
    return NextResponse.json(failure.body, { status: failure.status });
  }

  const ids = [...new Set((new URL(request.url).searchParams.get("ids") ?? "").split(","))]
    .filter((id) => /^\d+$/.test(id))
    .slice(0, MAX_IDS)
    .map(Number);

  if (ids.length === 0) {
    return NextResponse.json({ converts: {} });
  }

  try {
    const converts: Record<number, Beatmap[]> = {};
    for (const id of ids) {
      converts[id] = await convertsFor(id, resolved.credentials);
    }
    return NextResponse.json({ converts });
  } catch (error) {
    const message = error instanceof OsuApiError ? error.message : "Could not load convert star ratings.";
    const status = error instanceof OsuApiError ? error.status : 502;
    return NextResponse.json({ error: "osu", message }, { status });
  }
}
