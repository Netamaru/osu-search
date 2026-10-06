"use client";

import { useEffect, useId, useState } from "react";
import { BeatmapActions } from "@/components/beatmap-actions";
import { BeatmapCover } from "@/components/beatmap-cover";
import { DifficultyChip } from "@/components/difficulty-chip";
import { useCredentials } from "@/components/credentials-provider";
import { ModeIcon } from "@/components/mode-icon";
import { MusicPlayer } from "@/components/music-player";
import { SetupNotice } from "@/components/setup-notice";
import { CalendarIcon, ClockIcon, CloseIcon, ComboIcon, ExternalIcon, HeartIcon, NoteIcon, PlayIcon, StarIcon, UserIcon } from "@/components/icons";
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

type ModalState =
  | { status: "loading"; beatmapset: Beatmapset | null }
  | { status: "setup"; beatmapset: Beatmapset | null }
  | { status: "missing"; beatmapset: null }
  | { status: "error"; message: string; beatmapset: Beatmapset | null }
  | { status: "ok"; beatmapset: Beatmapset; fullyLoaded: boolean };

const DETAIL_CACHE_MAX = 50;
const detailMemoryCache = new Map<number, Beatmapset>();

export function BeatmapDetailModal({
  id,
  initialBeatmapset,
  onClose,
}: {
  id: number;
  initialBeatmapset?: Beatmapset;
  onClose: () => void;
}) {
  const titleId = useId();
  const { ready, headers, openModal } = useCredentials();
  const [state, setState] = useState<ModalState>(() => {
    const cached = detailMemoryCache.get(id);
    if (cached) return { status: "ok", beatmapset: cached, fullyLoaded: true };
    if (initialBeatmapset) return { status: "ok", beatmapset: initialBeatmapset, fullyLoaded: false };
    return { status: "loading", beatmapset: null };
  });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    fetch(`/api/beatmapsets/${id}`, { signal: controller.signal, headers })
      .then(async (response) => {
        const data = (await response.json()) as Beatmapset & { error?: string; message?: string };
        if (controller.signal.aborted) return;
        if (data.error === "missing_credentials") {
          setState((prev) => ({ status: "setup", beatmapset: prev.beatmapset }));
          openModal();
          return;
        }
        if (response.status === 404) {
          setState({ status: "missing", beatmapset: null });
          return;
        }
        if (!response.ok) {
          setState((prev) => ({
            status: "error",
            message: data.message || "Could not load this beatmap.",
            beatmapset: prev.beatmapset,
          }));
          return;
        }

        if (detailMemoryCache.size >= DETAIL_CACHE_MAX) {
          const oldest = detailMemoryCache.keys().next().value;
          if (oldest !== undefined) detailMemoryCache.delete(oldest);
        }
        detailMemoryCache.set(id, data);
        setState({ status: "ok", beatmapset: data, fullyLoaded: true });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState((prev) => ({
          status: "error",
          message: "Could not load this beatmap.",
          beatmapset: prev.beatmapset,
        }));
      });

    return () => controller.abort();
  }, [id, ready, headers, openModal]);

  const activeBeatmapset = state.beatmapset;
  const cover =
    activeBeatmapset?.covers["cover@2x"] ||
    activeBeatmapset?.covers.cover ||
    activeBeatmapset?.covers.card ||
    activeBeatmapset?.covers.list;

  const groups = activeBeatmapset
    ? grouped([...(activeBeatmapset.beatmaps ?? []), ...(activeBeatmapset.converts ?? [])])
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
      <button
        type="button"
        className="fixed inset-0 bg-[rgb(12_12_12/0.65)] backdrop-blur-xs transition-opacity"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden bg-canvas shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="label">Beatmap details</span>
            <a
              href={`/beatmapsets/${id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-faint underline decoration-dotted hover:text-fg"
              title="Open full page in new tab"
            >
              <span>/beatmapsets/{id}</span>
              <ExternalIcon className="h-3 w-3" />
            </a>
          </div>
          <button
            type="button"
            className="btn-ghost flex h-8 w-8 items-center justify-center rounded-[3px] text-muted hover:text-fg"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {state.status === "missing" ? (
            <div className="flex flex-col gap-3 py-12 text-center">
              <p className="label">404</p>
              <h2 className="display text-4xl">
                Beatmap not found<span className="text-accent">.</span>
              </h2>
              <p className="text-sm text-muted">This beatmapset does not exist or has been removed.</p>
            </div>
          ) : !activeBeatmapset ? (
            <div className="flex flex-col gap-6 py-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
                <div className="aspect-[2.2/1] animate-pulse rounded-[4px] bg-subtle" />
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-20 animate-pulse bg-subtle" />
                  <div className="h-8 w-3/4 animate-pulse bg-subtle" />
                  <div className="h-5 w-1/2 animate-pulse bg-subtle" />
                  <div className="h-10 w-full animate-pulse bg-subtle" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {state.status === "setup" ? (
                <div className="mb-2">
                  <SetupNotice />
                </div>
              ) : null}

              {state.status === "error" ? (
                <p className="border border-line bg-accent-soft px-4 py-3 text-sm text-accent-strong">
                  {state.message}
                </p>
              ) : null}

              {/* Main Info */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
                <div className="card h-fit self-start overflow-hidden">
                  <BeatmapCover
                    src={cover}
                    id={activeBeatmapset.id}
                    title={activeBeatmapset.title}
                    artist={activeBeatmapset.artist}
                    nsfw={activeBeatmapset.nsfw}
                    aspect="detail"
                    blurMode="always"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-0.5 font-mono text-xs font-semibold text-fg tracking-wide uppercase shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={statusIcon(activeBeatmapset.status)}
                        alt=""
                        className="h-3.5 w-auto shrink-0 object-contain"
                      />
                      <span>{formatStatus(activeBeatmapset.status)}</span>
                    </span>
                    {activeBeatmapset.nsfw ? (
                      <span className="rounded-[2px] border border-red-500/30 bg-red-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-red-200 uppercase shadow-xs">
                        Explicit
                      </span>
                    ) : null}
                    {(activeBeatmapset as { is_deleted_from_osu?: boolean }).is_deleted_from_osu ? (
                      <span className="rounded-[2px] border border-amber-500/40 bg-amber-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-amber-200 uppercase shadow-xs">
                        Archived Snapshot (Official Deleted)
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <h2 id={titleId} className="display text-3xl sm:text-4xl break-words [overflow-wrap:anywhere]">
                      {activeBeatmapset.title}
                    </h2>
                    <p className="mt-1 text-base text-muted break-words [overflow-wrap:anywhere]">{activeBeatmapset.artist}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint">
                      <UserIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                      <span>mapped by</span>
                      <a
                        href={
                          activeBeatmapset.user_id
                            ? `https://osu.ppy.sh/users/${activeBeatmapset.user_id}`
                            : `https://osu.ppy.sh/users/${encodeURIComponent(activeBeatmapset.creator)}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-fg hover:text-accent hover:underline underline-offset-2 transition-colors"
                        title={`View ${activeBeatmapset.creator}'s profile on osu!`}
                      >
                        {activeBeatmapset.creator}
                      </a>
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint" title={`${activeBeatmapset.play_count.toLocaleString()} plays`}>
                      <PlayIcon className="h-3 w-3 text-faint" />
                      <span className="font-semibold text-fg tabular-nums">{compactCount(activeBeatmapset.play_count)}</span>
                      <span>plays</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint" title={`${activeBeatmapset.favourite_count.toLocaleString()} favourites`}>
                      <HeartIcon className="h-3 w-3 text-accent" />
                      <span className="font-semibold text-fg tabular-nums">{compactCount(activeBeatmapset.favourite_count)}</span>
                      <span>fav</span>
                    </span>

                    {activeBeatmapset.bpm ? (
                      <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint">
                        <NoteIcon className="h-3 w-3 text-faint" />
                        <span className="font-semibold text-fg tabular-nums">{Math.round(activeBeatmapset.bpm)}</span>
                        <span>BPM</span>
                      </span>
                    ) : null}

                    {activeBeatmapset.last_updated ? (
                      <span className="group/date relative inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-subtle px-2 py-1 text-faint cursor-help">
                        <CalendarIcon className="h-3.5 w-3.5 text-faint" />
                        <time
                          dateTime={activeBeatmapset.last_updated}
                          title={formatUtcDateTime(activeBeatmapset.last_updated)}
                          suppressHydrationWarning
                          className="font-medium text-fg hover:underline underline-offset-2 transition-colors"
                        >
                          updated {formatDate(activeBeatmapset.last_updated)}
                        </time>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 z-30 mb-1.5 hidden w-max rounded-[2px] border border-line bg-slab px-2 py-1 font-mono text-[11px] font-medium leading-none text-on-slab shadow-lg group-hover/date:block group-focus-within/date:block"
                        >
                          {formatUtcDateTime(activeBeatmapset.last_updated)}
                        </span>
                      </span>
                    ) : null}
                  </div>

                  {activeBeatmapset.preview_url ? (
                    <MusicPlayer
                      src={absoluteUrl(activeBeatmapset.preview_url)}
                    />
                  ) : null}

                  <BeatmapActions id={activeBeatmapset.id} beatmapset={activeBeatmapset} />
                </div>
              </div>

              {/* Difficulties */}
              <div className="flex flex-col gap-6">
                {state.status === "ok" && !state.fullyLoaded ? (
                  <div className="flex items-center gap-2 font-mono text-xs text-faint">
                    <span className="inline-block h-2 w-2 animate-ping rounded-full bg-accent" />
                    Loading full difficulty parameters & converts…
                  </div>
                ) : null}

                {groups.map((group) => (
                  <div key={group.mode} className="flex flex-col gap-2.5">
                    <h3 className="label inline-flex items-center gap-1.5">
                      <ModeIcon mode={group.mode} className="h-3.5 w-3.5" />
                      <span>{MODE_LABEL[group.mode]}</span>
                    </h3>
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
                              <td className="px-3 py-2 font-mono tabular-nums">
                                {beatmap.accuracy.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 font-mono tabular-nums">{beatmap.drain.toFixed(1)}</td>
                              <td className="px-3 py-2 font-mono tabular-nums">
                                {beatmap.bpm ? Math.round(beatmap.bpm) : "—"}
                              </td>
                              <td className="px-3 py-2 font-mono tabular-nums">
                                {formatLength(beatmap.total_length)}
                              </td>
                              <td className="px-3 py-2 font-mono tabular-nums">
                                {beatmap.max_combo ? compactCount(beatmap.max_combo) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
