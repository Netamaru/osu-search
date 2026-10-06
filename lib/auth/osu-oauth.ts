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

export function getRedirectUri(request?: Request): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/api/auth/callback/osu`;
  }

  if (request) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    if (host) {
      return `${proto}://${host}/api/auth/callback/osu`;
    }
  }

  return "http://localhost:3000/api/auth/callback/osu";
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
