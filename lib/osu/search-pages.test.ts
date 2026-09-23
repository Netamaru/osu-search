import { expect, test } from "bun:test";
import { mergeSearchPages, parseStatusCursors } from "./search-pages.ts";
import type { Beatmapset } from "./types.ts";

function set(id: number, playCount: number): Beatmapset {
  return { id, play_count: playCount, title: `Map ${id}`, artist: "artist" } as Beatmapset;
}

test("interleaves statuses and keeps each cursor", () => {
  const merged = mergeSearchPages(
    [
      { status: "pending", beatmapsets: [set(1, 10), set(2, 9)], cursor_string: "p2", total: 20 },
      { status: "graveyard", beatmapsets: [set(3, 80), set(4, 1)], cursor_string: null, total: 2 },
    ],
    "",
  );

  expect(merged.beatmapsets?.map((beatmapset) => beatmapset.id)).toEqual([1, 3, 2, 4]);
  expect(merged.total).toBe(22);
  expect(JSON.parse(merged.cursor_string ?? "")).toEqual({ pending: "p2", graveyard: null });
});

test("sorts a combined page by play count", () => {
  const merged = mergeSearchPages(
    [
      { status: "pending", beatmapsets: [set(1, 10)], cursor_string: null, total: 1 },
      { status: "graveyard", beatmapsets: [set(3, 80)], cursor_string: null, total: 1 },
    ],
    "plays_desc",
  );

  expect(merged.beatmapsets?.map((beatmapset) => beatmapset.id)).toEqual([3, 1]);
  expect(merged.cursor_string).toBeNull();
});

test("reads per-status cursors", () => {
  expect(parseStatusCursors(JSON.stringify({ pending: "abc", graveyard: null }), ["pending", "graveyard"])).toEqual({
    pending: "abc",
    graveyard: null,
  });
  expect(parseStatusCursors("not-json", ["pending"])).toBeNull();
});
