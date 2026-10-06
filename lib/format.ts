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

const DEFAULT_FALLBACK_COLOR = readableDifficultyColor("#AAAAAA");
const PRECOMPUTED_STOPS: readonly [number, string][] = DIFFICULTY_STOPS.map(([min, hex]) => [
  min,
  readableDifficultyColor(hex),
]);

export function difficultyColor(rating: number): string {
  if (rating < 0.1) return DEFAULT_FALLBACK_COLOR;
  let color = PRECOMPUTED_STOPS[0][1];
  for (let i = 0; i < PRECOMPUTED_STOPS.length; i++) {
    const [min, hex] = PRECOMPUTED_STOPS[i];
    if (rating >= min) color = hex;
  }
  return color;
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

export function statusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case "ranked":
      return "/status/ranked.png";
    case "approved":
      return "/status/approved.png";
    case "loved":
      return "/status/loved.png";
    case "qualified":
      return "/status/qualified.png";
    case "pending":
      return "/status/pending.png";
    case "wip":
      return "/status/wip.png";
    case "graveyard":
      return "/status/graveyard.png";
    default:
      return "/status/pending.png";
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}


export function formatUtcDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

export function formatLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function formatLocalDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}


