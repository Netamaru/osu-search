import { expect, test } from "bun:test";
import { defaultFilters, filtersFromSearchParams, filtersToSearchParams, toggleStatus } from "./filters.ts";
import { buildQuery, compileOsuParams, parseLength } from "./query.ts";

test("compiles range and exact filters into the osu query", () => {
  const filters = defaultFilters();
  filters.q = "freedom dive";
  filters.starsMin = "6.5";
  filters.starsMax = "8";
  filters.arMin = "9,3";
  filters.csMax = "4";
  filters.lengthMin = "3:30";
  filters.keysMin = "7";
  filters.artist = "xi";
  filters.creator = "rustbell";
  filters.title = "freedom dive";
  filters.difficulty = "four dimensions";
  filters.ranked = "2020-01-01";
  filters.rankedOp = ">=";
  filters.mode = "0";
  filters.status = ["ranked"];
  filters.sort = "plays_desc";
  filters.video = true;
  filters.featuredArtist = true;
  filters.genre = "3";

  expect(buildQuery(filters)).toBe(
    'freedom dive stars>=6.5 stars<=8 ar>=9.3 cs<=4 length>=210 keys>=7 artist=xi creator=rustbell title="freedom dive" difficulty="four dimensions" ranked>=2020-01-01',
  );

  const params = compileOsuParams(filters);
  expect(params.get("m")).toBe("0");
  expect(params.get("s")).toBe("ranked");
  expect(params.get("sort")).toBe("plays_desc");
  expect(params.get("e")).toBe("video");
  expect(params.get("c")).toBe("featured_artists");
  expect(params.get("g")).toBe("3");
  expect(params.get("nsfw")).toBe("false");
});

test("parses song lengths", () => {
  expect(parseLength("90")).toBe(90);
  expect(parseLength("1:05")).toBe(65);
  expect(parseLength("1:60")).toBeNull();
  expect(parseLength("nope")).toBeNull();
});

test("round-trips shareable filter urls", () => {
  const filters = defaultFilters();
  filters.q = "camellia";
  filters.mode = "3";
  filters.status = ["loved"];
  filters.nsfw = true;
  filters.converts = true;
  filters.hpMax = "6";
  filters.updated = "2024-05-01";
  filters.updatedOp = "<=";

  const restored = filtersFromSearchParams(filtersToSearchParams(filters));
  expect(restored).toEqual(filters);
});

test("keeps several statuses and treats presets as exclusive", () => {
  expect(toggleStatus(["leaderboard"], "pending")).toEqual(["pending"]);
  expect(toggleStatus(["pending"], "graveyard")).toEqual(["pending", "graveyard"]);
  expect(toggleStatus(["pending", "graveyard"], "pending")).toEqual(["graveyard"]);
  expect(toggleStatus(["pending", "graveyard"], "any")).toEqual(["any"]);
  expect(toggleStatus(["ranked"], "ranked")).toEqual(["ranked"]);

  const filters = defaultFilters();
  filters.status = ["graveyard", "pending"];
  const restored = filtersFromSearchParams(filtersToSearchParams(filters));
  expect(restored.status).toEqual(["pending", "graveyard"]);
});

test("drops invalid sort and status values", () => {
  const params = new URLSearchParams({
    status: "mine",
    sort: "secret_desc",
    mode: "9",
  });
  const filters = filtersFromSearchParams(params);
  expect(filters.status).toEqual(["leaderboard"]);
  expect(filters.sort).toBe("");
  expect(filters.mode).toBe("");
});
