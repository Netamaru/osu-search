const SEARCH_RETURN_KEY = "osu-search-return";
const SEARCH_RETURN_EVENT = "osu-search-return";
const SEARCH_SCROLL_KEY = "osu-search-scroll";
const SEARCH_SCROLL_PENDING_KEY = "osu-search-scroll-pending";

export function searchReturnHref(query: string): string {
  return query ? `/?${query}` : "/";
}

export function rememberSearch(query: string) {
  try {
    sessionStorage.setItem(SEARCH_RETURN_KEY, query);
    window.dispatchEvent(new Event(SEARCH_RETURN_EVENT));
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function rememberedSearch(): string {
  try {
    return sessionStorage.getItem(SEARCH_RETURN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function subscribeSearchReturn(onChange: () => void) {
  window.addEventListener(SEARCH_RETURN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEARCH_RETURN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function searchReturnSnapshot() {
  return rememberedSearch();
}

export function markScrollRestore() {
  try {
    sessionStorage.setItem(SEARCH_SCROLL_KEY, String(window.scrollY));
    sessionStorage.setItem(SEARCH_SCROLL_PENDING_KEY, "1");
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function peekScrollRestore(): number | null {
  try {
    if (sessionStorage.getItem(SEARCH_SCROLL_PENDING_KEY) !== "1") return null;
    const y = Number(sessionStorage.getItem(SEARCH_SCROLL_KEY));
    return Number.isFinite(y) ? y : 0;
  } catch {
    return null;
  }
}

export function clearScrollRestore() {
  try {
    sessionStorage.removeItem(SEARCH_SCROLL_PENDING_KEY);
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}
