import { expect, test } from "bun:test";
import { decodeCredentials, parseClientCredentials } from "./credentials.ts";
import { resolveCredentials } from "./osu/request-credentials.ts";

test("parses a numeric client id and a printable secret", () => {
  expect(parseClientCredentials(" 12345 ", " secret-value ")).toEqual({
    clientId: "12345",
    clientSecret: "secret-value",
  });
  expect(parseClientCredentials("abc", "secret-value")).toBeNull();
  expect(parseClientCredentials("12345", "has space")).toBeNull();
  expect(parseClientCredentials("12345", "")).toBeNull();
});

test("decodes credentials stored as json", () => {
  expect(decodeCredentials(JSON.stringify({ clientId: "9", clientSecret: "abcdefgh" }))).toEqual({
    clientId: "9",
    clientSecret: "abcdefgh",
  });
  expect(decodeCredentials("not-json")).toBeNull();
  expect(decodeCredentials("")).toBeNull();
});

test("uses request headers before the server environment", () => {
  const previousId = process.env.OSU_CLIENT_ID;
  const previousSecret = process.env.OSU_CLIENT_SECRET;
  process.env.OSU_CLIENT_ID = "111";
  process.env.OSU_CLIENT_SECRET = "server-secret";

  try {
    const fromHeader = resolveCredentials(
      new Request("http://localhost/api/search", {
        headers: { "x-osu-client-id": "222", "x-osu-client-secret": "browser-secret" },
      }),
    );
    expect(fromHeader).toEqual({ ok: true, credentials: { clientId: "222", clientSecret: "browser-secret" } });

    const fromEnv = resolveCredentials(new Request("http://localhost/api/search"));
    expect(fromEnv).toEqual({ ok: true, credentials: { clientId: "111", clientSecret: "server-secret" } });

    const invalid = resolveCredentials(
      new Request("http://localhost/api/search", {
        headers: { "x-osu-client-id": "nope", "x-osu-client-secret": "browser-secret" },
      }),
    );
    expect(invalid).toEqual({ ok: false, reason: "invalid" });
  } finally {
    if (previousId === undefined) delete process.env.OSU_CLIENT_ID;
    else process.env.OSU_CLIENT_ID = previousId;
    if (previousSecret === undefined) delete process.env.OSU_CLIENT_SECRET;
    else process.env.OSU_CLIENT_SECRET = previousSecret;
  }
});
