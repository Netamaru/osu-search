import { memo, useState } from "react";
import { BeatmapActions } from "@/components/beatmap-actions";
import { BeatmapCover } from "@/components/beatmap-cover";
import { DifficultyChip, DifficultyStatsBody } from "@/components/difficulty-chip";
import { formatDate, formatLength, formatLocalDateTime, formatUtcDateTime } from "@/lib/format";
import { visibleBeatmaps } from "@/lib/osu/difficulties";
import type { Beatmap, Beatmapset, SearchFilters } from "@/lib/osu/types";

export const BeatmapCard = memo(function BeatmapCard({
  beatmapset,
  mode,
  converts,
  convertsFilter = "any",
  onOpenDetails,
  addedAt,
  addedAtLabel,
  priority = false,
}: {
  beatmapset: Beatmapset;
  mode?: SearchFilters["mode"];
  converts?: Beatmap[];
  convertsFilter?: SearchFilters["converts"];
  onOpenDetails?: (beatmapset: Beatmapset) => void;
  addedAt?: string;
  addedAtLabel?: string;
  priority?: boolean;
}) {
  const [hoveredBeatmap, setHoveredBeatmap] = useState<Beatmap | null>(null);
  const [hoveredExtraBeatmap, setHoveredExtraBeatmap] = useState<Beatmap | null>(null);

  const handleOpenDetails = onOpenDetails ? () => onOpenDetails(beatmapset) : undefined;
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

  return (
    <article className="card card-link group relative flex h-full min-w-0 flex-col hover:z-20">
      <a
        href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={`${beatmapset.title} by ${beatmapset.artist} on osu!`}
      />
      <div className="pointer-events-none overflow-hidden rounded-t-[4px]">
        <BeatmapCover
          src={cover}
          id={beatmapset.id}
          title={beatmapset.title}
          artist={beatmapset.artist}
          status={beatmapset.status}
          nsfw={beatmapset.nsfw}
          plays={beatmapset.play_count}
          favourites={beatmapset.favourite_count}
          length={displayLength}
          aspect="card"
          blurMode="hover"
          priority={priority}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="pointer-events-none min-w-0">
          {(beatmapset as { is_deleted_from_osu?: boolean }).is_deleted_from_osu ? (
            <span className="inline-block mb-1.5 rounded-[2px] border border-amber-500/40 bg-amber-950/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-200 uppercase">
              Archived Snapshot (Official Deleted)
            </span>
          ) : null}
          <h2 className="text-base leading-snug font-semibold break-words [overflow-wrap:anywhere] group-hover:text-accent transition-colors">{beatmapset.title}</h2>
          <p className="mt-1 text-sm text-muted break-words [overflow-wrap:anywhere]">{beatmapset.artist}</p>
        </div>
        <p className="pointer-events-none min-w-0 font-mono text-xs text-faint break-words [overflow-wrap:anywhere]">
          <span>by </span>
          <a
            href={
              beatmapset.user_id
                ? `https://osu.ppy.sh/users/${beatmapset.user_id}`
                : `https://osu.ppy.sh/users/${encodeURIComponent(beatmapset.creator)}`
            }
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto relative z-10 font-medium text-muted hover:text-fg hover:underline underline-offset-2 transition-colors"
            title={`View ${beatmapset.creator}'s profile on osu!`}
            onClick={(event) => event.stopPropagation()}
          >
            {beatmapset.creator}
          </a>
          {beatmapset.last_updated ? (
            <span className="whitespace-nowrap">
              <span className="px-1.5">·</span>
              <span className="group/date relative pointer-events-auto inline-flex items-center cursor-help">
                <time
                  dateTime={beatmapset.last_updated}
                  title={formatUtcDateTime(beatmapset.last_updated)}
                  suppressHydrationWarning
                  className="hover:text-fg hover:underline underline-offset-2 transition-colors"
                >
                  {formatDate(beatmapset.last_updated)}
                </time>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 z-30 mb-1.5 hidden w-max rounded-[2px] border border-line bg-slab px-2 py-1 font-mono text-[11px] font-medium leading-none text-on-slab shadow-lg group-hover/date:block group-focus-within/date:block"
                >
                  {formatUtcDateTime(beatmapset.last_updated)}
                </span>
              </span>
            </span>
          ) : null}
        </p>
        {timestamp ? (
          <div className="pointer-events-none -mt-1.5 flex items-center gap-1 font-mono text-[11px] text-accent/90 font-medium" suppressHydrationWarning>
            <span>{timestampLabel}</span>
            <time dateTime={timestamp} suppressHydrationWarning>
              {formatLocalDateTime(timestamp)}
            </time>
          </div>
        ) : null}
        <div className="relative z-10 mt-auto flex min-h-[46px] flex-wrap items-center gap-1.5 content-start">
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
              align={index % 4 >= 2 ? "right" : "left"}
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
              <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 flex w-72 sm:w-80 max-w-[calc(100vw-2rem)] flex-col rounded-[3px] border border-line bg-canvas p-2.5 shadow-xl group-hover/more:pointer-events-auto group-hover/more:visible group-focus-within/more:pointer-events-auto group-focus-within/more:visible">
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
                        {beatmap.convert ? (
                          <span className="ml-auto shrink-0 font-mono text-[10px] text-faint">
                            {beatmap.convertPending ? (
                              <span className="text-accent animate-pulse">converting…</span>
                            ) : (
                              "convert"
                            )}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Difficulty stats panel for hovered difficulty */}
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
        <BeatmapActions id={beatmapset.id} size="sm" onOpenDetails={handleOpenDetails} beatmapset={beatmapset} />
      </div>
    </article>
  );
});
