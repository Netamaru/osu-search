import { isMode, isSort } from "./constants";
import { defaultFilters, normalizeStatuses } from "./filters";
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

  const extras = [
    filters.video === "only" ? "video" : "",
    filters.storyboard === "only" ? "storyboard" : "",
  ].filter(Boolean);
  if (extras.length > 0) params.set("e", extras.join("."));

  const includeConverts =
    filters.converts === "only" ||
    (filters.converts === "any" && (filters.mode === "1" || filters.mode === "2" || filters.mode === "3"));

  const general = [
    includeConverts ? "converts" : "",
    filters.featuredArtist === "only" ? "featured_artists" : "",
  ].filter(Boolean);
  if (general.length > 0) params.set("c", general.join("."));

  params.set("nsfw", filters.nsfw === "exclude" ? "false" : "true");
  if (filters.sort) params.set("sort", filters.sort);

  return params;
}

export function formatOsuQuery(filters: SearchFilters): string {
  const statuses = filters.status.length > 0 ? filters.status : (["leaderboard"] as const);
  return statuses
    .map((status) => [...compileOsuParams(filters, status).entries()].map(([key, value]) => `${key}=${value}`).join("\n"))
    .join("\n\n");
}

function unquote(value: string): string {
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return value;
}

function parseQueryTokens(queryStr: string, filters: SearchFilters) {
  const tokenRegex = /([a-zA-Z]+(?:>=|<=|>|<|=))(?:"(?:[^"\\]|\\.)*"|[^\s]+)|(?:"(?:[^"\\]|\\.)*"|[^\s]+)/g;
  const keywords: string[] = filters.q ? [filters.q] : [];

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(queryStr)) !== null) {
    const token = match[0];
    const opMatch = token.match(/^([a-zA-Z]+)(>=|<=|>|<|=)(.*)$/);
    if (opMatch) {
      const key = opMatch[1].toLowerCase();
      const op = opMatch[2];
      const rawVal = unquote(opMatch[3].trim());

      switch (key) {
        case "stars":
          if (op === ">=" || op === ">") filters.starsMin = rawVal;
          else if (op === "<=" || op === "<") filters.starsMax = rawVal;
          else if (op === "=") {
            filters.starsMin = rawVal;
            filters.starsMax = rawVal;
          }
          break;
        case "ar":
          if (op === ">=" || op === ">") filters.arMin = rawVal;
          else if (op === "<=" || op === "<") filters.arMax = rawVal;
          else if (op === "=") {
            filters.arMin = rawVal;
            filters.arMax = rawVal;
          }
          break;
        case "cs":
          if (op === ">=" || op === ">") filters.csMin = rawVal;
          else if (op === "<=" || op === "<") filters.csMax = rawVal;
          else if (op === "=") {
            filters.csMin = rawVal;
            filters.csMax = rawVal;
          }
          break;
        case "od":
          if (op === ">=" || op === ">") filters.odMin = rawVal;
          else if (op === "<=" || op === "<") filters.odMax = rawVal;
          else if (op === "=") {
            filters.odMin = rawVal;
            filters.odMax = rawVal;
          }
          break;
        case "hp":
          if (op === ">=" || op === ">") filters.hpMin = rawVal;
          else if (op === "<=" || op === "<") filters.hpMax = rawVal;
          else if (op === "=") {
            filters.hpMin = rawVal;
            filters.hpMax = rawVal;
          }
          break;
        case "bpm":
          if (op === ">=" || op === ">") filters.bpmMin = rawVal;
          else if (op === "<=" || op === "<") filters.bpmMax = rawVal;
          else if (op === "=") {
            filters.bpmMin = rawVal;
            filters.bpmMax = rawVal;
          }
          break;
        case "length":
          if (op === ">=" || op === ">") filters.lengthMin = rawVal;
          else if (op === "<=" || op === "<") filters.lengthMax = rawVal;
          else if (op === "=") {
            filters.lengthMin = rawVal;
            filters.lengthMax = rawVal;
          }
          break;
        case "keys":
          if (op === ">=" || op === ">") filters.keysMin = rawVal;
          else if (op === "<=" || op === "<") filters.keysMax = rawVal;
          else if (op === "=") {
            filters.keysMin = rawVal;
            filters.keysMax = rawVal;
          }
          break;
        case "artist":
          filters.artist = rawVal;
          break;
        case "creator":
          filters.creator = rawVal;
          break;
        case "title":
          filters.title = rawVal;
          break;
        case "difficulty":
          filters.difficulty = rawVal;
          break;
        case "source":
          filters.source = rawVal;
          break;
        case "tag":
          filters.tag = rawVal;
          break;
        case "ranked":
          filters.ranked = rawVal;
          if (op === "=" || op === "<=" || op === ">=") filters.rankedOp = op;
          break;
        case "updated":
          filters.updated = rawVal;
          if (op === "=" || op === "<=" || op === ">=") filters.updatedOp = op;
          break;
        default:
          keywords.push(token);
          break;
      }
    } else {
      keywords.push(unquote(token));
    }
  }

  filters.q = keywords.join(" ").trim();
}

const PARAM_KEYS = new Set([
  "q",
  "m",
  "mode",
  "s",
  "status",
  "sort",
  "g",
  "genre",
  "l",
  "language",
  "lang",
  "nsfw",
  "video",
  "storyboard",
  "converts",
  "featuredartist",
  "featured_artists",
  "featured_artist",
  "e",
  "extra",
  "c",
  "general",
  "starsmin",
  "starsmax",
  "armin",
  "armax",
  "csmin",
  "csmax",
  "odmin",
  "odmax",
  "hpmin",
  "hpmax",
  "bpmmin",
  "bpmmax",
  "lengthmin",
  "lengthmax",
  "keysmin",
  "keysmax",
  "artist",
  "creator",
  "title",
  "difficulty",
  "source",
  "tag",
  "ranked",
  "updated",
  "rankedop",
  "updatedop",
]);

