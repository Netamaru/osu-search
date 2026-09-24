"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BeatmapCard } from "@/components/beatmap-card";
import { BeatmapDetailModal } from "@/components/beatmap-detail-modal";
import { useCredentials } from "@/components/credentials-provider";
import { FilterPanel } from "@/components/filter-panel";
import { QueryStrip } from "@/components/query-strip";
import { SetupNotice } from "@/components/setup-notice";
import { needsConvertRatings } from "@/lib/osu/difficulties";
import { filtersFromSearchParams, filtersToSearchParams } from "@/lib/osu/filters";
import { clearScrollRestore, peekScrollRestore, rememberSearch } from "@/lib/search-return";
import type { Beatmap, Beatmapset, SearchFilters, SearchResponse } from "@/lib/osu/types";

type Result = {
  beatmapsets: Beatmapset[];
  cursor: string | null;
  total: number;
  notice: string | null;
};

const autoLoadListeners = new Set<() => void>();
let autoLoadCached: boolean | null = null;

function subscribeAutoLoad(callback: () => void) {
  autoLoadListeners.add(callback);
  return () => {
    autoLoadListeners.delete(callback);
  };
}

function getAutoLoadSnapshot() {
  if (autoLoadCached === null) {
    try {
      autoLoadCached = localStorage.getItem("osu_auto_load_more") === "true";
    } catch {
      autoLoadCached = false;
    }
  }
  return autoLoadCached;
}

function getAutoLoadServerSnapshot() {
  return false;
}

function setAutoLoadStorage(next: boolean) {
  autoLoadCached = next;
  try {
    localStorage.setItem("osu_auto_load_more", String(next));
  } catch {
    // Ignore storage errors
  }
  autoLoadListeners.forEach((listener) => listener());
}

function AutoLoadToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2 cursor-pointer select-none font-mono text-xs text-muted hover:text-fg transition-colors"
      title="Automatically load more beatmaps when scrolling near the bottom"
    >
      <span
        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors ${
          checked ? "border-accent bg-accent" : "border-line bg-subtle"
        }`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span>Auto load on scroll</span>
    </button>
  );
}

export function SearchPage({ query }: { query: string }) {
  const router = useRouter();
  const [trackedQuery, setTrackedQuery] = useState(query);
  const [historyQuery, setHistoryQuery] = useState<string | null>(null);
  if (query !== trackedQuery) {
    setTrackedQuery(query);
    setHistoryQuery(null);
  }
  const urlKey = historyQuery ?? query;
  const committed = useMemo(() => filtersFromSearchParams(new URLSearchParams(urlKey)), [urlKey]);

  const [draft, setDraft] = useState<SearchFilters>(committed);
  const draftRef = useRef(draft);
  const timer = useRef<number | null>(null);
  const pendingWrite = useRef<string | null>(null);
  const requestId = useRef(0);

  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    result: Result | null;
    error: string | null;
    setup: boolean;
  }>({ key: null, result: null, error: null, setup: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [convertMap, setConvertMap] = useState<Record<number, Beatmap[]>>({});
  const convertMapRef = useRef(convertMap);
  const [convertPass, setConvertPass] = useState(0);
  const { ready, headers, openModal } = useCredentials();
  const [detailBeatmapset, setDetailBeatmapset] = useState<{ id: number; initial?: Beatmapset } | null>(null);

  const autoLoadMore = useSyncExternalStore(subscribeAutoLoad, getAutoLoadSnapshot, getAutoLoadServerSnapshot);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const scrollRestore = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    rememberSearch(urlKey);
  }, [urlKey]);

  useEffect(() => {
    if (scrollRestore.current === undefined) scrollRestore.current = peekScrollRestore();
    const y = scrollRestore.current;
    if (y === null || snapshot.key !== urlKey || !snapshot.result) return;
    scrollRestore.current = null;
    clearScrollRestore();
    const apply = () => window.scrollTo(0, y);
    apply();
    const frame = window.requestAnimationFrame(apply);
    const timers = [0, 50, 150, 300].map((delay) => window.setTimeout(apply, delay));
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [snapshot, urlKey]);

  useEffect(() => {
    function onPop() {
      if (window.location.pathname !== "/") return;
      pendingWrite.current = null;
      if (timer.current) window.clearTimeout(timer.current);
      setHistoryQuery(window.location.search.replace(/^\?/, ""));
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const next = filtersFromSearchParams(new URLSearchParams(urlKey));
    const parsedKey = filtersToSearchParams(next).toString();
    if (pendingWrite.current !== null) {
      if (pendingWrite.current === parsedKey || pendingWrite.current === urlKey) {
        pendingWrite.current = null;
      }
      return;
    }
    if (parsedKey === filtersToSearchParams(draftRef.current).toString()) return;
    if (timer.current) window.clearTimeout(timer.current);
    draftRef.current = next;
    setDraft(next);
  }, [urlKey]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const id = ++requestId.current;

    fetch(`/api/search?${urlKey}`, { signal: controller.signal, headers })
      .then(async (response) => {
        const data = (await response.json()) as SearchResponse & { error?: string; message?: string };
        if (controller.signal.aborted || requestId.current !== id) return;
        if (data.error === "missing_credentials") {
          setSnapshot({ key: urlKey, result: null, error: null, setup: true });
          openModal();
          return;
        }
        if (!response.ok) {
          setSnapshot({ key: urlKey, result: null, error: data.message || "Search failed.", setup: false });
          return;
        }
        setSnapshot({
          key: urlKey,
          setup: false,
          error: null,
          result: {
            beatmapsets: data.beatmapsets ?? [],
            cursor: data.cursor_string,
            total: data.total ?? 0,
            notice: typeof data.error === "string" ? data.error : null,
          },
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (requestId.current !== id) return;
        setSnapshot({ key: urlKey, result: null, error: "Search failed.", setup: false });
      });

    return () => controller.abort();
  }, [urlKey, ready, headers, openModal]);

  useEffect(() => {
    convertMapRef.current = convertMap;
  }, [convertMap]);

  useEffect(() => {
    if (!ready || snapshot.key !== urlKey || !snapshot.result) return;
    const currentFilters = filtersFromSearchParams(new URLSearchParams(urlKey));
    const mode = currentFilters.mode;
    if (mode !== "1" && mode !== "2" && mode !== "3") return;

    const missing = snapshot.result.beatmapsets
      .filter((beatmapset) => needsConvertRatings(beatmapset, mode, currentFilters.converts) && convertMapRef.current[beatmapset.id] === undefined)
      .map((beatmapset) => beatmapset.id)
      .slice(0, 5);
    if (missing.length === 0) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ ids: missing.join(",") });
    fetch(`/api/beatmapsets/converts?${params}`, { signal: controller.signal, headers })
      .then(async (response) => {
        const data = (await response.json()) as { converts?: Record<string, Beatmap[]> };
        if (controller.signal.aborted) return;
        setConvertMap((current) => {
          const next = { ...current };
          for (const id of missing) next[id] = response.ok ? (data.converts?.[String(id)] ?? []) : [];
          return next;
        });
        if (response.ok) setConvertPass((pass) => pass + 1);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [snapshot, urlKey, convertPass, ready, headers]);

  const loading = snapshot.key !== urlKey;
  const settled = snapshot.key === urlKey;
  const result = snapshot.result;
  const setup = settled && snapshot.setup;
  const error = settled ? snapshot.error : null;

  function writeUrl(next: SearchFilters) {
    const qs = filtersToSearchParams(next).toString();
    pendingWrite.current = qs;
    rememberSearch(qs);
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function commit(next: SearchFilters) {
    if (timer.current) window.clearTimeout(timer.current);
    draftRef.current = next;
    setDraft(next);
    writeUrl(next);
  }

  function commitSoon(next: SearchFilters) {
    draftRef.current = next;
    setDraft(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => writeUrl(draftRef.current), 400);
  }

  function patch(partial: Partial<SearchFilters>, when: "now" | "soon") {
    const next = { ...draftRef.current, ...partial };
    if (when === "now") commit(next);
    else commitSoon(next);
  }

  async function loadMore() {
    if (!result?.cursor || loadingMore) return;
    const id = requestId.current;
    const cursor = result.cursor;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams(urlKey);
      params.set("cursor", cursor);
      const response = await fetch(`/api/search?${params}`, { headers });
      const data = (await response.json()) as SearchResponse & { message?: string };
      if (requestId.current !== id) return;
      if (!response.ok) {
        setSnapshot((current) => ({
          ...current,
          error: data.message || "Could not load more beatmaps.",
        }));
        return;
      }
      setSnapshot((current) => {
        if (!current.result || current.key !== urlKey) return current;
        const seen = new Set(current.result.beatmapsets.map((beatmapset) => beatmapset.id));
        const more = (data.beatmapsets ?? []).filter((beatmapset) => !seen.has(beatmapset.id));
        return {
          ...current,
          error: null,
          result: {
            ...current.result,
            beatmapsets: [...current.result.beatmapsets, ...more],
            cursor: data.cursor_string,
          },
        };
      });
    } catch {
      if (requestId.current === id) {
        setSnapshot((current) => ({ ...current, error: "Could not load more beatmaps." }));
      }
    } finally {
      if (requestId.current === id) setLoadingMore(false);
    }
  }

  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });

  useEffect(() => {
    if (!autoLoadMore || !result?.cursor || loadingMore || loading) return;

    let ticking = false;

    const checkBottom = () => {
      if (loadingMore || loading || !result?.cursor) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      // Only trigger if user has scrolled down and actually reached the bottom (within 80px)
      if (scrollTop > 100 && scrollTop + clientHeight >= scrollHeight - 80) {
        loadMoreRef.current();
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkBottom();
          ticking = false;
        });
        ticking = true;
      }
    };

    const sentinel = sentinelRef.current;
    let observer: IntersectionObserver | null = null;
    if (sentinel) {
      observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first && first.isIntersecting) {
            checkBottom();
          }
        },
        { rootMargin: "0px", threshold: 0.1 },
      );
      observer.observe(sentinel);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (observer) observer.disconnect();
    };
  }, [autoLoadMore, result?.cursor, loadingMore, loading]);

  return (
    <div className="flex flex-col">
      <section className="border-b border-line">
      <div className="column flex flex-col gap-6 px-5 py-10 md:px-10 md:py-14">
        <div className="max-w-3xl">
          <p className="label">Beatmap search</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl">
            Find a beatmap<span className="text-accent">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Stars, approach rate, mapper, length, and the rest of the osu! query, in one place.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            commit(draftRef.current);
          }}
        >
          <label className="sr-only" htmlFor="q">
            Keywords
          </label>
          <input
            id="q"
            className="field h-12 flex-1 text-base"
            placeholder="title, artist, or mapper"
            value={draft.q}
            onChange={(event) => patch({ q: event.target.value }, "soon")}
          />
          <button type="submit" className="btn-solid h-12 px-6 text-sm font-semibold">
            Search
          </button>
        </form>

        <QueryStrip filters={draft} onApply={commit} />
      </div>
      </section>

      <section className="border-b border-line">
        <div className="column px-5 py-8 md:px-10">
          <FilterPanel value={draft} onPatch={patch} onReplace={commit} />
        </div>
      </section>

      <section id="results" className="column flex flex-col gap-5 px-5 py-10 md:px-10 md:py-14" aria-live="polite">
        {setup ? <SetupNotice /> : null}

        {!setup && error ? (
          <p className="border border-line bg-accent-soft px-4 py-3 text-sm text-fg">{error}</p>
        ) : null}

        {!setup && result?.notice ? <p className="text-sm text-muted">{result.notice}</p> : null}

        {!setup && (loading || result) ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm tabular-nums text-muted">
              {loading && !result ? "Searching…" : `${(result?.total ?? 0).toLocaleString()} beatmaps`}
              {loading && result ? " · updating" : ""}
            </p>
            {result?.cursor ? (
              <AutoLoadToggle checked={autoLoadMore} onChange={setAutoLoadStorage} />
            ) : null}
          </div>
        ) : null}

        {!setup && result && result.beatmapsets.length === 0 && !loading ? (
          <p className="text-muted">No beatmaps match these filters.</p>
        ) : null}

        {!setup ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(result?.beatmapsets ?? []).map((beatmapset) => (
              <BeatmapCard
                key={beatmapset.id}
                beatmapset={beatmapset}
                mode={committed.mode}
                converts={convertMap[beatmapset.id]}
                convertsFilter={committed.converts}
                onOpenDetails={() => setDetailBeatmapset({ id: beatmapset.id, initial: beatmapset })}
              />
            ))}
            {loading && !result
              ? Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="card h-56 animate-pulse bg-subtle" />
                ))
              : null}
          </div>
        ) : null}

        {loadingMore ? (
          <div className="flex items-center justify-center gap-2 py-4 font-mono text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            <span>Loading more beatmaps…</span>
          </div>
        ) : null}

        {!setup && result?.cursor ? (
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              className="btn-ghost h-11 px-5 text-sm font-medium disabled:opacity-50"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
            <AutoLoadToggle checked={autoLoadMore} onChange={setAutoLoadStorage} />
          </div>
        ) : null}

        {/* Sentinel for infinite scroll auto-load */}
        <div ref={sentinelRef} className="h-4 w-full pointer-events-none" aria-hidden="true" />
      </section>

      {detailBeatmapset ? (
        <BeatmapDetailModal
          id={detailBeatmapset.id}
          initialBeatmapset={detailBeatmapset.initial}
          onClose={() => setDetailBeatmapset(null)}
        />
      ) : null}
    </div>
  );
}
