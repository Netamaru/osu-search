import { decodeCredentials, type ClientCredentials } from "@/lib/credentials";

const STORAGE_KEY = "osu-search-credentials";
const EVENT = "osu-credentials-change";

export function subscribeCredentials(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function credentialsSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function credentialHeaders(credentials: ClientCredentials | null): HeadersInit {
  if (!credentials) return {};
  return {
    "x-osu-client-id": credentials.clientId,
    "x-osu-client-secret": credentials.clientSecret,
  };
}

export function saveCredentials(credentials: ClientCredentials) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  window.dispatchEvent(new Event(EVENT));
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function storedCredentials(raw: string) {
  return decodeCredentials(raw);
}
