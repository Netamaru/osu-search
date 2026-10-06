"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { BeatmapCard } from "@/components/beatmap-card";
import { BeatmapDetailModal } from "@/components/beatmap-detail-modal";
import { BeatmapListItem } from "@/components/beatmap-list-item";
import {
  BookmarkIcon,
  CloseIcon,
  EditIcon,
  GridIcon,
  ListIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/icons";
import type { DbCollectionWithItems } from "@/lib/db/queries";
import type { Beatmapset } from "@/lib/osu/types";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, dbConfigured, loading: authLoading } = useAuth();
  const [collection, setCollection] = useState<DbCollectionWithItems | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View mode state (card vs list)
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

  // Search & filter inside collection
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "bpm" | "title" | "artist">("default");
  const [copied, setCopied] = useState(false);

  // Edit collection modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Beatmap detail modal
  const [activeModalSet, setActiveModalSet] = useState<Beatmapset | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/collections/${id}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) throw new Error("Collection not found.");
          if (res.status === 403) throw new Error("This collection is private.");
          throw new Error("Could not load collection.");
        }
        const data = (await res.json()) as {
          collection: DbCollectionWithItems;
          is_owner: boolean;
        };
        if (active) {
          setCollection(data.collection);
          setIsOwner(data.is_owner);
          setEditName(data.collection.name);
          setEditDesc(data.collection.description);
          setEditPublic(data.collection.is_public);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load collection.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || savingEdit) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          is_public: editPublic,
        }),
      });

      if (!res.ok) throw new Error("Failed to update collection");
      const { collection: updated } = await res.json();
      setCollection((prev) => (prev ? { ...prev, ...updated } : null));
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update collection.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/collections");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete collection.");
    }
  };

  const handleRemoveItem = async (beatmapsetId: number) => {
    if (!confirm("Remove this beatmap from the collection?")) return;
    try {
      const res = await fetch(`/api/collections/${id}/items?beatmapsetId=${beatmapsetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCollection((prev) => {
          if (!prev) return null;
          const items = prev.items.filter((item) => item.beatmapset_id !== beatmapsetId);
          return { ...prev, items, item_count: items.length };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    if (!collection) return [];
    let items = [...collection.items];

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(({ beatmapset }) => {
        return (
          beatmapset.title?.toLowerCase().includes(q) ||
          beatmapset.artist?.toLowerCase().includes(q) ||
          beatmapset.creator?.toLowerCase().includes(q) ||
          beatmapset.tags?.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "bpm") {
      items.sort((a, b) => (b.beatmapset.bpm || 0) - (a.beatmapset.bpm || 0));
    } else if (sortBy === "title") {
      items.sort((a, b) => a.beatmapset.title.localeCompare(b.beatmapset.title));
    } else if (sortBy === "artist") {
      items.sort((a, b) => a.beatmapset.artist.localeCompare(b.beatmapset.artist));
    }

    return items;
  }, [collection, query, sortBy]);

  if (loading || authLoading) {
    return (
      <div className="column flex flex-1 flex-col gap-6 px-5 py-10 md:px-10">
        <div className="h-6 w-32 animate-pulse bg-subtle" />
        <div className="card h-40 animate-pulse bg-subtle" />
        {viewMode === "card" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-subtle" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-subtle" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!dbConfigured) {
    return (
      <div className="column flex flex-1 flex-col items-center justify-center px-5 py-16 text-center md:px-10">
        <div className="max-w-md rounded-[4px] border border-blue-500/30 bg-blue-500/10 p-6 font-mono text-xs text-blue-200">
          <h2 className="text-base font-bold text-blue-100 mb-2">Database Setup Required</h2>
          <p className="leading-relaxed text-blue-300">
            PostgreSQL is needed to view collections. Set <code>DATABASE_URL</code> in your <code>.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="column flex flex-1 flex-col items-center justify-center py-20 text-center px-5 md:px-10">
        <h1 className="display text-4xl font-bold">{error || "Collection not found"}</h1>
        <p className="mt-2 text-sm text-muted">The requested collection does not exist or is private.</p>
        <Link href="/collections" className="btn-solid mt-6 inline-flex px-5 py-2.5 text-xs font-semibold">
          Back to collections
        </Link>
      </div>
    );
  }

  return (
    <div className="column flex flex-1 flex-col px-5 py-8 md:px-10">
      {/* Back link */}
      <Link href="/collections" className="label hover:text-fg mb-4 inline-flex items-center gap-1">
        ← Back to collections
      </Link>

      {/* Collection Hero Header */}
      <div className="card relative overflow-hidden p-6 sm:p-8 mb-8 border border-line">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`rounded-[2px] px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                  collection.is_public
                    ? "border border-green-500/30 bg-green-950/40 text-green-300"
                    : "border border-line bg-subtle text-faint"
                }`}
              >
                {collection.is_public ? "Public Collection" : "Private Collection"}
              </span>
              <span className="rounded-[2px] border border-line bg-subtle px-2 py-0.5 font-mono text-[10px] text-faint">
                {collection.item_count} beatmaps
              </span>
            </div>

            <h1 className="display text-3xl font-extrabold sm:text-4xl text-fg break-words [overflow-wrap:anywhere]">
              {collection.name}
            </h1>

            {collection.description ? (
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                {collection.description}
              </p>
            ) : null}

            {/* Creator profile */}
            {collection.creator ? (
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-faint">Curated by</span>
                <a
                  href={`https://osu.ppy.sh/users/${collection.creator.osu_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-fg hover:text-accent transition-colors"
                >
                  {collection.creator.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collection.creator.avatar_url}
                      alt=""
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  ) : null}
                  <span>{collection.creator.username}</span>
                </a>
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="btn-direct inline-flex items-center gap-2 px-4 py-2 font-semibold text-xs cursor-pointer shadow-md"
            >
              <ShareIcon className="h-3.5 w-3.5" />
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>

            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="btn-solid inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-xs cursor-pointer"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-xs text-red-400 hover:text-red-300 hover:bg-subtle cursor-pointer"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      {collection.items.length > 0 ? (
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-line mb-6">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search in collection..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field text-xs py-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-faint">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "bpm" | "title" | "artist")}
                className="field text-xs py-1.5 w-auto"
              >
                <option value="default">Date added</option>
                <option value="bpm">Highest BPM</option>
                <option value="title">Title (A-Z)</option>
                <option value="artist">Artist (A-Z)</option>
              </select>
            </div>

            {/* View Mode Switcher: Cards vs List */}
            <div className="flex items-center rounded-[3px] border border-line bg-subtle p-0.5 shrink-0">
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
        </div>
      ) : null}

      {/* Beatmaps Grid or List */}
      {collection.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <BookmarkIcon className="h-12 w-12 text-line-strong/30 mb-3" />
          <h2 className="text-lg font-semibold text-fg">Collection is empty</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Add beatmaps to this collection by clicking the bookmark button on any beatmap card.
          </p>
          <Link href="/" className="btn-solid mt-5 inline-flex px-4 py-2 font-semibold text-xs">
            Explore beatmaps →
          </Link>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="py-16 text-center font-mono text-sm text-muted">
          No beatmaps in this collection match &quot;{query}&quot;
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedItems.map((item, idx) => (
            <div key={item.beatmapset.id} className="relative flex flex-col">
              <BeatmapCard
                beatmapset={item.beatmapset}
                mode=""
                priority={idx < 4}
                addedAt={item.added_at}
                addedAtLabel="Added"
                onOpenDetails={setActiveModalSet}
              />
              {isOwner ? (
                <button
                  type="button"
                  title="Remove from collection"
                  onClick={() => handleRemoveItem(item.beatmapset.id)}
                  className="mt-1 self-end font-mono text-[11px] text-faint hover:text-red-400 transition-colors cursor-pointer"
                >
                  Remove from collection
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredAndSortedItems.map((item, idx) => (
            <BeatmapListItem
              key={item.beatmapset.id}
              beatmapset={item.beatmapset}
              mode=""
              priority={idx < 6}
              addedAt={item.added_at}
              addedAtLabel="Added"
              onOpenDetails={setActiveModalSet}
              onRemove={isOwner ? () => handleRemoveItem(item.beatmapset.id) : undefined}
              removeTitle="Remove from collection"
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setEditOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-[4px] border border-line bg-canvas p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <h2 className="display text-xl font-bold">Edit Collection</h2>
              <button
                type="button"
                className="rounded-[2px] p-1.5 text-muted hover:text-fg"
                onClick={() => setEditOpen(false)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="label block mb-1">Collection Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="field text-sm"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="label block mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="field text-sm min-h-[70px] resize-none"
                  maxLength={400}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-col-public"
                  checked={editPublic}
                  onChange={(e) => setEditPublic(e.target.checked)}
                  className="h-4 w-4 rounded accent-accent cursor-pointer"
                />
                <label htmlFor="edit-col-public" className="text-xs text-muted cursor-pointer select-none">
                  Make collection public and shareable with link
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-xs font-medium"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim() || savingEdit}
                  className="btn-solid px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Beatmap details modal */}
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
