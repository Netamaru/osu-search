"use client";

import { useState } from "react";
import { AddToCollectionModal } from "@/components/add-to-collection-modal";
import { useFavorites } from "@/components/favorites-provider";
import {
  BookmarkOutlineIcon,
  DetailIcon,
  DownloadIcon,
  ExternalIcon as OpenIcon,
  HeartIcon,
  HeartOutlineIcon,
} from "@/components/icons";
import type { Beatmapset } from "@/lib/osu/types";

export function BeatmapActions({
  id,
  size = "md",
  onOpenDetails,
  beatmapset,
}: {
  id: number;
  size?: "sm" | "md";
  onOpenDetails?: () => void;
  beatmapset?: Beatmapset;
}) {
  const compact = size === "sm";
  const box = compact
    ? "min-h-8 gap-1.5 px-2 py-1 text-center text-xs leading-tight"
    : "min-h-11 gap-2 px-3 py-2 text-center text-sm leading-snug";
  const icon = compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0";
  const btnIconSize = compact ? "h-8 w-8" : "h-11 w-11";

  const { isFavorite, toggleFavorite } = useFavorites();
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const favorited = isFavorite(id);

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (beatmapset) {
      toggleFavorite(beatmapset);
    }
  };

  const handleOpenCollection = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (beatmapset) {
      setCollectionModalOpen(true);
    }
  };

  return (
    <>
      <div className="relative z-10 flex items-center gap-1.5">
        <div className="grid grid-cols-2 gap-1.5 flex-1 min-w-0">
          {onOpenDetails ? (
            <button
              type="button"
              className={`btn-solid inline-flex w-full items-center justify-center font-semibold truncate ${box}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onOpenDetails();
              }}
            >
              <DetailIcon className={icon} />
              <span>Details</span>
            </button>
          ) : (
            <a
              className={`btn-solid inline-flex w-full items-center justify-center font-semibold truncate ${box}`}
              href={`https://osu.ppy.sh/beatmapsets/${id}`}
              target="_blank"
              rel="noreferrer"
            >
              <OpenIcon className={icon} />
              <span>Open on osu!</span>
            </a>
          )}
          <a
            className={`btn-direct inline-flex w-full items-center justify-center font-semibold truncate ${box}`}
            href={`osu://dl/${id}`}
          >
            <DownloadIcon className={icon} />
            <span>osu!direct</span>
          </a>
        </div>

        {beatmapset ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              title={favorited ? "Remove from favorites" : "Add to favorites"}
              onClick={handleFavorite}
              className={`flex ${btnIconSize} items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
                favorited
                  ? "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25"
                  : "border-line bg-subtle text-muted hover:text-fg hover:border-line-strong hover:bg-canvas"
              }`}
            >
              {favorited ? <HeartIcon className={icon} /> : <HeartOutlineIcon className={icon} />}
            </button>
            <button
              type="button"
              title="Add to collection"
              onClick={handleOpenCollection}
              className={`flex ${btnIconSize} items-center justify-center rounded-[2px] border border-line bg-subtle text-muted hover:text-fg hover:border-line-strong hover:bg-canvas transition-colors cursor-pointer`}
            >
              <BookmarkOutlineIcon className={icon} />
            </button>
          </div>
        ) : null}
      </div>

      {collectionModalOpen && beatmapset ? (
        <AddToCollectionModal
          beatmapset={beatmapset}
          onClose={() => setCollectionModalOpen(false)}
        />
      ) : null}
    </>
  );
}
