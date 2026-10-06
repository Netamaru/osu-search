"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { BeatmapCard } from "@/components/beatmap-card";
import { BeatmapDetailModal } from "@/components/beatmap-detail-modal";
import { BeatmapListItem } from "@/components/beatmap-list-item";
import { GridIcon, HeartIcon, ListIcon, OsuLogo } from "@/components/icons";
import type { Beatmapset } from "@/lib/osu/types";

export default function FavoritesPage() {
  const { user, authenticated, loading: authLoading, openLoginModal, dbConfigured } = useAuth();
  const [favorites, setFavorites] = useState<Beatmapset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeModalSet, setActiveModalSet] = useState<Beatmapset | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("osu_view_mode");
        if (saved === "card" || saved === "list") return saved;
      } catch {
        // ignore storage error
      }
    }
    return "card";
  });

  const handleSetViewMode = (mode: "card" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("osu_view_mode", mode);
    } catch {
      // ignore storage error
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadFavorites() {
      setLoading(true);
      try {
        const res = await fetch("/api/favorites", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { favorites?: Beatmapset[] };
          if (active && Array.isArray(data.favorites)) {
            setFavorites(data.favorites);
          }
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      active = false;
    };
  }, [authenticated, authLoading]);

  const filteredFavorites = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((item) => {
      return (
        item.title?.toLowerCase().includes(q) ||
        item.artist?.toLowerCase().includes(q) ||
        item.creator?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q) ||
        item.tags?.toLowerCase().includes(q)
      );
    });
  }, [favorites, searchFilter]);

  if (authLoading) {
    return (
      <div className="column flex flex-1 flex-col px-5 py-8 md:px-10">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-40 rounded bg-subtle animate-pulse" />
            <div className="mt-2 h-4 w-52 rounded bg-subtle animate-pulse" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-subtle" />
          ))}
        </div>
      </div>
    );
  }

  if (!dbConfigured) {
    return (
      <div className="column flex flex-1 flex-col items-center justify-center px-5 py-16 text-center md:px-10">
        <div className="max-w-md rounded-[4px] border border-blue-500/30 bg-blue-500/10 p-6 font-mono text-xs text-blue-200">
          <h2 className="text-base font-bold text-blue-100 mb-2">Database Setup Required</h2>
          <p className="leading-relaxed text-blue-300">
            PostgreSQL is needed to save your favorite beatmaps and collections. Add <code>DATABASE_URL</code> in your <code>.env.local</code> to activate database features.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="column flex flex-1 flex-col items-center justify-center px-5 py-20 text-center md:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
          <HeartIcon className="h-8 w-8" />
        </div>
        <h1 className="display text-3xl font-bold text-fg sm:text-4xl">
          Favorite Beatmaps<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Log in with your official osu! account to sync and preserve your favorite beatmaps across devices.
        </p>
        <button
          type="button"
          onClick={openLoginModal}
          className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 font-mono text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <OsuLogo className="h-4 w-4 shrink-0" />
          <span>Log in with osu!</span>
        </button>
      </div>
    );
  }

  return (
    <div className="column flex flex-1 flex-col px-5 py-8 md:px-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="display text-3xl font-bold text-fg sm:text-4xl">
              Favorites<span className="text-accent">.</span>
            </h1>
            <span className="rounded-[2px] border border-line bg-subtle px-2 py-0.5 font-mono text-xs font-semibold text-fg tabular-nums">
              {favorites.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {user ? `${user.username}’s saved beatmapsets` : "Your saved beatmapsets"}
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search in favorites..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="field text-xs py-2"
              />
            </div>

            {/* View Mode Toggle: Cards vs List */}
            <div className="flex items-center rounded-[3px] border border-line bg-subtle p-0.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleSetViewMode("card")}
                className={`flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "card"
                    ? "bg-canvas text-fg shadow-xs font-semibold"
                    : "text-muted hover:text-fg"
                }`}
                title="Card grid view"
              >
                <GridIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode("list")}
                className={`flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-canvas text-fg shadow-xs font-semibold"
                    : "text-muted hover:text-fg"
                }`}
                title="List view"
              >
                <ListIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Content */}
      {loading ? (
        viewMode === "card" ? (
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-subtle" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-subtle" />
            ))}
          </div>
        )
      ) : favorites.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <HeartIcon className="h-12 w-12 text-line-strong/30 mb-3" />
          <h2 className="text-lg font-semibold text-fg">No favorite beatmaps yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Click the heart icon on any beatmap card or detail view to save it here.
          </p>
          <Link
            href="/"
            className="btn-solid mt-5 inline-flex items-center px-4 py-2 font-semibold text-xs"
          >
            Browse beatmaps →
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-mono text-sm text-muted">
            No favorites match &quot;{searchFilter}&quot;
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFavorites.map((beatmapset, idx) => (
            <BeatmapCard
              key={beatmapset.id}
              beatmapset={beatmapset}
              mode=""
              priority={idx < 4}
              addedAt={beatmapset.favorited_at}
              addedAtLabel="Favorited"
              onOpenDetails={setActiveModalSet}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 py-6">
          {filteredFavorites.map((beatmapset, idx) => (
            <BeatmapListItem
              key={beatmapset.id}
              beatmapset={beatmapset}
              mode=""
              priority={idx < 6}
              addedAt={beatmapset.favorited_at}
              addedAtLabel="Favorited"
              onOpenDetails={setActiveModalSet}
            />
          ))}
        </div>
      )}

      {activeModalSet ? (
        <BeatmapDetailModal
          id={activeModalSet.id}
          initialBeatmapset={activeModalSet}
          onClose={() => setActiveModalSet(null)}
        />
      ) : null}
    </div>
  );
}
