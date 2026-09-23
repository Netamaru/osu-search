export type Ruleset = "osu" | "taiko" | "fruits" | "mania";

export type BeatmapStatus =
  | "graveyard"
  | "wip"
  | "pending"
  | "ranked"
  | "approved"
  | "qualified"
  | "loved";

export type SearchStatus =
  | "any"
  | "leaderboard"
  | "ranked"
  | "qualified"
  | "loved"
  | "pending"
  | "wip"
  | "graveyard";

export type DateOp = "=" | ">=" | "<=";

export interface Beatmap {
  id: number;
  beatmapset_id: number;
  mode: Ruleset;
  mode_int: number;
  difficulty_rating: number;
  version: string;
  total_length: number;
  bpm: number | null;
  cs: number;
  ar: number;
  accuracy: number;
  drain: number;
  status: BeatmapStatus;
  max_combo?: number | null;
  convert?: boolean;
  deleted_at?: string | null;
}

export interface BeatmapCovers {
  cover: string;
  card: string;
  list: string;
  slimcover: string;
  "cover@2x"?: string;
  "list@2x"?: string;
}

export interface Beatmapset {
  id: number;
  artist: string;
  artist_unicode: string;
  title: string;
  title_unicode: string;
  creator: string;
  user_id: number;
  status: BeatmapStatus;
  favourite_count: number;
  play_count: number;
  bpm: number;
  nsfw: boolean;
  video: boolean;
  storyboard?: boolean;
  preview_url: string;
  source: string;
  tags?: string;
  ranked_date: string | null;
  last_updated?: string;
  rating?: number;
  covers: BeatmapCovers;
  beatmaps?: Beatmap[];
  converts?: Beatmap[];
  genre?: { id: number; name: string } | null;
  language?: { id: number; name: string } | null;
}

export interface SearchResponse {
  beatmapsets: Beatmapset[] | null;
  cursor_string: string | null;
  total: number;
  error?: string | null;
  search?: { sort: string };
}

export interface SearchFilters {
  q: string;
  mode: "" | "0" | "1" | "2" | "3";
  status: SearchStatus;
  sort: string;
  genre: string;
  language: string;
  nsfw: boolean;
  video: boolean;
  storyboard: boolean;
  featuredArtist: boolean;
  converts: boolean;
  starsMin: string;
  starsMax: string;
  arMin: string;
  arMax: string;
  csMin: string;
  csMax: string;
  odMin: string;
  odMax: string;
  hpMin: string;
  hpMax: string;
  bpmMin: string;
  bpmMax: string;
  lengthMin: string;
  lengthMax: string;
  keysMin: string;
  keysMax: string;
  artist: string;
  creator: string;
  title: string;
  difficulty: string;
  source: string;
  tag: string;
  ranked: string;
  rankedOp: DateOp;
  updated: string;
  updatedOp: DateOp;
}
