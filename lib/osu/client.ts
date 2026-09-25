import type { ClientCredentials } from "../credentials";
import { getAccessToken, MissingCredentialsError } from "./token";

const API = "https://osu.ppy.sh/api/v2";
const CACHE_TTL_MS = 60_000;
const MIN_INTERVAL_MS = 300;
const MAX_CACHE_ENTRIES = 300;

type CacheEntry = {
  expires: number;
  body: unknown;
};

type Lane = {
  queue: Promise<void>;
  nextSlot: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();
const lanes = new Map<string, Lane>();

function setCache(key: string, value: CacheEntry) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires <= now) cache.delete(k);
    }
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }
  cache.set(key, value);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function schedule<T>(clientId: string, task: () => Promise<T>): Promise<T> {
  const lane = lanes.get(clientId) ?? { queue: Promise.resolve(), nextSlot: 0 };
  lanes.set(clientId, lane);
  const run = lane.queue.then(async () => {
    const wait = Math.max(0, lane.nextSlot - Date.now());
    if (wait > 0) await delay(wait);
    lane.nextSlot = Date.now() + MIN_INTERVAL_MS;
    return task();
  });
  lane.queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export class OsuApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OsuApiError";
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || `osu!api responded with ${response.status}.`;
  } catch {
    return `osu!api responded with ${response.status}.`;
  }
}

async function fetchJson(url: string, credentials: ClientCredentials, forceToken: boolean): Promise<unknown> {
  const token = await getAccessToken(credentials, forceToken);
  const response = await schedule(credentials.clientId, () =>
    fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }),
  );

  if (response.status === 401 && !forceToken) {
    return fetchJson(url, credentials, true);
  }

  if (!response.ok) {
    const message =
      response.status === 429
        ? "osu! is rate limiting this client. Wait a moment and try again."
        : await readError(response);
    throw new OsuApiError(message, response.status);
  }

  return response.json();
}

export async function osuGet<T>(path: string, credentials: ClientCredentials, params?: URLSearchParams): Promise<T> {
  const url = params && [...params.keys()].length > 0 ? `${API}${path}?${params}` : `${API}${path}`;
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.body as T;

  const flightKey = `${credentials.clientId}:${url}`;
  const existing = inflight.get(flightKey);
  if (existing) return existing as Promise<T>;

  const request = fetchJson(url, credentials, false)
    .then((body) => {
      setCache(url, { expires: Date.now() + CACHE_TTL_MS, body });
      return body as T;
    })
    .finally(() => {
      inflight.delete(flightKey);
    });

  inflight.set(flightKey, request);
  return request;
}

export { MissingCredentialsError };
