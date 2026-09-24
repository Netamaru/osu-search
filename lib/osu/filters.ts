import { isMode, isSort, isStatus, STATUSES } from "./constants";
import { rulesetForMode } from "./difficulties";
import type { Beatmapset, DateOp, SearchFilters, SearchStatus, TriStateFilter } from "./types";

const STATUS_ORDER = STATUSES.map((status) => status.id);

export function normalizeStatuses(values: string[]): SearchStatus[] {
  const unique = [...new Set(values.filter(isStatus))];
  if (unique.includes("any")) return ["any"];
  const specifics = unique.filter((status) => status !== "leaderboard");
  const chosen: SearchStatus[] =
    specifics.length > 0 ? specifics : unique.filter((status) => status === "leaderboard");
  return STATUS_ORDER.filter((status) => chosen.includes(status));
}

export function toggleStatus(current: SearchStatus[], id: SearchStatus): SearchStatus[] {
  if (id === "any" || id === "leaderboard") return [id];
  const specifics = current.filter((status) => status !== "any" && status !== "leaderboard");
  const next = specifics.includes(id) ? specifics.filter((status) => status !== id) : [...specifics, id];
  return next.length > 0 ? normalizeStatuses(next) : [id];
}

export function defaultFilters(): SearchFilters {
  return {
    q: "",
    mode: "",
    status: ["leaderboard"],
    sort: "",
    genre: "",
    language: "",
    nsfw: "exclude",
    video: "any",
    storyboard: "any",
    featuredArtist: "any",
    converts: "any",
    starsMin: "",
    starsMax: "",
    arMin: "",
    arMax: "",
    csMin: "",
    csMax: "",
    odMin: "",
    odMax: "",
    hpMin: "",
    hpMax: "",
    bpmMin: "",
    bpmMax: "",
    lengthMin: "",
    lengthMax: "",
    keysMin: "",
    keysMax: "",
    artist: "",
    creator: "",
    title: "",
    difficulty: "",
    source: "",
    tag: "",
    ranked: "",
    rankedOp: ">=",
    updated: "",
    updatedOp: ">=",
  };
}

const TEXT_KEYS = [
  "q",
  "genre",
  "language",
  "starsMin",
  "starsMax",
  "arMin",
  "arMax",
  "csMin",
  "csMax",
  "odMin",
  "odMax",
  "hpMin",
  "hpMax",
  "bpmMin",
  "bpmMax",
  "lengthMin",
  "lengthMax",
  "keysMin",
  "keysMax",
  "artist",
  "creator",
  "title",
  "difficulty",
  "source",
  "tag",
  "ranked",
  "updated",
] as const satisfies readonly (keyof SearchFilters)[];

function triStateFlag(params: URLSearchParams, key: string, defaultValue: TriStateFilter = "any"): TriStateFilter {
  const value = params.get(key);
  if (!value) return defaultValue;
  const lower = value.toLowerCase();
  if (lower === "only" || lower === "1" || lower === "true") return "only";
  if (lower === "exclude" || lower === "0" || lower === "-1" || lower === "false") return "exclude";
  if (lower === "any" || lower === "all") return "any";
  return defaultValue;
}

function dateOp(value: string | null): DateOp {
  if (value === "=" || value === "<=" || value === ">=") return value;
  return ">=";
}

export function filtersFromSearchParams(params: URLSearchParams): SearchFilters {
  const filters = defaultFilters();

  for (const key of TEXT_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }

  const mode = params.get("mode");
  if (mode && isMode(mode)) filters.mode = mode;

  const status = params.get("status");
  if (status) {
    const parsed = normalizeStatuses(status.split(","));
    if (parsed.length > 0) filters.status = parsed;
  }

  const sort = params.get("sort");
  if (sort && isSort(sort)) filters.sort = sort;

  filters.rankedOp = dateOp(params.get("rankedOp"));
  filters.updatedOp = dateOp(params.get("updatedOp"));
  filters.nsfw = triStateFlag(params, "nsfw", "exclude");
  filters.video = triStateFlag(params, "video", "any");
  filters.storyboard = triStateFlag(params, "storyboard", "any");
  filters.featuredArtist = triStateFlag(params, "featuredArtist", "any");
  filters.converts = triStateFlag(params, "converts", "any");

  return filters;
}

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const defaults = defaultFilters();
  const params = new URLSearchParams();

  for (const key of TEXT_KEYS) {
    if (filters[key] && filters[key] !== defaults[key]) {
      params.set(key, filters[key]);
    }
  }

  if (filters.mode) params.set("mode", filters.mode);
  if (filters.status.join(",") !== defaults.status.join(",")) params.set("status", filters.status.join(","));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.ranked && filters.rankedOp !== ">=") params.set("rankedOp", filters.rankedOp);
  if (filters.updated && filters.updatedOp !== ">=") params.set("updatedOp", filters.updatedOp);
  if (filters.nsfw !== defaults.nsfw) params.set("nsfw", filters.nsfw);
  if (filters.video !== defaults.video) params.set("video", filters.video);
  if (filters.storyboard !== defaults.storyboard) params.set("storyboard", filters.storyboard);
  if (filters.featuredArtist !== defaults.featuredArtist) params.set("featuredArtist", filters.featuredArtist);
  if (filters.converts !== defaults.converts) params.set("converts", filters.converts);

  return params;
}

export function hasAdvancedFilters(filters: SearchFilters): boolean {
  const defaults = defaultFilters();
  const keys: (keyof SearchFilters)[] = [
    "genre",
    "language",
    "starsMin",
    "starsMax",
    "arMin",
    "arMax",
    "csMin",
    "csMax",
    "odMin",
    "odMax",
    "hpMin",
    "hpMax",
    "bpmMin",
    "bpmMax",
    "lengthMin",
    "lengthMax",
    "keysMin",
    "keysMax",
    "artist",
    "creator",
    "title",
    "difficulty",
    "source",
    "tag",
    "ranked",
    "updated",
  ];

  return (
    keys.some((key) => filters[key] !== defaults[key]) ||
    filters.nsfw !== defaults.nsfw ||
    filters.video !== defaults.video ||
    filters.storyboard !== defaults.storyboard ||
    filters.featuredArtist !== defaults.featuredArtist ||
    filters.converts !== defaults.converts
  );
}

export function applyIncludeFilters(beatmapsets: Beatmapset[], filters: SearchFilters): Beatmapset[] {
  const ruleset = rulesetForMode(filters.mode);

  return beatmapsets.filter((set) => {
    // Video filter
    if (filters.video === "only" && !set.video) return false;
    if (filters.video === "exclude" && set.video) return false;

    // Storyboard filter
    if (filters.storyboard === "only" && !set.storyboard) return false;
    if (filters.storyboard === "exclude" && set.storyboard) return false;

    // Explicit (NSFW) filter
    if (filters.nsfw === "only" && !set.nsfw) return false;
    if (filters.nsfw === "exclude" && set.nsfw) return false;

    // Converts filter
    if (ruleset && ruleset !== "osu") {
      const hasNative = (set.beatmaps ?? []).some((b) => b.mode === ruleset && !b.deleted_at);
      const hasConvert = (set.beatmaps ?? []).some((b) => b.mode === "osu" && !b.deleted_at);
      if (filters.converts === "only" && !hasConvert) return false;
      if (filters.converts === "exclude" && !hasNative) return false;
    }

    return true;
  });
}
