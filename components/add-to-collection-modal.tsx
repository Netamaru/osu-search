"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon, CloseIcon, PlusIcon, SearchIcon } from "@/components/icons";
import type { DbCollection } from "@/lib/db/queries";
import type { Beatmapset } from "@/lib/osu/types";
import { useAuth } from "./auth-provider";

export function AddToCollectionModal({
  beatmapset,
  onClose,
}: {
  beatmapset: Beatmapset;
  onClose: () => void;
}) {
  const { authenticated, openLoginModal } = useAuth();
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New collection form state
  const [newColName, setNewColName] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    if (!authenticated) {
      openLoginModal();
      onClose();
      return;
    }

    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [colRes, checkRes] = await Promise.all([
          fetch("/api/collections", { cache: "no-store" }),
          fetch(`/api/collections/check?beatmapsetId=${beatmapset.id}`, { cache: "no-store" }),
        ]);

        if (colRes.ok && checkRes.ok) {
          const colData = (await colRes.json()) as { collections: DbCollection[] };
          const checkData = (await checkRes.json()) as { collectionIds: string[] };
          if (active) {
            setCollections(colData.collections || []);
            setSelectedIds(new Set(checkData.collectionIds || []));
          }
        }
      } catch (err) {
        console.error("Failed to load collection status:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [authenticated, beatmapset.id, openLoginModal, onClose]);

  const toggleItem = async (colId: string) => {
    if (togglingId) return;
    const isCurrentlyIn = selectedIds.has(colId);
    setTogglingId(colId);
    setErrorMsg(null);

    // Optimistic toggle
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyIn) next.delete(colId);
      else next.add(colId);
      return next;
    });
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          const count = c.item_count ?? 0;
          return {
            ...c,
            item_count: isCurrentlyIn ? Math.max(0, count - 1) : count + 1,
          };
        }
        return c;
      })
    );

    try {
      if (isCurrentlyIn) {
        // Remove item
        const res = await fetch(`/api/collections/${colId}/items?beatmapsetId=${beatmapset.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Could not remove beatmap");
      } else {
        // Add item
        const res = await fetch(`/api/collections/${colId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beatmapset }),
        });
        if (!res.ok) throw new Error("Could not add beatmap");
      }
    } catch (err: unknown) {
      // Revert optimistic toggle
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyIn) next.add(colId);
        else next.delete(colId);
        return next;
      });
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id === colId) {
            const count = c.item_count ?? 0;
            return {
              ...c,
              item_count: isCurrentlyIn ? count + 1 : Math.max(0, count - 1),
            };
          }
          return c;
        })
      );
      setErrorMsg(err instanceof Error ? err.message : "Action failed");
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newColName.trim();
    if (!name || creating) return;

    setCreating(true);
    setErrorMsg(null);
    try {
      // 1. Create collection
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, is_public: false }),
      });
      if (!createRes.ok) throw new Error("Could not create collection");
      const { collection } = (await createRes.json()) as { collection: DbCollection };

      // 2. Add item to the new collection
      const addRes = await fetch(`/api/collections/${collection.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatmapset }),
      });
      if (!addRes.ok) throw new Error("Collection created, but could not add beatmap");

      setCollections((prev) => [{ ...collection, item_count: 1 }, ...prev]);
      setSelectedIds((prev) => new Set([...prev, collection.id]));
      setNewColName("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const cover = beatmapset.covers.card || beatmapset.covers["cover@2x"] || beatmapset.covers.cover;

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-[4px] border border-line bg-canvas p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-line">
          <div>
            <h2 className="display text-xl font-bold">Add to Collection</h2>
            <p className="font-mono text-xs text-muted mt-0.5">Organize and share beatmaps</p>
          </div>
          <button
            type="button"
            className="rounded-[2px] p-1.5 text-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Beatmap target summary */}
        <div className="my-4 flex items-center gap-3 rounded-[3px] border border-line bg-subtle p-2.5">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="h-12 w-16 shrink-0 rounded-[2px] object-cover border border-line"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-sm text-fg">{beatmapset.title}</h3>
            <p className="truncate text-xs text-muted">{beatmapset.artist}</p>
            <p className="font-mono text-[11px] text-faint">mapped by {beatmapset.creator}</p>
          </div>
        </div>

        {errorMsg ? (
          <p className="mb-3 rounded-[2px] border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs font-mono text-red-200">
            {errorMsg}
          </p>
        ) : null}

        {/* Collections checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-faint uppercase tracking-wider">
              Your Collections
            </p>
            {collections.length > 0 ? (
              <span className="font-mono text-[10px] text-faint">
                {collections.length} {collections.length === 1 ? "collection" : "collections"}
              </span>
            ) : null}
          </div>

          {/* Search collections input */}
          {collections.length > 0 ? (
            <div className="relative flex items-center w-full">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-faint" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field field-search w-full"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-faint hover:text-fg cursor-pointer rounded-[2px]"
                  aria-label="Clear search"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ) : null}

          {loading ? (
            <div className="py-6 text-center text-xs font-mono text-muted animate-pulse">
              Loading collections...
            </div>
          ) : collections.length === 0 ? (
            <div className="rounded-[3px] border border-dashed border-line p-4 text-center">
              <p className="text-xs text-muted">You haven&apos;t created any collections yet.</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="rounded-[3px] border border-dashed border-line p-4 text-center">
              <p className="text-xs text-muted">
                No collections matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-1.5 text-[11px] font-mono text-accent hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="custom-scrollbar max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {filteredCollections.map((col) => {
                const checked = selectedIds.has(col.id);
                const isToggling = togglingId === col.id;

                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={isToggling}
                    onClick={() => toggleItem(col.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[3px] border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      checked
                        ? "border-accent/40 bg-accent-soft/40 text-fg"
                        : "border-line bg-canvas hover:bg-subtle text-muted hover:text-fg"
                    } ${isToggling ? "opacity-60 cursor-wait" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-fg">{col.name}</p>
                      <p className="font-mono text-[10px] text-faint flex items-center gap-1.5 mt-0.5">
                        <span>{col.is_public ? "Public" : "Private"}</span>
                        <span className="opacity-40">·</span>
                        <span>
                          {col.item_count ?? 0} {col.item_count === 1 ? "map" : "maps"}
                        </span>
                      </p>
                    </div>
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors ${
                        checked
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-subtle"
                      }`}
                    >
                      {checked ? <CheckIcon className="h-3 w-3 stroke-[3]" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new collection inline */}
        <form onSubmit={handleCreateAndAdd} className="mt-4 border-t border-line pt-3">
          <p className="font-mono text-[11px] text-faint uppercase tracking-wider mb-2">
            New Collection
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Stream Practice, Loved maps..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="field text-xs py-1.5 flex-1"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!newColName.trim() || creating}
              className="btn-solid inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{creating ? "Adding..." : "Add"}</span>
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
          <Link
            href="/collections"
            onClick={onClose}
            className="font-mono text-xs text-accent hover:underline underline-offset-2"
          >
            Manage collections →
          </Link>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs font-medium cursor-pointer"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
