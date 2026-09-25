import { memo } from "react";
import { BeatmapActions } from "@/components/beatmap-actions";
import { BeatmapCover } from "@/components/beatmap-cover";
import { DifficultyChip } from "@/components/difficulty-chip";
import { formatShortDate, formatUtcDateTime } from "@/lib/format";
import { visibleBeatmaps } from "@/lib/osu/difficulties";
import type { Beatmap, Beatmapset, SearchFilters } from "@/lib/osu/types";

export const BeatmapCard = memo(function BeatmapCard({
  beatmapset,
  mode,
  converts,
  convertsFilter = "any",
  onOpenDetails,
  priority = false,
}: {
  beatmapset: Beatmapset;
  mode: SearchFilters["mode"];
  converts?: Beatmap[];
  convertsFilter?: SearchFilters["converts"];
  onOpenDetails?: (beatmapset: Beatmapset) => void;
  priority?: boolean;
}) {
  const handleOpenDetails = onOpenDetails ? () => onOpenDetails(beatmapset) : undefined;
  const beatmaps = visibleBeatmaps(beatmapset, mode, converts, convertsFilter);
  const extra = Math.max(0, beatmaps.length - 8);
  const cover = beatmapset.covers.card || beatmapset.covers["cover@2x"] || beatmapset.covers.list;

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
          aspect="card"
          blurMode="hover"
          priority={priority}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="pointer-events-none min-w-0">
          <h2 className="text-base leading-snug font-semibold break-words [overflow-wrap:anywhere]">{beatmapset.title}</h2>
          <p className="mt-1 text-sm text-muted break-words [overflow-wrap:anywhere]">{beatmapset.artist}</p>
        </div>
        <p className="pointer-events-none min-w-0 font-mono text-xs text-faint break-words [overflow-wrap:anywhere]">
          <a
            href={
              beatmapset.user_id
                ? `https://osu.ppy.sh/users/${beatmapset.user_id}`
                : `https://osu.ppy.sh/users/${encodeURIComponent(beatmapset.creator)}`
            }
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto relative z-10 text-faint hover:text-fg hover:underline underline-offset-2 transition-colors"
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
                  updated {formatShortDate(beatmapset.last_updated)}
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
        <div className="relative z-10 mt-auto flex min-h-[46px] flex-wrap items-center gap-1.5 content-start">
          {beatmaps.slice(0, 8).map((beatmap) => (
            <DifficultyChip
              key={`${beatmap.mode}-${beatmap.id}`}
              variant="rating"
              mode={beatmap.mode}
              rating={beatmap.difficulty_rating}
              name={beatmap.convert ? `${beatmap.version} (convert)` : beatmap.version}
              loading={beatmap.convertPending}
            />
          ))}
          {extra > 0 ? (
            <span className="group/more relative">
              <button
                type="button"
                className="font-mono text-[11px] text-faint underline decoration-dotted underline-offset-2 hover:text-fg"
              >
                +{extra}
              </button>
              <span className="pointer-events-none invisible absolute bottom-full left-0 z-30 flex max-h-56 w-72 sm:w-80 max-w-[calc(100vw-2rem)] flex-col gap-1 overflow-y-auto rounded-[3px] border border-line bg-canvas p-2 shadow-lg group-hover/more:pointer-events-auto group-hover/more:visible group-focus-within/more:pointer-events-auto group-focus-within/more:visible">
                <span className="border-b border-line px-1 pb-1 font-mono text-[10px] tracking-wider text-faint uppercase">
                  +{extra} more difficulties
                </span>
                {beatmaps.slice(8).map((beatmap) => (
                  <span
                    key={`${beatmap.mode}-${beatmap.id}`}
                    className="flex min-w-0 items-center gap-2 rounded-[2px] px-1.5 py-0.5 transition-colors hover:bg-subtle"
                    title={beatmap.convert ? `${beatmap.version} (convert)` : beatmap.version}
                  >
                    <DifficultyChip
                      variant="rating"
                      mode={beatmap.mode}
                      rating={beatmap.difficulty_rating}
                      name={beatmap.convert ? `${beatmap.version} (convert)` : beatmap.version}
                      loading={beatmap.convertPending}
                      tooltip={false}
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
                  </span>
                ))}
              </span>
            </span>
          ) : null}
        </div>
        <BeatmapActions id={beatmapset.id} size="sm" onOpenDetails={handleOpenDetails} />
      </div>
    </article>
  );
});
