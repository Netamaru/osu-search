import { expect, test } from "bun:test";
import { defaultFilters, filtersFromSearchParams, filtersToSearchParams, toggleStatus } from "./filters.ts";
import { buildQuery, compileOsuParams, parseLength, parseOsuQuery } from "./query.ts";

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
  filters.video = "only";
  filters.featuredArtist = "only";
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
  filters.nsfw = "any";
  filters.converts = "only";
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

test("parses osu query back into filters", () => {
  const query = `q=freedom dive stars>=6.5 stars<=8 ar>=9.3 cs<=4 length>=210 keys>=7 artist=xi creator=rustbell title="freedom dive" difficulty="four dimensions" ranked>=2020-01-01
m=0
s=ranked
sort=plays_desc
e=video
c=featured_artists
g=3
nsfw=false`;

  const parsed = parseOsuQuery(query);
  expect(parsed.q).toBe("freedom dive");
  expect(parsed.starsMin).toBe("6.5");
  expect(parsed.starsMax).toBe("8");
  expect(parsed.arMin).toBe("9.3");
  expect(parsed.csMax).toBe("4");
  expect(parsed.lengthMin).toBe("210");
  expect(parsed.keysMin).toBe("7");
  expect(parsed.artist).toBe("xi");
  expect(parsed.creator).toBe("rustbell");
  expect(parsed.title).toBe("freedom dive");
  expect(parsed.difficulty).toBe("four dimensions");
  expect(parsed.ranked).toBe("2020-01-01");
  expect(parsed.rankedOp).toBe(">=");
  expect(parsed.mode).toBe("0");
  expect(parsed.status).toEqual(["ranked"]);
  expect(parsed.sort).toBe("plays_desc");
  expect(parsed.video).toBe("only");
  expect(parsed.featuredArtist).toBe("only");
  expect(parsed.genre).toBe("3");
});

test("parses plain query string with inline filters", () => {
  const parsed = parseOsuQuery("xi stars>=7.5 bpm>=200");
  expect(parsed.q).toBe("xi");
  expect(parsed.starsMin).toBe("7.5");
  expect(parsed.bpmMin).toBe("200");
});

test("supports tri-state include, only, and exclude filters", () => {
  const filters = defaultFilters();
  filters.video = "exclude";
  filters.storyboard = "only";
  filters.nsfw = "only";

  const params = filtersToSearchParams(filters);
  expect(params.get("video")).toBe("exclude");
  expect(params.get("storyboard")).toBe("only");
  expect(params.get("nsfw")).toBe("only");

  const restored = filtersFromSearchParams(params);
  expect(restored.video).toBe("exclude");
  expect(restored.storyboard).toBe("only");
  expect(restored.nsfw).toBe("only");
});

