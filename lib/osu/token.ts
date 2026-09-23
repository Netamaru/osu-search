import { createHash } from "node:crypto";
import type { ClientCredentials } from "../credentials";

export class MissingCredentialsError extends Error {
  constructor() {
    super("An osu! API client id and secret are required.");
    this.name = "MissingCredentialsError";
  }
}

type CachedToken = {
  token: string;
  expiresAt: number;
  fingerprint: string;
};

const cached = new Map<string, CachedToken>();
const pending = new Map<string, Promise<string>>();

function fingerprint(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

async function requestToken(credentials: ClientCredentials): Promise<string> {
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    grant_type: "client_credentials",
    scope: "public",
  });

  const response = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`osu! rejected this API client (${response.status}).`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token || !data.expires_in) {
    throw new Error("osu! token response was missing access_token.");
  }

  cached.set(credentials.clientId, {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    fingerprint: fingerprint(credentials.clientSecret),
  });
  return data.access_token;
}

export async function getAccessToken(credentials: ClientCredentials, force = false): Promise<string> {
  const print = fingerprint(credentials.clientSecret);
  const hit = cached.get(credentials.clientId);
  if (!force && hit && hit.fingerprint === print && hit.expiresAt > Date.now() + 30_000) return hit.token;
  if (hit && hit.fingerprint !== print) cached.delete(credentials.clientId);

  const key = `${credentials.clientId}:${print}`;
  if (force || !pending.has(key)) {
    const current = requestToken(credentials).finally(() => {
      if (pending.get(key) === current) pending.delete(key);
    });
    pending.set(key, current);
  }
  return pending.get(key) as Promise<string>;
}
