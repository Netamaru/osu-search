import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeOsuCode, fetchOsuMe, getOsuOAuthCredentials, getRedirectUri } from "@/lib/auth/osu-oauth";
import {
  OAUTH_RETURN_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createSession, upsertUser } from "@/lib/db/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const storedState = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const returnTo = cookieStore.get(OAUTH_RETURN_COOKIE_NAME)?.value || "/";

  // Cleanup oauth cookies
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);
  cookieStore.delete(OAUTH_RETURN_COOKIE_NAME);

  const redirectWithError = (errCode: string) => {
    const target = new URL(returnTo, url.origin);
    target.searchParams.set("auth_error", errCode);
    return NextResponse.redirect(target);
  };

  if (error) {
    console.error("osu! OAuth error:", error);
    return redirectWithError("access_denied");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return redirectWithError("invalid_state");
  }

  const credentials = getOsuOAuthCredentials();
  if (!credentials) {
    return redirectWithError("missing_server_credentials");
  }

  const sql = getDb();
  if (!sql) {
    return redirectWithError("db_not_configured");
  }

  try {
    const redirectUri = getRedirectUri(request);
    const tokenData = await exchangeOsuCode(credentials, code, redirectUri);
    const osuUser = await fetchOsuMe(tokenData.access_token);

    // Upsert user in Postgres
    const user = await upsertUser(sql, {
      osu_id: osuUser.id,
      username: osuUser.username,
      avatar_url: osuUser.avatar_url,
      country_code: osuUser.country_code || osuUser.country?.code || "",
    });

    // Create session in Postgres
    const sessionToken = await createSession(sql, user.osu_id, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresInSeconds: tokenData.expires_in || 30 * 86400,
    });

    // Set session cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 86400, // 30 days
      secure: process.env.NODE_ENV === "production",
    });

    const target = new URL(returnTo, url.origin);
    target.searchParams.delete("auth_error");
    return NextResponse.redirect(target);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return redirectWithError("auth_failed");
  }
}
