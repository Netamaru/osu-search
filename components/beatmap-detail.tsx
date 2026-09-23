import { BeatmapActions } from "@/components/beatmap-actions";
import { DifficultyChip } from "@/components/difficulty-chip";
import { SearchBackLink } from "@/components/search-back-link";
import { MODE_LABEL } from "@/lib/osu/constants";
import { absoluteUrl, compactCount, formatLength, formatStatus } from "@/lib/format";
import type { Beatmap, Beatmapset, Ruleset } from "@/lib/osu/types";

const RULESETS: Ruleset[] = ["osu", "taiko", "fruits", "mania"];

function grouped(beatmaps: Beatmap[]) {
  return RULESETS.map((mode) => ({
    mode,
    beatmaps: beatmaps
      .filter((beatmap) => beatmap.mode === mode && !beatmap.deleted_at)
      .sort((a, b) => Number(a.convert) - Number(b.convert) || a.difficulty_rating - b.difficulty_rating),
  })).filter((group) => group.beatmaps.length > 0);
}

export function BeatmapDetail({ beatmapset }: { beatmapset: Beatmapset }) {
  const cover = beatmapset.covers["cover@2x"] || beatmapset.covers.cover;
  const groups = grouped([...(beatmapset.beatmaps ?? []), ...(beatmapset.converts ?? [])]);

  return (
    <article>
      <section className="border-b border-line">
      <div className="column px-5 py-10 md:px-10 md:py-14">
      <SearchBackLink className="label hover:text-fg">← Search</SearchBackLink>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="card h-fit self-start overflow-hidden">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className={`block h-auto w-full ${beatmapset.nsfw ? "blur-2xl" : ""}`}
            />
          ) : (
            <div className="aspect-[2.2/1] bg-subtle" />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <p className="label">{formatStatus(beatmapset.status)}</p>
          <h1 className="display text-4xl sm:text-5xl">{beatmapset.title}</h1>
          <p className="text-lg text-muted">{beatmapset.artist}</p>
          <p className="font-mono text-sm text-faint">
            mapped by {beatmapset.creator}
            <span className="px-1.5">·</span>
            {compactCount(beatmapset.play_count)} plays
            <span className="px-1.5">·</span>
            {compactCount(beatmapset.favourite_count)} fav
            {beatmapset.bpm ? (
              <>
                <span className="px-1.5">·</span>
                {Math.round(beatmapset.bpm)} BPM
              </>
            ) : null}
          </p>
          {beatmapset.nsfw ? <p className="label text-accent">Explicit</p> : null}
          <audio className="w-full" controls preload="none" src={absoluteUrl(beatmapset.preview_url)}>
            Preview
          </audio>
          <BeatmapActions id={beatmapset.id} />
        </div>
      </div>
      </div>
      </section>

      <div>
        {groups.map((group) => (
          <section key={group.mode} className="border-b border-line last:border-b-0">
          <div className="column flex flex-col gap-3 px-5 py-8 md:px-10">
            <h2 className="label">{MODE_LABEL[group.mode]}</h2>
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                <thead className="bg-subtle font-mono text-[11px] tracking-wide text-faint uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Difficulty</th>
                    <th className="px-3 py-2 font-medium">Stars</th>
                    <th className="px-3 py-2 font-medium">AR</th>
                    <th className="px-3 py-2 font-medium">CS</th>
                    <th className="px-3 py-2 font-medium">OD</th>
                    <th className="px-3 py-2 font-medium">HP</th>
                    <th className="px-3 py-2 font-medium">BPM</th>
                    <th className="px-3 py-2 font-medium">Length</th>
                    <th className="px-3 py-2 font-medium">Combo</th>
                  </tr>
                </thead>
                <tbody>
                  {group.beatmaps.map((beatmap) => (
                    <tr key={`${beatmap.mode}-${beatmap.id}`} className="border-t border-line">
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <DifficultyChip rating={beatmap.difficulty_rating} name={beatmap.version} mode={beatmap.mode} />
                          {beatmap.convert ? <span className="label">convert</span> : null}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.difficulty_rating.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.ar.toFixed(1)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.cs.toFixed(1)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.accuracy.toFixed(1)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.drain.toFixed(1)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.bpm ? Math.round(beatmap.bpm) : "—"}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatLength(beatmap.total_length)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{beatmap.max_combo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </section>
        ))}
      </div>
    </article>
  );
}
