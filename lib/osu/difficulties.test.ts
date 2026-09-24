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
  expect(shown[0].mode).toBe("osu");
  expect(shown[0].convert).toBe(true);
  expect(shown[0].convertPending).toBe(false);
  expect(needsConvertRatings(beatmapset, "2")).toBe(true);
});

test("shows standard difficulties with fallback stars while catch converts are still loading", () => {
  const beatmapset = set([beatmap({ id: 1, difficulty_rating: 8.2 })]);
  const shown = visibleBeatmaps(beatmapset, "2", undefined);
  expect(shown.length).toBe(1);
  expect(shown[0].mode).toBe("osu");
  expect(shown[0].difficulty_rating).toBe(8.2);
  expect(shown[0].convert).toBe(true);
  expect(shown[0].convertPending).toBe(true);
});

test("native catch difficulties do not need a convert lookup", () => {
  const beatmapset = set([
    beatmap({ id: 2, mode: "fruits", mode_int: 2, version: "Rain", difficulty_rating: 5.1 }),
  ]);
  expect(needsConvertRatings(beatmapset, "2")).toBe(false);
  const shown = visibleBeatmaps(beatmapset, "2");
  expect(shown.map((item) => item.difficulty_rating)).toEqual([5.1]);
  expect(shown[0].mode).toBe("fruits");
});

test("shows both native catch and converted standard difficulties sorted by rating", () => {
  const beatmapset = set(
    [
      beatmap({ id: 1, mode: "osu", version: "Standard Insane", difficulty_rating: 7.0 }),
      beatmap({ id: 2, mode: "fruits", mode_int: 2, version: "Native Rain", difficulty_rating: 4.5 }),
    ],
    [
      beatmap({ id: 1, mode: "fruits", mode_int: 2, convert: true, version: "Standard Insane", difficulty_rating: 5.5 }),
    ],
  );

  const shown = visibleBeatmaps(beatmapset, "2");
  expect(shown.length).toBe(2);
  // Native Rain is 4.5
  expect(shown[0].version).toBe("Native Rain");
  expect(shown[0].mode).toBe("fruits");
  expect(shown[0].difficulty_rating).toBe(4.5);
  expect(shown[0].convert).toBeFalsy();

  // Standard Insane converted is 5.5
  expect(shown[1].version).toBe("Standard Insane");
  expect(shown[1].mode).toBe("osu");
  expect(shown[1].difficulty_rating).toBe(5.5);
  expect(shown[1].convert).toBe(true);
});

test("respects convertsFilter exclude and only", () => {
  const beatmapset = set(
    [
      beatmap({ id: 1, mode: "osu", version: "Standard Insane", difficulty_rating: 7.0 }),
      beatmap({ id: 2, mode: "fruits", mode_int: 2, version: "Native Rain", difficulty_rating: 4.5 }),
    ],
    [
      beatmap({ id: 1, mode: "fruits", mode_int: 2, convert: true, version: "Standard Insane", difficulty_rating: 5.5 }),
    ],
  );

  const excludeConverts = visibleBeatmaps(beatmapset, "2", undefined, "exclude");
  expect(excludeConverts.map((b) => b.version)).toEqual(["Native Rain"]);

  const onlyConverts = visibleBeatmaps(beatmapset, "2", undefined, "only");
  expect(onlyConverts.map((b) => b.version)).toEqual(["Standard Insane"]);
});
