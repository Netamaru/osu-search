"use client";

import { useState } from "react";
import { ClockIcon, HeartIcon, PlayIcon } from "@/components/icons";
import { compactCount, formatLength, formatStatus, statusIcon } from "@/lib/format";

function DiscPattern({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.6" />
      <path d="M 50 16 A 34 34 0 0 1 84 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M 16 50 A 34 34 0 0 1 50 84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function FallbackBanner({ id = 0, title, artist }: { id?: number; title?: string; artist?: string }) {
  const hue1 = (Math.abs(id) * 67 + 310) % 360;
  const hue2 = (hue1 + 50) % 360;

  const style = {
    background: `radial-gradient(ellipse at 75% 25%, hsl(${hue1}, 50%, 16%) 0%, hsl(${hue2}, 38%, 9%) 60%, hsl(${hue1}, 25%, 5%) 100%)`,
  };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
      style={style}
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-25"
        style={{ background: `hsl(${hue1}, 75%, 50%)` }}
      />
      <div
        className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full blur-3xl opacity-20"
        style={{ background: `hsl(${hue2}, 65%, 45%)` }}
      />

      {/* Center graphic with rhythm disc */}
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <DiscPattern className="h-14 w-14 text-white/35 transition-transform duration-500 group-hover:scale-105" />
        {title ? (
          <div className="max-w-[85%] px-3">
            <p className="truncate font-sans text-xs font-semibold text-white/70">{title}</p>
            {artist ? <p className="truncate font-sans text-[11px] text-white/40">{artist}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BeatmapCover({
  src,
  alt = "",
  id = 0,
  title,
  artist,
  status,
  nsfw = false,
  plays,
  favourites,
  length,
  aspect = "card",
  className = "",
  blurMode = "hover",
  priority = false,
}: {
  src?: string | null;
  alt?: string;
  id?: number;
  title?: string;
  artist?: string;
  status?: string;
  nsfw?: boolean;
  plays?: number;
  favourites?: number;
  length?: number | string;
  aspect?: "card" | "detail";
  className?: string;
  blurMode?: "hover" | "always";
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  const aspectClass = aspect === "card" ? "aspect-[16/7]" : "aspect-[2.2/1]";

  const blurClass = nsfw
    ? blurMode === "hover"
      ? "blur-xl group-hover:blur-none group-focus-visible:blur-none"
      : "blur-2xl"
    : "";

  const formattedLength =
    typeof length === "number"
      ? length > 0
        ? formatLength(length)
        : null
      : length || null;

  return (
    <div className={`relative overflow-hidden ${aspectClass} bg-subtle ${className}`}>
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${blurClass}`}
        />
      ) : (
        <FallbackBanner id={id} title={title} artist={artist} />
      )}

      {/* Top-left: Status & NSFW badges */}
      {status || nsfw ? (
        <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1.5">
          {status ? (
            <span className="inline-flex items-center gap-1 rounded-[2px] border border-white/10 bg-black/65 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white uppercase backdrop-blur-md shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={statusIcon(status)}
                alt=""
                className="h-3 w-auto shrink-0 object-contain brightness-110"
              />
              <span>{formatStatus(status)}</span>
            </span>
          ) : null}
          {nsfw ? (
            <span className="rounded-[2px] border border-red-500/30 bg-red-950/75 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-red-200 uppercase backdrop-blur-md shadow-xs">
              Explicit
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Top-right: Combined Plays & Favourites */}
      {plays !== undefined || favourites !== undefined ? (
        <div className="absolute top-2 right-2 z-10 flex items-center">
          <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/10 bg-black/65 px-2 py-0.5 font-mono text-[10px] font-medium text-white/90 backdrop-blur-md shadow-xs tabular-nums">
            {plays !== undefined ? (
              <span
                className="inline-flex items-center gap-1"
                title={`${plays.toLocaleString()} plays`}
              >
                <PlayIcon className="h-3 w-3 shrink-0 fill-current text-white/70" />
                <span>{compactCount(plays)}</span>
              </span>
            ) : null}
            {plays !== undefined && favourites !== undefined ? (
              <span className="text-white/30 text-[9px]" aria-hidden="true">·</span>
            ) : null}
            {favourites !== undefined ? (
              <span
                className="inline-flex items-center gap-1"
                title={`${favourites.toLocaleString()} favourites`}
              >
                <HeartIcon className="h-3 w-3 shrink-0 fill-current text-accent" />
                <span>{compactCount(favourites)}</span>
              </span>
            ) : null}
          </span>
        </div>
      ) : null}

      {/* Bottom-right: Song Duration */}
      {formattedLength ? (
        <div className="absolute bottom-2 right-2 z-10 flex items-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/10 bg-black/65 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white/90 backdrop-blur-md shadow-xs tabular-nums"
            title={`Length: ${formattedLength}`}
          >
            <ClockIcon className="h-3 w-3 shrink-0 fill-current text-white/70" />
            <span>{formattedLength}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
