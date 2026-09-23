import type { SearchFilters, SearchStatus } from "./types";

function parseNumber(value: string): string | null {
  const trimmed = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  return String(Number(trimmed));
}

export function parseLength(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
}

function quoteText(value: string): string {
  if (/[\s"\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

function addRange(parts: string[], key: string, min: string, max: string, parse: (value: string) => string | null) {
  const lower = parse(min);
  const upper = parse(max);
  if (lower) parts.push(`${key}>=${lower}`);
  if (upper) parts.push(`${key}<=${upper}`);
}

function addText(parts: string[], key: string, value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return;
  parts.push(`${key}=${quoteText(trimmed)}`);
}

function addDate(parts: string[], key: string, value: string, op: SearchFilters["rankedOp"]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const operator = op === "=" || op === "<=" || op === ">=" ? op : ">=";
  parts.push(`${key}${operator}${value}`);
}

export function buildQuery(filters: SearchFilters): string {
  const parts: string[] = [];
  const keywords = filters.q.trim().replace(/\s+/g, " ");
  if (keywords) parts.push(keywords);

  addRange(parts, "stars", filters.starsMin, filters.starsMax, parseNumber);
  addRange(parts, "ar", filters.arMin, filters.arMax, parseNumber);
  addRange(parts, "cs", filters.csMin, filters.csMax, parseNumber);
  addRange(parts, "od", filters.odMin, filters.odMax, parseNumber);
  addRange(parts, "hp", filters.hpMin, filters.hpMax, parseNumber);
  addRange(parts, "bpm", filters.bpmMin, filters.bpmMax, parseNumber);
  addRange(parts, "length", filters.lengthMin, filters.lengthMax, (value) => {
    const seconds = parseLength(value);
    return seconds == null ? null : String(Math.round(seconds));
  });
  addRange(parts, "keys", filters.keysMin, filters.keysMax, (value) => {
    const parsed = parseNumber(value);
    if (!parsed || parsed.includes(".")) return null;
    return parsed;
  });

  addText(parts, "artist", filters.artist);
  addText(parts, "creator", filters.creator);
  addText(parts, "title", filters.title);
  addText(parts, "difficulty", filters.difficulty);
  addText(parts, "source", filters.source);
  addText(parts, "tag", filters.tag);
  addDate(parts, "ranked", filters.ranked, filters.rankedOp);
  addDate(parts, "updated", filters.updated, filters.updatedOp);

  return parts.join(" ");
}

export function compileOsuParams(
  filters: SearchFilters,
  status: SearchStatus = filters.status[0] ?? "leaderboard",
): URLSearchParams {
  const params = new URLSearchParams();
  const q = buildQuery(filters);
  if (q) params.set("q", q);
  if (filters.mode) params.set("m", filters.mode);
  params.set("s", status);
  if (/^\d+$/.test(filters.genre)) params.set("g", filters.genre);
  if (/^\d+$/.test(filters.language)) params.set("l", filters.language);

  const extras = [filters.video ? "video" : "", filters.storyboard ? "storyboard" : ""].filter(Boolean);
  if (extras.length > 0) params.set("e", extras.join("."));

  const general = [
    filters.converts ? "converts" : "",
    filters.featuredArtist ? "featured_artists" : "",
  ].filter(Boolean);
  if (general.length > 0) params.set("c", general.join("."));

  params.set("nsfw", filters.nsfw ? "true" : "false");
  if (filters.sort) params.set("sort", filters.sort);

  return params;
}

export function formatOsuQuery(filters: SearchFilters): string {
  const statuses = filters.status.length > 0 ? filters.status : (["leaderboard"] as const);
  return statuses
    .map((status) => [...compileOsuParams(filters, status).entries()].map(([key, value]) => `${key}=${value}`).join("\n"))
    .join("\n\n");
}
