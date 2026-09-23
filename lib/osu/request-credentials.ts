import { parseClientCredentials, type ClientCredentials } from "../credentials";

export type CredentialResult =
  | { ok: true; credentials: ClientCredentials }
  | { ok: false; reason: "missing" | "invalid" };

export function resolveCredentials(request: Request): CredentialResult {
  const headerId = request.headers.get("x-osu-client-id");
  const headerSecret = request.headers.get("x-osu-client-secret");
  if (headerId !== null || headerSecret !== null) {
    const credentials = parseClientCredentials(headerId ?? "", headerSecret ?? "");
    return credentials ? { ok: true, credentials } : { ok: false, reason: "invalid" };
  }

  const credentials = parseClientCredentials(process.env.OSU_CLIENT_ID ?? "", process.env.OSU_CLIENT_SECRET ?? "");
  return credentials ? { ok: true, credentials } : { ok: false, reason: "missing" };
}

export function credentialsFailure(result: Extract<CredentialResult, { ok: false }>) {
  if (result.reason === "invalid") {
    return {
      status: 400,
      body: { error: "invalid_credentials", message: "Client id or secret is not valid." },
    };
  }
  return {
    status: 503,
    body: { error: "missing_credentials", message: "Add an osu! API client to search." },
  };
}
