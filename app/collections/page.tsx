"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  BookmarkIcon,
  CloseIcon,
  EditIcon,
  GridIcon,
  ListIcon,
  OsuLogo,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/icons";
import { formatLocalDateTime } from "@/lib/format";
import type { DbCollection } from "@/lib/db/queries";

export default function CollectionsPage() {
  const { user, authenticated, loading: authLoading, openLoginModal, dbConfigured } = useAuth();
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // View mode state (card vs list)
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("osu_collections_view_mode");
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
      localStorage.setItem("osu_collections_view_mode", mode);
    } catch {
      // ignore storage error
    }
  };

  // New collection form state (default: private)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit collection modal state
  const [editingCollection, setEditingCollection] = useState<DbCollection | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated) {
      setLoading(false);
      return;
    }

    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/collections", { cache: "no-store" });
        if (res.ok && active) {
          const data = (await res.json()) as { collections: DbCollection[] };
          setCollections(data.collections || []);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [authenticated, authLoading]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, is_public: isPublic }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create collection");
      }

      const { collection } = (await res.json()) as { collection: DbCollection };
      setCollections((prev) => [collection, ...prev]);

      setName("");
      setDescription("");
      setIsPublic(false);
      setCreateModalOpen(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Error creating collection");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (col: DbCollection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCollection(col);
    setEditName(col.name);
    setEditDesc(col.description || "");
    setEditPublic(col.is_public);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editName.trim() || savingEdit) return;

    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim(),
          is_public: editPublic,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update collection");
      }

      const { collection: updated } = (await res.json()) as { collection: DbCollection };
      setCollections((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? { ...c, ...updated, item_count: c.item_count, preview_covers: c.preview_covers }
            : c
        )
      );
      setEditingCollection(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update collection");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/collections/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="column flex flex-1 flex-col px-5 py-8 md:px-10">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-48 rounded bg-subtle animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-subtle animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded bg-subtle animate-pulse" />
        </div>
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-subtle" />
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
            PostgreSQL is required to store collections and beatmap snapshots. Set <code>DATABASE_URL</code> in your <code>.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="column flex flex-1 flex-col items-center justify-center px-5 py-20 text-center md:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
          <BookmarkIcon className="h-8 w-8" />
        </div>
        <h1 className="display text-3xl font-bold text-fg sm:text-4xl">
          Beatmap Collections<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Log in with your official osu! account to manage your personal collections and organize your beatmaps.
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

  const filteredCollections = collections.filter(
    (col) =>
      col.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (col.description && col.description.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );

  return (
    <div className="column flex flex-1 flex-col px-5 py-8 md:px-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="display text-3xl font-bold text-fg sm:text-4xl">
              Collections<span className="text-accent">.</span>
            </h1>
            <span className="rounded-[2px] border border-line bg-subtle px-2 py-0.5 font-mono text-xs font-semibold text-fg tabular-nums">
              {collections.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {user ? `${user.username}’s beatmap collections` : "Your personal beatmap collections"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {collections.length > 0 ? (
            <div className="relative flex items-center w-full sm:w-56">
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

          {/* View Mode Toggle: Cards vs List */}
          {collections.length > 0 ? (
            <div className="flex items-center rounded-[3px] border border-line bg-subtle p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode("card")}
                className={`flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-xs font-medium transition-colors cursor-pointer ${viewMode === "card"
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
                className={`flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-xs font-medium transition-colors cursor-pointer ${viewMode === "list"
                    ? "bg-canvas text-fg shadow-xs font-semibold"
                    : "text-muted hover:text-fg"
                  }`}
                title="List view"
              >
                <ListIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Grid or List */}
      {loading ? (
        viewMode === "card" ? (
          <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-44 animate-pulse bg-subtle" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-20 animate-pulse bg-subtle" />
            ))}
          </div>
        )
      ) : collections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <BookmarkIcon className="h-12 w-12 text-line-strong/30 mb-3" />
          <h2 className="text-lg font-semibold text-fg">
            No collections yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Create your first collection to organize jump training, streams, or your personal favorites.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-solid mt-5 inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-xs cursor-pointer shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Collection</span>
          </button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <BookmarkIcon className="h-12 w-12 text-line-strong/30 mb-3" />
          <h2 className="text-lg font-semibold text-fg">
            No collections found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            No collections match your search &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="btn-ghost mt-4 px-3 py-1.5 text-xs font-medium cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((col) => {
            const covers = col.preview_covers || [];

            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="card card-link group relative flex flex-col overflow-hidden p-5 transition-all hover:border-line-strong"
              >
                {/* Visual cover collage preview */}
                <div className="relative mb-3 flex h-20 w-full overflow-hidden rounded-[2px] bg-subtle border border-line">
                  {covers.length > 0 ? (
                    covers.map((c, idx) => (
                      <div
                        key={idx}
                        className="relative h-full flex-1 overflow-hidden border-r border-line/30 last:border-r-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <BookmarkIcon className="h-6 w-6 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 rounded-[2px] border border-white/10 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur-xs">
                    {col.item_count ?? 0} maps
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base text-fg group-hover:text-accent transition-colors truncate">
                    {col.name}
                  </h3>
                  <span
                    className={`rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold shrink-0 ${col.is_public
                        ? "border border-green-500/30 bg-green-950/40 text-green-300"
                        : "border border-line bg-subtle text-faint"
                      }`}
                  >
                    {col.is_public ? "Public" : "Private"}
                  </span>
                </div>

                {col.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted pb-2">
                    {col.description}
                  </p>
                ) : null}

                {/* Footer metadata & actions */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-line text-xs">
                  <div className="flex flex-col min-w-0 pr-2">
                    {col.created_at ? (
                      <span className="font-mono text-[10px] text-faint truncate" suppressHydrationWarning>
                        Created {formatLocalDateTime(col.created_at)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 relative z-10">
                    <button
                      type="button"
                      title="Edit collection"
                      onClick={(e) => handleOpenEdit(col, e)}
                      className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-fg hover:border-line-strong transition-colors cursor-pointer"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Copy shareable link"
                      onClick={(e) => handleCopyLink(col.id, e)}
                      className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-fg hover:border-line-strong transition-colors cursor-pointer"
                    >
                      <ShareIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete collection"
                      onClick={(e) => handleDeleteCollection(col.id, e)}
                      className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-red-400 hover:border-line-strong transition-colors cursor-pointer"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {copiedId === col.id ? (
                  <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                    <span className="rounded-[2px] bg-accent px-2 py-1 font-mono text-[11px] text-white shadow-lg">
                      Link copied to clipboard!
                    </span>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 py-6">
          {filteredCollections.map((col) => {
            const covers = col.preview_covers || [];

            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="card card-link group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-3.5 transition-all hover:border-line-strong hover:bg-subtle/30"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Visual cover collage preview */}
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[2px] bg-subtle border border-line flex">
                    {covers.length > 0 ? (
                      covers.map((c, idx) => (
                        <div
                          key={idx}
                          className="relative h-full flex-1 overflow-hidden border-r border-line/30 last:border-r-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-faint">
                        <BookmarkIcon className="h-5 w-5 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-fg group-hover:text-accent transition-colors truncate">
                        {col.name}
                      </h3>
                      <span
                        className={`rounded-[2px] px-1.5 py-0.5 font-mono text-[9px] uppercase font-semibold shrink-0 ${col.is_public
                            ? "border border-green-500/30 bg-green-950/40 text-green-300"
                            : "border border-line bg-subtle text-faint"
                          }`}
                      >
                        {col.is_public ? "Public" : "Private"}
                      </span>
                    </div>

                    {col.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {col.description}
                      </p>
                    ) : null}

                    <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-faint flex-wrap">
                      <span>{col.item_count ?? 0} {col.item_count === 1 ? "beatmap" : "beatmaps"}</span>
                      {col.created_at ? (
                        <>
                          <span>·</span>
                          <span suppressHydrationWarning>Created {formatLocalDateTime(col.created_at)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center relative z-10">
                  <button
                    type="button"
                    title="Edit collection"
                    onClick={(e) => handleOpenEdit(col, e)}
                    className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-fg hover:border-line-strong transition-colors cursor-pointer"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Copy shareable link"
                    onClick={(e) => handleCopyLink(col.id, e)}
                    className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-fg hover:border-line-strong transition-colors cursor-pointer"
                  >
                    <ShareIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete collection"
                    onClick={(e) => handleDeleteCollection(col.id, e)}
                    className="rounded-[2px] border border-line bg-subtle p-1.5 text-muted hover:text-red-400 hover:border-line-strong transition-colors cursor-pointer"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {copiedId === col.id ? (
                  <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                    <span className="rounded-[2px] bg-accent px-2 py-1 font-mono text-[11px] text-white shadow-lg">
                      Link copied to clipboard!
                    </span>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setCreateModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-[4px] border border-line bg-canvas p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <h2 className="display text-xl font-bold">New Collection</h2>
              <button
                type="button"
                className="rounded-[2px] p-1.5 text-muted hover:text-fg cursor-pointer"
                onClick={() => setCreateModalOpen(false)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {createError ? (
              <p className="mt-3 rounded-[2px] border border-red-500/30 bg-red-950/40 p-2 text-xs font-mono text-red-200">
                {createError}
              </p>
            ) : null}

            <form onSubmit={handleCreateCollection} className="mt-4 space-y-4">
              <div>
                <label className="label block mb-1">Collection Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Speed 240BPM, Vocaloid Favs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field text-sm"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="label block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Describe your collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="field text-sm min-h-[70px] resize-none"
                  maxLength={400}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="col-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded accent-accent cursor-pointer"
                />
                <label htmlFor="col-public" className="text-xs text-muted cursor-pointer select-none">
                  Make collection public and shareable with link (default is private)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-xs font-medium cursor-pointer"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || creating}
                  className="btn-solid px-5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Creating..." : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editingCollection ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setEditingCollection(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-[4px] border border-line bg-canvas p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <h2 className="display text-xl font-bold">Edit Collection</h2>
              <button
                type="button"
                className="rounded-[2px] p-1.5 text-muted hover:text-fg cursor-pointer"
                onClick={() => setEditingCollection(null)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {editError ? (
              <p className="mt-3 rounded-[2px] border border-red-500/30 bg-red-950/40 p-2 text-xs font-mono text-red-200">
                {editError}
              </p>
            ) : null}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="label block mb-1">Collection Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Speed 240BPM, Vocaloid Favs"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="field text-sm"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="label block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Describe your collection..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="field text-sm min-h-[70px] resize-none"
                  maxLength={400}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-col-public-modal"
                  checked={editPublic}
                  onChange={(e) => setEditPublic(e.target.checked)}
                  className="h-4 w-4 rounded accent-accent cursor-pointer"
                />
                <label htmlFor="edit-col-public-modal" className="text-xs text-muted cursor-pointer select-none">
                  Make collection public and shareable with link
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-xs font-medium cursor-pointer"
                  onClick={() => setEditingCollection(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim() || savingEdit}
                  className="btn-solid px-5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
