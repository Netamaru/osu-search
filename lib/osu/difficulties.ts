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

export function needsConvertRatings(
  beatmapset: Beatmapset,
  mode: SearchFilters["mode"],
  convertsFilter: SearchFilters["converts"] = "any",
): boolean {
  if (convertsFilter === "exclude") return false;
  if (mode !== "1" && mode !== "2" && mode !== "3") return false;
  return (beatmapset.beatmaps ?? []).some((beatmap) => alive(beatmap) && beatmap.mode === "osu" && !beatmap.convert);
}

export function visibleBeatmaps(
  beatmapset: Beatmapset,
  mode: SearchFilters["mode"],
  converts: Beatmap[] | undefined = beatmapset.converts,
  convertsFilter: SearchFilters["converts"] = "any",
): Beatmap[] {
  const native = (beatmapset.beatmaps ?? []).filter((beatmap) => alive(beatmap) && !beatmap.convert);
  const ruleset = rulesetForMode(mode);

  if (ruleset == null) {
    return native.sort((a, b) => a.difficulty_rating - b.difficulty_rating || a.version.localeCompare(b.version));
  }

  const nativeForRuleset = native.filter((beatmap) => beatmap.mode === ruleset);

  if (ruleset === "osu" || convertsFilter === "exclude") {
    return nativeForRuleset.sort(
      (a, b) => a.difficulty_rating - b.difficulty_rating || a.version.localeCompare(b.version),
    );
  }

  const standardBeatmaps = native.filter((beatmap) => beatmap.mode === "osu");
  const convertMap = new Map<number, Beatmap>();
  for (const c of converts ?? []) {
    if (alive(c) && c.mode === ruleset) {
      convertMap.set(c.id, c);
    }
  }

  const handledIds = new Set<number>();
  const standardConverts: Beatmap[] = standardBeatmaps.map((std) => {
    handledIds.add(std.id);
    const convert = convertMap.get(std.id);
    return {
      ...std,
      ...(convert
        ? {
            difficulty_rating: convert.difficulty_rating,
            ar: convert.ar ?? std.ar,
            cs: convert.cs ?? std.cs,
            accuracy: convert.accuracy ?? std.accuracy,
            drain: convert.drain ?? std.drain,
          }
        : {}),
      mode: "osu",
      convert: true,
      convertPending: convert == null && converts === undefined,
    };
  });

  for (const c of converts ?? []) {
    if (alive(c) && c.mode === ruleset && !handledIds.has(c.id)) {
      standardConverts.push({
        ...c,
        mode: "osu",
        convert: true,
      });
    }
  }

  const pool =
    convertsFilter === "only"
      ? standardConverts
      : [...nativeForRuleset, ...standardConverts];

  return pool.sort((a, b) => a.difficulty_rating - b.difficulty_rating || a.version.localeCompare(b.version));
}