export function parseOsuQuery(raw: string, base?: SearchFilters): SearchFilters {
  const filters: SearchFilters = base ? { ...base } : defaultFilters();
  const statuses: string[] = [];

  const trimmed = raw.trim();
  if (!trimmed) {
    return defaultFilters();
  }

  const lines = trimmed.split(/[\r\n&]+/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_]+)\s*=\s*(.*)$/);
    if (match && PARAM_KEYS.has(match[1].toLowerCase())) {
      const key = match[1].toLowerCase();
      const val = match[2].trim();

      switch (key) {
        case "q":
          filters.q = "";
          parseQueryTokens(val, filters);
          break;
        case "m":
        case "mode": {
          const modeVal = val.toLowerCase();
          if (modeVal === "0" || modeVal === "osu") filters.mode = "0";
          else if (modeVal === "1" || modeVal === "taiko") filters.mode = "1";
          else if (modeVal === "2" || modeVal === "fruits" || modeVal === "catch") filters.mode = "2";
          else if (modeVal === "3" || modeVal === "mania") filters.mode = "3";
          else if (isMode(val)) filters.mode = val;
          else if (modeVal === "" || modeVal === "any") filters.mode = "";
          break;
        }
        case "s":
        case "status": {
          const parts = val.split(/[,+]/).map((s) => s.trim().toLowerCase());
          statuses.push(...parts);
          break;
        }
        case "sort":
          if (isSort(val)) filters.sort = val;
          else if (val === "") filters.sort = "";
          break;
        case "g":
        case "genre":
          filters.genre = /^\d+$/.test(val) ? val : "";
          break;
        case "l":
        case "language":
          filters.language = /^\d+$/.test(val) ? val : "";
          break;
        case "nsfw":
          if (val === "only") filters.nsfw = "only";
          else if (val === "1" || val.toLowerCase() === "true" || val.toLowerCase() === "any") filters.nsfw = "any";
          else filters.nsfw = "exclude";
          break;
        case "video":
          if (val === "only" || val === "1" || val.toLowerCase() === "true") filters.video = "only";
          else if (val === "exclude" || val === "0" || val.toLowerCase() === "false") filters.video = "exclude";
          else filters.video = "any";
          break;
        case "storyboard":
          if (val === "only" || val === "1" || val.toLowerCase() === "true") filters.storyboard = "only";
          else if (val === "exclude" || val === "0" || val.toLowerCase() === "false") filters.storyboard = "exclude";
          else filters.storyboard = "any";
          break;
        case "converts":
          if (val === "only" || val === "1" || val.toLowerCase() === "true") filters.converts = "only";
          else if (val === "exclude" || val === "0" || val.toLowerCase() === "false") filters.converts = "exclude";
          else filters.converts = "any";
          break;
        case "featuredartist":
        case "featured_artists":
        case "featured_artist":
          if (val === "only" || val === "1" || val.toLowerCase() === "true") filters.featuredArtist = "only";
          else if (val === "exclude" || val === "0" || val.toLowerCase() === "false") filters.featuredArtist = "exclude";
          else filters.featuredArtist = "any";
          break;
        case "e":
        case "extra": {
          const extras = val.split(/[.+]/).map((x) => x.trim().toLowerCase());
          if (extras.includes("video")) filters.video = "only";
          if (extras.includes("storyboard")) filters.storyboard = "only";
          break;
        }
        case "c":
        case "general": {
          const generals = val.split(/[.+]/).map((x) => x.trim().toLowerCase());
          if (generals.includes("converts")) filters.converts = "only";
          if (generals.includes("featured_artists") || generals.includes("featuredartists")) filters.featuredArtist = "only";
          break;
        }
        case "starsmin": filters.starsMin = val; break;
        case "starsmax": filters.starsMax = val; break;
        case "armin": filters.arMin = val; break;
        case "armax": filters.arMax = val; break;
        case "csmin": filters.csMin = val; break;
        case "csmax": filters.csMax = val; break;
        case "odmin": filters.odMin = val; break;
        case "odmax": filters.odMax = val; break;
        case "hpmin": filters.hpMin = val; break;
        case "hpmax": filters.hpMax = val; break;
        case "bpmmin": filters.bpmMin = val; break;
        case "bpmmax": filters.bpmMax = val; break;
        case "lengthmin": filters.lengthMin = val; break;
        case "lengthmax": filters.lengthMax = val; break;
        case "keysmin": filters.keysMin = val; break;
        case "keysmax": filters.keysMax = val; break;
        case "artist": filters.artist = unquote(val); break;
        case "creator": filters.creator = unquote(val); break;
        case "title": filters.title = unquote(val); break;
        case "difficulty": filters.difficulty = unquote(val); break;
        case "source": filters.source = unquote(val); break;
        case "tag": filters.tag = unquote(val); break;
        case "ranked": filters.ranked = val; break;
        case "updated": filters.updated = val; break;
        case "rankedop": if (val === "=" || val === "<=" || val === ">=") filters.rankedOp = val; break;
        case "updatedop": if (val === "=" || val === "<=" || val === ">=") filters.updatedOp = val; break;
        default:
          break;
      }
    } else {
      parseQueryTokens(line, filters);
    }
  }

  if (statuses.length > 0) {
    const normalized = normalizeStatuses(statuses);
    if (normalized.length > 0) filters.status = normalized;
  }

  return filters;
}
