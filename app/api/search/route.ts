import { NextResponse } from "next/server";
import { MissingCredentialsError, OsuApiError, osuGet } from "@/lib/osu/client";
import { applyIncludeFilters, filtersFromSearchParams } from "@/lib/osu/filters";
import { compileOsuParams } from "@/lib/osu/query";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import { mergeSearchPages, parseStatusCursors } from "@/lib/osu/search-pages";
import type { SearchResponse } from "@/lib/osu/types";

export async function GET(request: Request) {
  const resolved = resolveCredentials(request);
  if (!resolved.ok) {
    const failure = credentialsFailure(resolved);
    return NextResponse.json(failure.body, { status: failure.status });
  }

  const incoming = new URL(request.url).searchParams;
  const filters = filtersFromSearchParams(incoming);
  const statuses = filters.status;

  try {
    if (statuses.length <= 1) {
      const params = compileOsuParams(filters, statuses[0] ?? "leaderboard");
      const cursor = incoming.get("cursor");
      if (cursor) params.set("cursor_string", cursor);
      const data = await osuGet<SearchResponse>("/beatmapsets/search", resolved.credentials, params);
      if (data.beatmapsets) {
        data.beatmapsets = applyIncludeFilters(data.beatmapsets, filters);
      }
      return NextResponse.json(data);
    }

    const cursors = parseStatusCursors(incoming.get("cursor"), statuses);
    const pages = await Promise.all(
      statuses.map(async (status) => {
        const cursor = cursors ? cursors[status] : undefined;
        if (cursors && !cursor) {
          return { status, beatmapsets: [], cursor_string: null, total: 0 };
        }
        const params = compileOsuParams(filters, status);
        if (cursor) params.set("cursor_string", cursor);
        const data = await osuGet<SearchResponse>("/beatmapsets/search", resolved.credentials, params);
        if (data.beatmapsets) {
          data.beatmapsets = applyIncludeFilters(data.beatmapsets, filters);
        }
        return { status, ...data };
      }),
    );
    return NextResponse.json(mergeSearchPages(pages, filters.sort));
  } catch (error) {
    if (error instanceof MissingCredentialsError) {
      return NextResponse.json({ error: "missing_credentials", message: error.message }, { status: 503 });
    }
    if (error instanceof OsuApiError) {
      return NextResponse.json({ error: "osu", message: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "osu", message: "Search failed." }, { status: 502 });
  }
}
