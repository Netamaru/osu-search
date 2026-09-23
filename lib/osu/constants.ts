import type { SearchStatus } from "./types";

export const MODES = [
  { id: "", label: "Any" },
  { id: "0", label: "osu!" },
  { id: "1", label: "taiko" },
  { id: "2", label: "catch" },
  { id: "3", label: "mania" },
] as const;

export const STATUSES: { id: SearchStatus; label: string }[] = [
  { id: "leaderboard", label: "Leaderboard" },
  { id: "ranked", label: "Ranked" },
  { id: "qualified", label: "Qualified" },
  { id: "loved", label: "Loved" },
  { id: "pending", label: "Pending" },
  { id: "wip", label: "WIP" },
  { id: "graveyard", label: "Graveyard" },
  { id: "any", label: "Any" },
];

export const SORTS = [
  { id: "", label: "Default" },
  { id: "ranked_desc", label: "Ranked, newest" },
  { id: "ranked_asc", label: "Ranked, oldest" },
  { id: "updated_desc", label: "Recently updated" },
  { id: "plays_desc", label: "Most played" },
  { id: "favourites_desc", label: "Most favourited" },
  { id: "rating_desc", label: "Highest rating" },
  { id: "difficulty_desc", label: "Hardest" },
  { id: "difficulty_asc", label: "Easiest" },
  { id: "title_asc", label: "Title A–Z" },
  { id: "artist_asc", label: "Artist A–Z" },
  { id: "relevance_desc", label: "Relevance" },
  { id: "nominations_desc", label: "Nominations" },
] as const;

export const GENRES = [
  { id: "1", label: "Unspecified" },
  { id: "2", label: "Video Game" },
  { id: "3", label: "Anime" },
  { id: "4", label: "Rock" },
  { id: "5", label: "Pop" },
  { id: "6", label: "Other" },
  { id: "7", label: "Novelty" },
  { id: "9", label: "Hip Hop" },
  { id: "10", label: "Electronic" },
  { id: "11", label: "Metal" },
  { id: "12", label: "Classical" },
  { id: "13", label: "Folk" },
  { id: "14", label: "Jazz" },
] as const;

export const LANGUAGES = [
  { id: "1", label: "Unspecified" },
  { id: "2", label: "English" },
  { id: "3", label: "Japanese" },
  { id: "4", label: "Chinese" },
  { id: "5", label: "Instrumental" },
  { id: "6", label: "Korean" },
  { id: "7", label: "French" },
  { id: "8", label: "German" },
  { id: "9", label: "Swedish" },
  { id: "10", label: "Spanish" },
  { id: "11", label: "Italian" },
  { id: "12", label: "Russian" },
  { id: "13", label: "Polish" },
  { id: "14", label: "Other" },
] as const;

export const MODE_LABEL: Record<string, string> = {
  osu: "osu!",
  taiko: "taiko",
  fruits: "catch",
  mania: "mania",
};

const SORT_FIELDS = new Set([
  "title",
  "artist",
  "difficulty",
  "updated",
  "ranked",
  "rating",
  "plays",
  "favourites",
  "relevance",
  "nominations",
]);

export function isSort(value: string): boolean {
  const parts = value.split("_");
  if (parts.length !== 2) return false;
  const [field, order] = parts;
  return SORT_FIELDS.has(field) && (order === "asc" || order === "desc");
}

export function isStatus(value: string): value is SearchStatus {
  return STATUSES.some((status) => status.id === value);
}

export function isMode(value: string): value is "" | "0" | "1" | "2" | "3" {
  return value === "" || value === "0" || value === "1" || value === "2" || value === "3";
}
