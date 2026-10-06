import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getSessionUser, type DbUser } from "@/lib/db/queries";

export const SESSION_COOKIE_NAME = "osu_session";
export const OAUTH_STATE_COOKIE_NAME = "osu_oauth_state";
export const OAUTH_RETURN_COOKIE_NAME = "osu_oauth_return";

export function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) return {};
  const map: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [name, ...vals] = part.trim().split("=");
    if (name) {
      map[name] = decodeURIComponent(vals.join("="));
    }
  }
  return map;
}

export async function getSessionToken(request?: Request): Promise<string | null> {
  if (request) {
    const cookiesMap = parseCookieHeader(request.headers.get("cookie"));
    if (cookiesMap[SESSION_COOKIE_NAME]) {
      return cookiesMap[SESSION_COOKIE_NAME];
    }
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return token ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  request?: Request,
): Promise<{ user: DbUser | null; sessionToken: string | null; dbConfigured: boolean }> {
  const sql = getDb();
  if (!sql) {
    return { user: null, sessionToken: null, dbConfigured: false };
  }

  const token = await getSessionToken(request);
  if (!token) {
    return { user: null, sessionToken: null, dbConfigured: true };
  }

  try {
    const result = await getSessionUser(sql, token);
    if (!result) {
      return { user: null, sessionToken: token, dbConfigured: true };
    }
    return { user: result.user, sessionToken: token, dbConfigured: true };
  } catch (error) {
    console.error("Failed to get current user session:", error);
    return { user: null, sessionToken: token, dbConfigured: true };
  }
}
