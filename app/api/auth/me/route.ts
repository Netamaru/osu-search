import { NextResponse } from "next/server";
import { getOsuOAuthCredentials } from "@/lib/auth/osu-oauth";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { user, dbConfigured } = await getCurrentUser(request);
  const serverOsuConfigured = Boolean(getOsuOAuthCredentials());

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
    dbConfigured,
    serverOsuConfigured,
  });
}
