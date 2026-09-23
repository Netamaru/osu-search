import { NextResponse } from "next/server";
import { MissingCredentialsError, OsuApiError, osuGet } from "@/lib/osu/client";
import { filtersFromSearchParams } from "@/lib/osu/filters";
import { compileOsuParams } from "@/lib/osu/query";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import type { SearchResponse } from "@/lib/osu/types";

export async function GET(request: Request) {
  const resolved = resolveCredentials(request);
  if (!resolved.ok) {
    const failure = credentialsFailure(resolved);
    return NextResponse.json(failure.body, { status: failure.status });
  }

  const incoming = new URL(request.url).searchParams;
  const params = compileOsuParams(filtersFromSearchParams(incoming));
  const cursor = incoming.get("cursor");
  if (cursor) params.set("cursor_string", cursor);

  try {
    const data = await osuGet<SearchResponse>("/beatmapsets/search", resolved.credentials, params);
    return NextResponse.json(data);
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
