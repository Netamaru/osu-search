import type { Beatmapset, SearchResponse, SearchStatus } from "./types";

export type StatusPage = {
  status: SearchStatus;
  beatmapsets: Beatmapset[] | null;
  cursor_string: string | null;
  total: number;
  error?: string | null;
};

const SORTABLE = new Set(["ranked", "updated", "plays", "favourites", "rating", "difficulty", "title", "artist"]);

export function parseStatusCursors(raw: string | null, statuses: SearchStatus[]): Record<string, string | null> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const cursors: Record<string, string | null> = {};
    for (const status of statuses) {
      const value = data[status];
      cursors[status] = typeof value === "string" && value ? value : null;
    }
    return cursors;
  } catch {
    return null;
  }
}

function interleave(groups: Beatmapset[][]): Beatmapset[] {
  const merged: Beatmapset[] = [];
  const seen = new Set<number>();
  const length = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < length; index += 1) {
    for (const group of groups) {
      const beatmapset = group[index];
      if (!beatmapset || seen.has(beatmapset.id)) continue;
      seen.add(beatmapset.id);
      merged.push(beatmapset);
    }
  }
  return merged;
}

function sortKey(beatmapset: Beatmapset, field: string): number | string {
  switch (field) {
    case "plays":
      return beatmapset.play_count;
    case "favourites":
      return beatmapset.favourite_count;
    case "rating":
      return beatmapset.rating ?? 0;
    case "ranked":
      return beatmapset.ranked_date ? Date.parse(beatmapset.ranked_date) : 0;
    case "updated":
      return beatmapset.last_updated ? Date.parse(beatmapset.last_updated) : 0;
    case "title":
      return beatmapset.title.toLowerCase();
    case "artist":
      return beatmapset.artist.toLowerCase();
    case "difficulty":
      return Math.max(0, ...(beatmapset.beatmaps ?? []).map((beatmap) => beatmap.difficulty_rating));
    default:
      return 0;
  }
}

function sortUnique(beatmapsets: Beatmapset[], sort: string): Beatmapset[] {
  const [field, order] = sort.split("_");
  const direction = order === "asc" ? 1 : -1;
  const seen = new Set<number>();
  const unique = beatmapsets.filter((beatmapset) => {
    if (seen.has(beatmapset.id)) return false;
    seen.add(beatmapset.id);
    return true;
  });
  unique.sort((left, right) => {
    const a = sortKey(left, field);
    const b = sortKey(right, field);
    const compared = a < b ? -1 : a > b ? 1 : left.id - right.id;
    return compared * direction;
  });
  return unique;
}

export function mergeSearchPages(pages: StatusPage[], sort: string): SearchResponse {
  const groups = pages.map((page) => page.beatmapsets ?? []);
  const [field] = sort.split("_");
  const beatmapsets = field && SORTABLE.has(field) ? sortUnique(groups.flat(), sort) : interleave(groups);
  const cursors: Record<string, string | null> = {};
  let open = false;
  for (const page of pages) {
    cursors[page.status] = page.cursor_string;
    if (page.cursor_string) open = true;
  }
  const notice = pages.find((page) => page.error)?.error ?? null;
  return {
    beatmapsets,
    cursor_string: open ? JSON.stringify(cursors) : null,
    total: pages.reduce((sum, page) => sum + (page.total || 0), 0),
    error: notice,
  };
}
