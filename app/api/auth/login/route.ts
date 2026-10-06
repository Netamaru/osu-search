import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildOsuAuthorizeUrl, getAppOrigin, getOsuOAuthCredentials, getRedirectUri } from "@/lib/auth/osu-oauth";
import { OAUTH_RETURN_COOKIE_NAME, OAUTH_STATE_COOKIE_NAME } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request);
  const rawReturnTo = url.searchParams.get("returnTo") || "/";
  const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/";

  const credentials = getOsuOAuthCredentials();
  if (!credentials) {
    const errorUrl = new URL(returnTo, origin);
    errorUrl.searchParams.set("auth_error", "missing_server_credentials");
    return NextResponse.redirect(errorUrl);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = getRedirectUri(request);
  const authorizeUrl = buildOsuAuthorizeUrl(credentials.clientId, redirectUri, state);

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set(OAUTH_RETURN_COOKIE_NAME, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(authorizeUrl);
}
