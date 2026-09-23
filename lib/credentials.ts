export type ClientCredentials = {
  clientId: string;
  clientSecret: string;
};

export function parseClientCredentials(clientId: string, clientSecret: string): ClientCredentials | null {
  const id = clientId.trim();
  const secret = clientSecret.trim();
  if (!/^\d{1,15}$/.test(id)) return null;
  if (!/^[\x21-\x7E]{1,200}$/.test(secret)) return null;
  return { clientId: id, clientSecret: secret };
}

export function decodeCredentials(raw: string): ClientCredentials | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { clientId?: unknown; clientSecret?: unknown };
    if (typeof data.clientId !== "string" || typeof data.clientSecret !== "string") return null;
    return parseClientCredentials(data.clientId, data.clientSecret);
  } catch {
    return null;
  }
}
