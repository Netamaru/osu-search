import type { Beatmap, Beatmapset, Ruleset, SearchFilters } from "./types";

const RULESET_BY_MODE: Record<Exclude<SearchFilters["mode"], "">, Ruleset> = {
  "0": "osu",
  "1": "taiko",
  "2": "fruits",
  "3": "mania",
};

export function rulesetForMode(mode: SearchFilters["mode"]): Ruleset | null {
  if (mode === "") return null;
  return RULESET_BY_MODE[mode];
}

function alive(beatmap: Beatmap): boolean {
  return beatmap.deleted_at == null;
}

export function needsConvertRatings(beatmapset: Beatmapset, mode: SearchFilters["mode"]): boolean {
  if (mode !== "1" && mode !== "2" && mode !== "3") return false;
  return (beatmapset.beatmaps ?? []).some((beatmap) => alive(beatmap) && beatmap.mode === "osu" && !beatmap.convert);
}

export function visibleBeatmaps(
  beatmapset: Beatmapset,
  mode: SearchFilters["mode"],
  converts: Beatmap[] | undefined = beatmapset.converts,
): Beatmap[] {
  const native = (beatmapset.beatmaps ?? []).filter((beatmap) => alive(beatmap) && !beatmap.convert);
  const ruleset = rulesetForMode(mode);
  const pool =
    ruleset == null
      ? native
      : [
          ...native.filter((beatmap) => beatmap.mode === ruleset),
          ...(converts ?? []).filter((beatmap) => alive(beatmap) && beatmap.mode === ruleset),
        ];

  return pool.sort((a, b) => a.difficulty_rating - b.difficulty_rating || a.version.localeCompare(b.version));
}
