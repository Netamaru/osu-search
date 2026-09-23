import Link from "next/link";
import { BeatmapActions } from "@/components/beatmap-actions";
import { DifficultyChip } from "@/components/difficulty-chip";
import { compactCount, formatStatus } from "@/lib/format";
import { needsConvertRatings, visibleBeatmaps } from "@/lib/osu/difficulties";
import { markScrollRestore } from "@/lib/search-return";
import type { Beatmap, Beatmapset, SearchFilters } from "@/lib/osu/types";

export function BeatmapCard({
  beatmapset,
  mode,
  converts,
}: {
  beatmapset: Beatmapset;
  mode: SearchFilters["mode"];
  converts?: Beatmap[];
}) {
  const beatmaps = visibleBeatmaps(beatmapset, mode, converts);
  const waiting = needsConvertRatings(beatmapset, mode) && converts === undefined;
  const extra = Math.max(0, beatmaps.length - 8);
  const cover = beatmapset.covers.card || beatmapset.covers["cover@2x"] || beatmapset.covers.list;

  return (
    <article className="card card-link group relative flex h-full flex-col">
      <Link
        href={`/beatmapsets/${beatmapset.id}`}
        className="absolute inset-0 z-0"
        aria-label={`${beatmapset.title} by ${beatmapset.artist}`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          markScrollRestore();
        }}
      />
      <div className="relative aspect-[16/7] overflow-hidden rounded-t-[4px] bg-subtle">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className={`h-full w-full object-cover transition ${beatmapset.nsfw ? "blur-xl group-hover:blur-none group-focus-visible:blur-none" : ""}`}
          />
        ) : null}
        {beatmapset.nsfw ? (
          <span className="absolute top-2 left-2 bg-slab px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-on-slab uppercase">
            Explicit
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="text-base leading-snug font-semibold">{beatmapset.title}</h2>
          <p className="mt-1 text-sm text-muted">{beatmapset.artist}</p>
        </div>
        <p className="font-mono text-xs text-faint">
          {beatmapset.creator}
          <span className="px-1.5">·</span>
          {formatStatus(beatmapset.status)}
          <span className="px-1.5">·</span>
          {compactCount(beatmapset.play_count)} plays
          <span className="px-1.5">·</span>
          {compactCount(beatmapset.favourite_count)} fav
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {waiting ? <span className="font-mono text-[11px] text-faint">stars…</span> : null}
          {beatmaps.slice(0, 8).map((beatmap) => (
            <DifficultyChip
              key={`${beatmap.mode}-${beatmap.id}`}
              variant="rating"
              mode={beatmap.mode}
              rating={beatmap.difficulty_rating}
              name={beatmap.version}
            />
          ))}
          {extra > 0 ? <span className="font-mono text-[11px] text-faint">+{extra}</span> : null}
        </div>
        <BeatmapActions id={beatmapset.id} size="sm" />
      </div>
    </article>
  );
}
