import { NextResponse } from "next/server";
import { MissingCredentialsError, OsuApiError, osuGet } from "@/lib/osu/client";
import { credentialsFailure, resolveCredentials } from "@/lib/osu/request-credentials";
import type { Beatmapset } from "@/lib/osu/types";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "not_found", message: "Beatmap not found." }, { status: 404 });
  }

  const resolved = resolveCredentials(request);
  if (!resolved.ok) {
    const failure = credentialsFailure(resolved);
    return NextResponse.json(failure.body, { status: failure.status });
  }

  try {
    const beatmapset = await osuGet<Beatmapset>(`/beatmapsets/${id}`, resolved.credentials);
    return NextResponse.json(beatmapset);
  } catch (error) {
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
