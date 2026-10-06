import { describe, expect, it } from "bun:test";
import { buildOsuAuthorizeUrl, getAppOrigin, getRedirectUri } from "./osu-oauth";

describe("osu! OAuth helpers", () => {
  it("builds the authorize URL correctly", () => {
    const url = buildOsuAuthorizeUrl("12345", "http://localhost:3000/api/auth/callback/osu", "random_state_123");
    expect(url).toContain("https://osu.ppy.sh/oauth/authorize");
    expect(url).toContain("client_id=12345");
    expect(url).toContain("state=random_state_123");
    expect(url).toContain("scope=identify+public");
    expect(url).toContain("response_type=code");
  });

  it("calculates redirect URI from request headers when NEXT_PUBLIC_APP_URL is not set", () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;

    const req = new Request("https://example.com/api/auth/login", {
      headers: {
        host: "my-osu-search.com",
        "x-forwarded-proto": "https",
      },
    });

    const redirectUri = getRedirectUri(req);
    expect(redirectUri).toBe("https://my-osu-search.com/api/auth/callback/osu");

    if (originalEnv) process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("prefers NEXT_PUBLIC_APP_URL when present", () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://custom-domain.com";

    const req = new Request("http://localhost:3000/api/auth/login", {
      headers: { host: "localhost:3000" },
    });

    const redirectUri = getRedirectUri(req);
    expect(redirectUri).toBe("https://custom-domain.com/api/auth/callback/osu");

    if (originalEnv) process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    else delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("ignores internal localhost proxy port in production and falls back to canonical domain", () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.NODE_ENV = "production";

    const req = new Request("http://localhost:4008/api/auth/callback/osu", {
      headers: { host: "localhost:4008" },
    });

    const origin = getAppOrigin(req);
    expect(origin).toBe("https://osusearch.netamaru.id");

    if (originalEnv) process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    else delete process.env.NEXT_PUBLIC_APP_URL;
    if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
  });
});
