"use client";

import { memo, useState } from "react";
import { AddToCollectionModal } from "@/components/add-to-collection-modal";
import { DifficultyChip, DifficultyStatsBody } from "@/components/difficulty-chip";
import { useFavorites } from "@/components/favorites-provider";
import {
  BookmarkOutlineIcon,
  ClockIcon,
  DetailIcon,
  DownloadIcon,
  HeartIcon,
  HeartOutlineIcon,
  PlayIcon,
  TrashIcon,
} from "@/components/icons";
import {
  compactCount,
  formatDate,
  formatLength,
  formatLocalDateTime,
  formatStatus,
  formatUtcDateTime,
  statusIcon,
} from "@/lib/format";
import { visibleBeatmaps } from "@/lib/osu/difficulties";
import type { Beatmap, Beatmapset, SearchFilters } from "@/lib/osu/types";

export const BeatmapListItem = memo(function BeatmapListItem({
  beatmapset,
  mode,
  converts,
  convertsFilter = "any",
  onOpenDetails,
  onRemove,
  removeTitle = "Remove",
  addedAt,
  addedAtLabel,
  priority = false,
}: {
  beatmapset: Beatmapset;
  mode?: SearchFilters["mode"];
  converts?: Beatmap[];
  convertsFilter?: SearchFilters["converts"];
  onOpenDetails?: (beatmapset: Beatmapset) => void;
  onRemove?: () => void;
  removeTitle?: string;
  addedAt?: string;
  addedAtLabel?: string;
  priority?: boolean;
}) {
  const [hoveredBeatmap, setHoveredBeatmap] = useState<Beatmap | null>(null);
  const [hoveredExtraBeatmap, setHoveredExtraBeatmap] = useState<Beatmap | null>(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(beatmapset.id);

  const beatmaps = visibleBeatmaps(beatmapset, mode ?? "", converts, convertsFilter);
  const extra = Math.max(0, beatmaps.length - 8);
  const cover = beatmapset.covers.card || beatmapset.covers["cover@2x"] || beatmapset.covers.list;

  const lengths = (beatmaps.length > 0 ? beatmaps : (beatmapset.beatmaps ?? []))
    .map((b) => b.total_length)
    .filter((l): l is number => typeof l === "number" && l > 0);

  const minLength = lengths.length > 0 ? Math.min(...lengths) : undefined;
  const maxLength = lengths.length > 0 ? Math.max(...lengths) : undefined;

  const displayLength = hoveredBeatmap?.total_length
    ? formatLength(hoveredBeatmap.total_length)
    : minLength !== undefined && maxLength !== undefined && maxLength - minLength > 5
      ? `${formatLength(minLength)} - ${formatLength(maxLength)}`
      : maxLength !== undefined
        ? formatLength(maxLength)
        : undefined;

  const timestamp = addedAt || beatmapset.favorited_at || beatmapset.added_at;
  const timestampLabel = addedAtLabel || (beatmapset.favorited_at ? "Favorited" : "Added");

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(beatmapset);
  };

  const handleOpenCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollectionModalOpen(true);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenDetails) onOpenDetails(beatmapset);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <>
      <article className="card card-link group relative flex flex-col md:flex-row items-stretch md:items-center gap-3.5 p-3 transition-all hover:border-line-strong hover:bg-subtle/30 overflow-visible">
        {/* Clickable link to official osu! */}
        <a
          href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-0 cursor-pointer"
          aria-label={`${beatmapset.title} by ${beatmapset.artist} on osu!`}
        />

        {/* Thumbnail Cover & Badges */}
        <div className="relative h-28 md:h-20 w-full md:w-36 shrink-0 overflow-hidden rounded-[2px] border border-line bg-subtle pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Status Badge */}
          {beatmapset.status ? (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-[2px] border border-white/10 bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-medium text-white uppercase backdrop-blur-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={statusIcon(beatmapset.status)}
                  alt=""
                  className="h-2.5 w-auto shrink-0 object-contain brightness-110"
                />
                <span>{formatStatus(beatmapset.status)}</span>
              </span>
            </div>
          ) : null}

          {/* Duration Badge */}
          {displayLength ? (
            <div className="absolute bottom-1.5 right-1.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-[2px] border border-white/10 bg-black/75 px-1 py-0.5 font-mono text-[9px] font-medium text-white/90 backdrop-blur-xs">
                <ClockIcon className="h-2.5 w-2.5 shrink-0 fill-current text-white/70" />
                <span>{displayLength}</span>
              </span>
            </div>
          ) : null}
        </div>

        {/* Main Info */}
        <div className="flex flex-1 min-w-0 flex-col gap-1.5 pointer-events-none">
          {/* Title & Artist */}
          <div className="min-w-0">
            {(beatmapset as { is_deleted_from_osu?: boolean }).is_deleted_from_osu ? (
              <span className="mr-1.5 inline-block rounded-[2px] border border-amber-500/40 bg-amber-950/70 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-amber-200 uppercase">
                Archived Snapshot
              </span>
            ) : null}
            <div className="flex items-baseline gap-2 min-w-0 flex-wrap sm:flex-nowrap">
              <h2 className="font-semibold text-sm sm:text-base text-fg group-hover:text-accent transition-colors truncate">
                {beatmapset.title}
              </h2>
              <span className="text-xs text-muted truncate">
                {beatmapset.artist}
              </span>
            </div>
          </div>

          {/* Mapper & Stats Meta */}
          <div className="flex items-center gap-2 font-mono text-xs text-faint flex-wrap">
            <span>
              by{" "}
              <a
                href={
                  beatmapset.user_id
                    ? `https://osu.ppy.sh/users/${beatmapset.user_id}`
                    : `https://osu.ppy.sh/users/${encodeURIComponent(beatmapset.creator)}`
                }
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto relative z-10 font-medium text-muted hover:text-fg hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {beatmapset.creator}
              </a>
            </span>

            {beatmapset.bpm ? (
              <>
                <span>·</span>
                <span>{beatmapset.bpm} BPM</span>
              </>
            ) : null}

            {beatmapset.play_count !== undefined ? (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1" title={`${beatmapset.play_count.toLocaleString()} plays`}>
                  <PlayIcon className="h-2.5 w-2.5 fill-current" />
                  <span>{compactCount(beatmapset.play_count)}</span>
                </span>
              </>
            ) : null}

            {beatmapset.favourite_count !== undefined ? (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-accent/80" title={`${beatmapset.favourite_count.toLocaleString()} favourites`}>
                  <HeartIcon className="h-2.5 w-2.5 fill-current" />
                  <span>{compactCount(beatmapset.favourite_count)}</span>
                </span>
              </>
            ) : null}

            {beatmapset.last_updated ? (
              <>
                <span>·</span>
                <time dateTime={beatmapset.last_updated} title={formatUtcDateTime(beatmapset.last_updated)}>
                  {formatDate(beatmapset.last_updated)}
                </time>
              </>
            ) : null}

            {timestamp ? (
              <>
                <span>·</span>
                <span className="text-accent/90 font-medium" suppressHydrationWarning>
                  {timestampLabel} {formatLocalDateTime(timestamp)}
                </span>
              </>
            ) : null}
          </div>

          {/* Difficulty Chips */}
          <div className="relative z-10 mt-1 flex flex-wrap items-center gap-1.5">
            {beatmaps.slice(0, 8).map((beatmap, index) => (
              <DifficultyChip
                key={`${beatmap.mode}-${beatmap.id}`}
                variant="rating"
                mode={beatmap.mode}
                rating={beatmap.difficulty_rating}
                name={beatmap.convert ? `${beatmap.version} (convert)` : beatmap.version}
                loading={beatmap.convertPending}
                beatmap={beatmap}
                fallbackBpm={beatmapset.bpm}
                fallbackLength={maxLength}
                align={index >= 4 ? "right" : "left"}
                onHover={setHoveredBeatmap}
              />
            ))}

            {extra > 0 ? (
              <div className="group/more relative inline-flex">
                <button
                  type="button"
                  className="inline-flex h-[20px] box-border shrink-0 items-center justify-center rounded-[2px] border border-line bg-subtle px-1.5 font-mono text-[11px] leading-none font-medium text-faint hover:text-fg hover:border-line-strong hover:bg-canvas transition-colors cursor-pointer select-none"
                >
                  +{extra}
                </button>
                <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 flex w-72 sm:w-80 max-w-[calc(100vw-2rem)] flex-col rounded-[3px] border border-line bg-canvas p-2.5 shadow-xl group-hover/more:pointer-events-auto group-hover/more:visible group-focus-within/more:pointer-events-auto group-focus-within/more:visible">
                  <div className="flex items-center justify-between border-b border-line px-0.5 pb-1.5 font-mono text-[10px] tracking-wider text-faint uppercase">
                    <span>+{extra} more difficulties</span>
                    <span className="text-[9px] text-faint/80 lowercase">hover to view stats</span>
                  </div>

                  <div className="flex max-h-40 flex-col gap-1 overflow-y-auto py-1.5">
                    {beatmaps.slice(8).map((beatmap) => {
                      const isSelected = (hoveredExtraBeatmap ?? beatmaps[8])?.id === beatmap.id;
                      return (
                        <div
                          key={`${beatmap.mode}-${beatmap.id}`}
                          className={`flex min-w-0 items-center gap-2 rounded-[2px] px-1.5 py-1 transition-colors cursor-default ${
                            isSelected ? "bg-subtle ring-1 ring-line-strong/40" : "hover:bg-subtle/70"
                          }`}
                          onMouseEnter={() => {
                            setHoveredBeatmap(beatmap);
                            setHoveredExtraBeatmap(beatmap);
                          }}
                          onMouseLeave={() => {
                            setHoveredBeatmap(null);
                          }}
                        >
                          <DifficultyChip
                            variant="rating"
                            mode={beatmap.mode}
                            rating={beatmap.difficulty_rating}
                            name={beatmap.convert ? `${beatmap.version} (convert)` : beatmap.version}
                            loading={beatmap.convertPending}
                            tooltip={false}
                            beatmap={beatmap}
                            fallbackBpm={beatmapset.bpm}
                            fallbackLength={maxLength}
                            onHover={(b) => {
                              setHoveredBeatmap(b);
                              setHoveredExtraBeatmap(b);
                            }}
                          />
                          <span className="min-w-0 flex-1 truncate font-sans text-xs text-fg">
                            {beatmap.version}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-line pt-2 mt-1">
                    <DifficultyStatsBody
                      beatmap={hoveredExtraBeatmap ?? beatmaps[8]}
                      fallbackBpm={beatmapset.bpm}
                      fallbackLength={maxLength}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="relative z-10 flex items-center gap-1.5 shrink-0 self-end md:self-center mt-2 md:mt-0">
          {onOpenDetails ? (
            <button
              type="button"
              onClick={handleDetails}
              className="btn-solid inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <DetailIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Details</span>
            </button>
          ) : null}

          <a
            href={`osu://dl/${beatmapset.id}`}
            className="btn-direct inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            title="Download via osu!direct"
          >
            <DownloadIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Direct</span>
          </a>

          <button
            type="button"
            title={favorited ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavorite}
            className={`flex h-8 w-8 items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
              favorited
                ? "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25"
                : "border-line bg-subtle text-muted hover:text-fg hover:border-line-strong hover:bg-canvas"
            }`}
          >
            {favorited ? <HeartIcon className="h-3.5 w-3.5" /> : <HeartOutlineIcon className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            title="Add to collection"
            onClick={handleOpenCollection}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-line bg-subtle text-muted hover:text-fg hover:border-line-strong hover:bg-canvas transition-colors cursor-pointer"
          >
            <BookmarkOutlineIcon className="h-3.5 w-3.5" />
          </button>

          {onRemove ? (
            <button
              type="button"
              title={removeTitle}
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-line bg-subtle text-muted hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </article>

      {collectionModalOpen ? (
        <AddToCollectionModal
          beatmapset={beatmapset}
          onClose={() => setCollectionModalOpen(false)}
        />
      ) : null}
    </>
  );
});
