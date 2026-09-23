const DIFFICULTY_STOPS: [number, string][] = [
  [0.1, "#4290FB"],
  [1.25, "#4FC0FF"],
  [2, "#4FFFD5"],
  [2.5, "#7CFF4F"],
  [3.3, "#F6F05C"],
  [4.2, "#FF8068"],
  [4.9, "#FF4E6F"],
  [5.8, "#C645B8"],
  [6.7, "#6563DE"],
  [7.7, "#18158E"],
  [9, "#000000"],
];

const TEXT_ON_DIFFICULTY = "#F7F4EE";
const MAX_CHIP_LUMINANCE = 0.12;

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const channel = (value: number) => Math.round(value).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function linearChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

function readableDifficultyColor(hex: string): string {
  let [r, g, b] = hexToRgb(hex);
  for (let guard = 0; guard < 16; guard += 1) {
    const rounded = rgbToHex(r, g, b);
    const [rr, gg, bb] = hexToRgb(rounded);
    if (luminance(rr, gg, bb) <= MAX_CHIP_LUMINANCE) return rounded;
    r *= 0.84;
    g *= 0.84;
    b *= 0.84;
  }
  return rgbToHex(r, g, b);
}

export function difficultyColor(rating: number): string {
  if (rating < 0.1) return readableDifficultyColor("#AAAAAA");
  let color = DIFFICULTY_STOPS[0][1];
  for (const [min, hex] of DIFFICULTY_STOPS) {
    if (rating >= min) color = hex;
  }
  return readableDifficultyColor(color);
}

export function difficultyTextColor(): string {
  return TEXT_ON_DIFFICULTY;
}

export function compactCount(value: number): string {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    const scaled = value / 1_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}k`;
  }
  return String(value);
}

export function formatLength(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function absoluteUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

export function formatStatus(status: string): string {
  if (status === "wip") return "WIP";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
