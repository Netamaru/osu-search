import { isMode, isSort, isStatus } from "./constants";
import type { DateOp, SearchFilters } from "./types";

export function defaultFilters(): SearchFilters {
  return {
    q: "",
    mode: "",
    status: "leaderboard",
    sort: "",
    genre: "",
    language: "",
    nsfw: false,
    video: false,
    storyboard: false,
    featuredArtist: false,
    converts: false,
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

function flag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key);
  return value === "1" || value === "true";
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
  if (status && isStatus(status)) filters.status = status;

  const sort = params.get("sort");
  if (sort && isSort(sort)) filters.sort = sort;

  filters.rankedOp = dateOp(params.get("rankedOp"));
  filters.updatedOp = dateOp(params.get("updatedOp"));
  filters.nsfw = flag(params, "nsfw");
  filters.video = flag(params, "video");
  filters.storyboard = flag(params, "storyboard");
  filters.featuredArtist = flag(params, "featuredArtist");
  filters.converts = flag(params, "converts");

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
  if (filters.status !== defaults.status) params.set("status", filters.status);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.ranked && filters.rankedOp !== ">=") params.set("rankedOp", filters.rankedOp);
  if (filters.updated && filters.updatedOp !== ">=") params.set("updatedOp", filters.updatedOp);
  if (filters.nsfw) params.set("nsfw", "1");
  if (filters.video) params.set("video", "1");
  if (filters.storyboard) params.set("storyboard", "1");
  if (filters.featuredArtist) params.set("featuredArtist", "1");
  if (filters.converts) params.set("converts", "1");

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
    filters.nsfw ||
    filters.video ||
    filters.storyboard ||
    filters.featuredArtist ||
    filters.converts
  );
}
