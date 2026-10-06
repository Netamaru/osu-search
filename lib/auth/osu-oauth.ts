import { parseClientCredentials, type ClientCredentials } from "../credentials";

export type OsuTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

export type OsuMeResponse = {
  id: number;
  username: string;
  avatar_url: string;
  country_code?: string;
  country?: {
    code: string;
    name: string;
  };
};

export function getOsuOAuthCredentials(): ClientCredentials | null {
  const id = process.env.OSU_CLIENT_ID ?? "";
  const secret = process.env.OSU_CLIENT_SECRET ?? "";
  return parseClientCredentials(id, secret);
}

export function getAppOrigin(request?: Request): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = forwardedHost || request.headers.get("host");

    if (host) {
      const isInternalLocalhost =
        (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) && host !== "localhost:3000";

      if (!isInternalLocalhost || process.env.NODE_ENV !== "production") {
        const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
        return `${proto}://${host}`;
      }
    }
  }

  if (process.env.NODE_ENV === "production") {
    return "https://osusearch.netamaru.id";
  }

  return "http://localhost:3000";
}

export function getRedirectUri(request?: Request): string {
  const origin = getAppOrigin(request);
  return `${origin}/api/auth/callback/osu`;
}

export function buildOsuAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify public",
    state,
  });
  return `https://osu.ppy.sh/oauth/authorize?${params.toString()}`;
}

export async function exchangeOsuCode(
  credentials: ClientCredentials,
  code: string,
  redirectUri: string,
): Promise<OsuTokenResponse> {
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
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
    const errorText = await response.text();
    throw new Error(`osu! token exchange failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OsuTokenResponse;
  if (!data.access_token) {
    throw new Error("osu! token response did not contain access_token");
  }
  return data;
}

export async function fetchOsuMe(accessToken: string): Promise<OsuMeResponse> {
  const response = await fetch("https://osu.ppy.sh/api/v2/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch osu! profile (${response.status})`);
  }

  return (await response.json()) as OsuMeResponse;
}
