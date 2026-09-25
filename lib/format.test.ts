import { expect, test } from "bun:test";
import { difficultyColor, difficultyTextColor } from "./format.ts";

function linearChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function contrast(background: string, foreground: string): number {
  const channels = (hex: string) => {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
  };
  const luminance = (hex: string) => {
    const [r, g, b] = channels(hex);
    return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
  };
  const lighter = Math.max(luminance(background), luminance(foreground));
  const darker = Math.min(luminance(background), luminance(foreground));
  return (lighter + 0.05) / (darker + 0.05);
}

test("difficulty chips keep a light star rating on a darker hue", () => {
  for (const rating of [0, 0.5, 1.5, 2.2, 3, 4.5, 5.2, 6, 7, 8, 10]) {
    expect(contrast(difficultyColor(rating), difficultyTextColor())).toBeGreaterThan(5.5);
  }
  expect(difficultyColor(2.5)).toBe("#346b21");
  expect(difficultyColor(3.3)).toBe("#565420");
  expect(difficultyTextColor()).toBe("#F7F4EE");
});

test("formats beatmap status and resolves correct status icon path", () => {
  const { formatStatus, statusIcon } = require("./format.ts");
  expect(formatStatus("ranked")).toBe("Ranked");
  expect(formatStatus("wip")).toBe("WIP");
  expect(formatStatus("graveyard")).toBe("Graveyard");

  expect(statusIcon("ranked")).toBe("/status/ranked.png");
  expect(statusIcon("loved")).toBe("/status/loved.png");
  expect(statusIcon("qualified")).toBe("/status/qualified.png");
  expect(statusIcon("graveyard")).toBe("/status/graveyard.png");
  expect(statusIcon("wip")).toBe("/status/wip.png");
  expect(statusIcon("pending")).toBe("/status/pending.png");
});

test("formats date deterministically as DD MMM YYYY", () => {
  const { formatDate } = require("./format.ts");
  expect(formatDate("2024-05-18T14:32:00Z")).toBe("18 May 2024");
  expect(formatDate("2023-11-04T08:15:22.000000Z")).toBe("4 Nov 2023");
  expect(formatDate("2021-01-01T00:00:00Z")).toBe("1 Jan 2021");
  expect(formatDate("")).toBe("");
  expect(formatDate(null)).toBe("");
  expect(formatDate(undefined)).toBe("");
  expect(formatDate("invalid-date")).toBe("");
});

test("formats UTC date and time deterministically", () => {
  const { formatUtcDateTime } = require("./format.ts");
  expect(formatUtcDateTime("2024-05-18T14:32:00Z")).toBe("2024-05-18 14:32:00 UTC");
  expect(formatUtcDateTime("2023-11-04T08:05:09Z")).toBe("2023-11-04 08:05:09 UTC");
  expect(formatUtcDateTime("")).toBe("");
  expect(formatUtcDateTime(null)).toBe("");
  expect(formatUtcDateTime(undefined)).toBe("");
  expect(formatUtcDateTime("invalid-date")).toBe("");
});

test("formats short local date", () => {
  const { formatShortDate } = require("./format.ts");
  expect(formatShortDate("2024-05-18T14:32:00Z")).toMatch(/\d{1,4}[/.-]\d{1,4}[/.-]\d{1,4}/);
  expect(formatShortDate("")).toBe("");
  expect(formatShortDate(null)).toBe("");
  expect(formatShortDate(undefined)).toBe("");
  expect(formatShortDate("invalid-date")).toBe("");
});

