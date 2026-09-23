import { isMode, isSort, isStatus, STATUSES } from "./constants";
import type { DateOp, SearchFilters, SearchStatus } from "./types";

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
  if (status) {
    const parsed = normalizeStatuses(status.split(","));
    if (parsed.length > 0) filters.status = parsed;
  }

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
  if (filters.status.join(",") !== defaults.status.join(",")) params.set("status", filters.status.join(","));
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
