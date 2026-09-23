import { expect, test } from "bun:test";
import { searchReturnHref } from "./search-return.ts";

test("keeps the applied filters when returning to search", () => {
  expect(searchReturnHref("mode=2&starsMin=6.5")).toBe("/?mode=2&starsMin=6.5");
  expect(searchReturnHref("")).toBe("/");
});
