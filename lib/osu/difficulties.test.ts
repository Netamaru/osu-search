import { expect, test } from "bun:test";
import { needsConvertRatings, visibleBeatmaps } from "./difficulties.ts";
import type { Beatmap, Beatmapset } from "./types.ts";

function beatmap(overrides: Partial<Beatmap>): Beatmap {
  return {
    id: 1,
    beatmapset_id: 9,
    mode: "osu",
    mode_int: 0,
    difficulty_rating: 8,
    version: "Expert",
    total_length: 90,
    bpm: 180,
    cs: 4,
    ar: 9,
    accuracy: 8,
    drain: 6,
    status: "ranked",
    ...overrides,
  };
}

function set(beatmaps: Beatmap[], converts?: Beatmap[]): Beatmapset {
  return {
    id: 9,
    artist: "artist",
    artist_unicode: "artist",
    title: "title",
    title_unicode: "title",
    creator: "mapper",
    user_id: 1,
    status: "ranked",
    favourite_count: 0,
    play_count: 0,
    bpm: 180,
    nsfw: false,
    video: false,
    preview_url: "",
    source: "",
    ranked_date: null,
    covers: { cover: "", card: "", list: "", slimcover: "" },
    beatmaps,
    converts,
  };
}

test("catch chips use the converted star rating, not the osu rating", () => {
  const beatmapset = set(
    [beatmap({ id: 1, version: "Another", difficulty_rating: 8.2 })],
    [beatmap({ id: 1, mode: "fruits", mode_int: 2, convert: true, version: "Another", difficulty_rating: 6.4 })],
  );

  const shown = visibleBeatmaps(beatmapset, "2");
  expect(shown.map((item) => item.difficulty_rating)).toEqual([6.4]);
  expect(needsConvertRatings(beatmapset, "2")).toBe(true);
});

test("does not fall back to osu stars while catch converts are still loading", () => {
  const beatmapset = set([beatmap({ difficulty_rating: 8.2 })]);
  expect(visibleBeatmaps(beatmapset, "2", undefined)).toEqual([]);
});

test("native catch difficulties do not need a convert lookup", () => {
  const beatmapset = set([
    beatmap({ id: 2, mode: "fruits", mode_int: 2, version: "Rain", difficulty_rating: 5.1 }),
  ]);
  expect(needsConvertRatings(beatmapset, "2")).toBe(false);
  expect(visibleBeatmaps(beatmapset, "2").map((item) => item.difficulty_rating)).toEqual([5.1]);
});
