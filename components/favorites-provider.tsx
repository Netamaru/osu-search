"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Beatmapset } from "@/lib/osu/types";
import { useAuth } from "./auth-provider";

type FavoritesContextValue = {
  favoriteIds: Set<number>;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (beatmapset: Beatmapset) => Promise<boolean>;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { authenticated, openLoginModal } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavoriteIds = useCallback(async () => {
    if (!authenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/favorites/ids", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { ids?: number[] };
        if (Array.isArray(data.ids)) {
          setFavoriteIds(new Set(data.ids));
        }
      }
    } catch (err) {
      console.error("Failed to load favorite IDs:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const isFavorite = useCallback(
    (id: number) => {
      return favoriteIds.has(id);
    },
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (beatmapset: Beatmapset): Promise<boolean> => {
      if (!authenticated) {
        openLoginModal();
        return false;
      }

      const id = beatmapset.id;
      const willBeFavorited = !favoriteIds.has(id);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (willBeFavorited) next.add(id);
        else next.delete(id);
        return next;
      });

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beatmapset }),
        });

        if (!res.ok) {
          // Revert optimistic update
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (willBeFavorited) next.delete(id);
            else next.add(id);
            return next;
          });
          return !willBeFavorited;
        }

        const data = (await res.json()) as { favorited?: boolean };
        return Boolean(data.favorited);
      } catch (err) {
        console.error("Failed to toggle favorite:", err);
        // Revert optimistic update
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (willBeFavorited) next.delete(id);
          else next.add(id);
          return next;
        });
        return !willBeFavorited;
      }
    },
    [authenticated, favoriteIds, openLoginModal],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      loading,
      refreshFavorites: fetchFavoriteIds,
    }),
    [favoriteIds, isFavorite, toggleFavorite, loading, fetchFavoriteIds],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
