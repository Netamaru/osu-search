import { NextResponse } from "next/server";
import type { ClientCredentials } from "@/lib/credentials";
import { osuGet } from "@/lib/osu/client";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import type { Beatmap, Beatmapset } from "@/lib/osu/types";

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const MAX_IDS = 10;

const cache = new Map<number, { expires: number; converts: Beatmap[] }>();

function setCache(id: number, value: { expires: number; converts: Beatmap[] }) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires <= now) cache.delete(k);
    }
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }
  cache.set(id, value);
}

async function convertsFor(id: number, credentials: ClientCredentials): Promise<Beatmap[]> {
  const hit = cache.get(id);
  if (hit && hit.expires > Date.now()) return hit.converts;

  try {
    const beatmapset = await osuGet<Beatmapset>(`/beatmapsets/${id}`, credentials);
    const converts = beatmapset.converts ?? [];
    setCache(id, { expires: Date.now() + CACHE_TTL_MS, converts });
    return converts;
  } catch {
    setCache(id, { expires: Date.now() + 60_000, converts: [] });
    return [];
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
    const results = await Promise.all(
      ids.map(async (id) => ({
        id,
        converts: await convertsFor(id, resolved.credentials),
      })),
    );
    const converts: Record<number, Beatmap[]> = {};
    for (const { id, converts: setConverts } of results) {
      converts[id] = setConverts;
    }
    return NextResponse.json(
      { converts },
      { headers: { "Cache-Control": "private, max-age=1800, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ converts: {} });
  }
}
