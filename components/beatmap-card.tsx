import { useState } from "react";
import { BeatmapActions } from "@/components/beatmap-actions";
import { BeatmapCover } from "@/components/beatmap-cover";
import { BeatmapDetailModal } from "@/components/beatmap-detail-modal";
import { DifficultyChip } from "@/components/difficulty-chip";
import { compactCount, formatStatus } from "@/lib/format";
import { visibleBeatmaps } from "@/lib/osu/difficulties";
import type { Beatmap, Beatmapset, SearchFilters } from "@/lib/osu/types";

export function BeatmapCard({
  beatmapset,
  mode,
  converts,
  convertsFilter = "any",
  onOpenDetails,
}: {
  beatmapset: Beatmapset;
  mode: SearchFilters["mode"];
  converts?: Beatmap[];
  convertsFilter?: SearchFilters["converts"];
  onOpenDetails?: () => void;
}) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const handleOpenDetails = onOpenDetails ?? (() => setInternalModalOpen(true));

  const beatmaps = visibleBeatmaps(beatmapset, mode, converts, convertsFilter);
  const extra = Math.max(0, beatmaps.length - 8);
  const cover = beatmapset.covers.card || beatmapset.covers["cover@2x"] || beatmapset.covers.list;

  return (
    <article className="card card-link group relative flex h-full flex-col hover:z-20">
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
          nsfw={beatmapset.nsfw}
          aspect="card"
          blurMode="hover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="pointer-events-none">
          <h2 className="text-base leading-snug font-semibold">{beatmapset.title}</h2>
          <p className="mt-1 text-sm text-muted">{beatmapset.artist}</p>
        </div>
        <p className="pointer-events-none font-mono text-xs text-faint">
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
          <span className="px-1.5">·</span>
          {formatStatus(beatmapset.status)}
          <span className="px-1.5">·</span>
          {compactCount(beatmapset.play_count)} plays
          <span className="px-1.5">·</span>
          {compactCount(beatmapset.favourite_count)} fav
        </p>
        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-1.5">
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
      {internalModalOpen ? (
        <BeatmapDetailModal
          id={beatmapset.id}
          initialBeatmapset={beatmapset}
          onClose={() => setInternalModalOpen(false)}
        />
      ) : null}
    </article>
  );
}
