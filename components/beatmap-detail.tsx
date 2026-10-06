import { BeatmapActions } from "@/components/beatmap-actions";
import { BeatmapCover } from "@/components/beatmap-cover";
import { DifficultyChip } from "@/components/difficulty-chip";
import { ModeIcon } from "@/components/mode-icon";
import { MusicPlayer } from "@/components/music-player";
import { SearchBackLink } from "@/components/search-back-link";
import { CalendarIcon, ClockIcon, ComboIcon, HeartIcon, NoteIcon, PlayIcon, StarIcon, UserIcon } from "@/components/icons";
import { MODE_LABEL } from "@/lib/osu/constants";
import { absoluteUrl, compactCount, difficultyColor, difficultyTextColor, formatDate, formatLength, formatStatus, formatUtcDateTime, statusIcon } from "@/lib/format";
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
              <BeatmapCover
                src={cover}
                id={beatmapset.id}
                title={beatmapset.title}
                artist={beatmapset.artist}
                nsfw={beatmapset.nsfw}
                aspect="detail"
                blurMode="always"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-0.5 font-mono text-xs font-semibold text-fg tracking-wide uppercase shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={statusIcon(beatmapset.status)}
                    alt=""
                    className="h-3.5 w-auto shrink-0 object-contain"
                  />
                  <span>{formatStatus(beatmapset.status)}</span>
                </span>
                {beatmapset.nsfw ? (
                  <span className="rounded-[2px] border border-red-500/30 bg-red-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-red-200 uppercase shadow-xs">
                    Explicit
                  </span>
                ) : null}
                {(beatmapset as { is_deleted_from_osu?: boolean }).is_deleted_from_osu ? (
                  <span className="rounded-[2px] border border-amber-500/40 bg-amber-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-amber-200 uppercase shadow-xs">
                    Archived Snapshot (Official Deleted)
                  </span>
                ) : null}
              </div>

              <div>
                <h1 className="display text-4xl sm:text-5xl break-words [overflow-wrap:anywhere]">{beatmapset.title}</h1>
                <p className="mt-1 text-lg text-muted break-words [overflow-wrap:anywhere]">{beatmapset.artist}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint">
                  <UserIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                  <span>mapped by</span>
                  <a
                    href={
                      beatmapset.user_id
                        ? `https://osu.ppy.sh/users/${beatmapset.user_id}`
                        : `https://osu.ppy.sh/users/${encodeURIComponent(beatmapset.creator)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-fg hover:text-accent hover:underline underline-offset-2 transition-colors"
                    title={`View ${beatmapset.creator}'s profile on osu!`}
                  >
                    {beatmapset.creator}
                  </a>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint" title={`${beatmapset.play_count.toLocaleString()} plays`}>
                  <PlayIcon className="h-3 w-3 shrink-0 text-faint" />
                  <span className="font-semibold text-fg tabular-nums">{compactCount(beatmapset.play_count)}</span>
                  <span>plays</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint" title={`${beatmapset.favourite_count.toLocaleString()} favourites`}>
                  <HeartIcon className="h-3 w-3 shrink-0 text-accent" />
                  <span className="font-semibold text-fg tabular-nums">{compactCount(beatmapset.favourite_count)}</span>
                  <span>fav</span>
                </span>

                {beatmapset.bpm ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint">
                    <NoteIcon className="h-3 w-3 shrink-0 text-faint" />
                    <span className="font-semibold text-fg tabular-nums">{Math.round(beatmapset.bpm)}</span>
                    <span>BPM</span>
                  </span>
                ) : null}

                {beatmapset.last_updated ? (
                  <span className="group/date relative inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint cursor-help">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                    <time
                      dateTime={beatmapset.last_updated}
                      title={formatUtcDateTime(beatmapset.last_updated)}
                      suppressHydrationWarning
                      className="font-medium text-fg hover:underline underline-offset-2 transition-colors"
                    >
                      updated {formatDate(beatmapset.last_updated)}
                    </time>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 z-30 mb-1.5 hidden w-max rounded-[2px] border border-line bg-slab px-2 py-1 font-mono text-[11px] font-medium leading-none text-on-slab shadow-lg group-hover/date:block group-focus-within/date:block"
                    >
                      {formatUtcDateTime(beatmapset.last_updated)}
                    </span>
                  </span>
                ) : null}
              </div>

              {beatmapset.preview_url ? (
                <MusicPlayer
                  src={absoluteUrl(beatmapset.preview_url)}
                />
              ) : null}
              <BeatmapActions id={beatmapset.id} beatmapset={beatmapset} />
            </div>
          </div>
        </div>
      </section>

      <div>
        {groups.map((group) => (
          <section key={group.mode} className="border-b border-line last:border-b-0">
            <div className="column flex flex-col gap-3 px-5 py-8 md:px-10">
              <h2 className="label inline-flex items-center gap-1.5">
                <ModeIcon mode={group.mode} className="h-3.5 w-3.5" />
                <span>{MODE_LABEL[group.mode]}</span>
              </h2>
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                  <thead className="bg-subtle font-mono text-[11px] tracking-wide text-faint uppercase">
                    <tr>
                      <th className="px-3 py-2 font-medium">Difficulty</th>
                      <th className="px-3 py-2 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <StarIcon className="h-3 w-3 text-accent" />
                          <span>Stars</span>
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">AR</th>
                      <th className="px-3 py-2 font-medium">CS</th>
                      <th className="px-3 py-2 font-medium">OD</th>
                      <th className="px-3 py-2 font-medium">HP</th>
                      <th className="px-3 py-2 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <NoteIcon className="h-3 w-3 text-faint" />
                          <span>BPM</span>
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3 w-3 text-faint" />
                          <span>Length</span>
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <ComboIcon className="h-3 w-3 text-faint" />
                          <span>Combo</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.beatmaps.map((beatmap) => (
                      <tr key={`${beatmap.mode}-${beatmap.id}`} className="border-t border-line hover:bg-subtle/50 transition-colors">
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-2">
                            <DifficultyChip
                              rating={beatmap.difficulty_rating}
                              name={beatmap.version}
                              mode={beatmap.mode}
                              tooltip={false}
                            />
                            {beatmap.convert ? (
                              <span className="rounded-[2px] border border-line bg-subtle px-1 py-0.5 font-mono text-[10px] text-faint uppercase">
                                convert
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums">
                          <span
                            className="inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-xs font-semibold leading-none shadow-xs"
                            style={{
                              background: difficultyColor(beatmap.difficulty_rating),
                              color: difficultyTextColor(),
                            }}
                          >
                            <StarIcon className="h-3 w-3 fill-current" />
                            <span>{beatmap.difficulty_rating.toFixed(2)}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.ar.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.cs.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.accuracy.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.drain.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.bpm ? Math.round(beatmap.bpm) : "—"}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{formatLength(beatmap.total_length)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{beatmap.max_combo ? `${beatmap.max_combo.toLocaleString()}x` : "—"}</td>
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
