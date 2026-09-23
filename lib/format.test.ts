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
