"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { formatLength } from "@/lib/format";

const STORAGE_VOLUME_KEY = "osu_player_volume";
const STORAGE_MUTED_KEY = "osu_player_muted";
const DEFAULT_VOLUME = 0.5; // 50% default to protect user's ears

function getStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const val = localStorage.getItem(STORAGE_VOLUME_KEY);
    if (val !== null) {
      const num = parseFloat(val);
      if (!Number.isNaN(num) && num >= 0 && num <= 1) {
        return num;
      }
    }
  } catch {}
  return DEFAULT_VOLUME;
}

function getStoredMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_MUTED_KEY) === "true";
  } catch {}
  return false;
}

function saveVolumeState(volume: number, isMuted: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_VOLUME_KEY, String(volume));
    localStorage.setItem(STORAGE_MUTED_KEY, String(isMuted));
    window.dispatchEvent(
      new CustomEvent("osu_volume_change", {
        detail: { volume, isMuted },
      })
    );
  } catch {}
}

function SpeakerIcon({ volume, isMuted, className }: { volume: number; isMuted: boolean; className: string }) {
  if (isMuted || volume === 0) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  if (volume < 0.5) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function MusicPlayer({
  src,
  title,
  artist,
  className = "",
}: {
  src: string;
  title?: string;
  artist?: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initialize volume and mute state from localStorage
  useEffect(() => {
    const savedVol = getStoredVolume();
    const savedMuted = getStoredMuted();
    setVolume(savedVol);
    setIsMuted(savedMuted);

    if (audioRef.current) {
      audioRef.current.volume = savedVol;
      audioRef.current.muted = savedMuted;
    }

    const handleSyncVolume = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.volume === "number") {
        setVolume(detail.volume);
        setIsMuted(Boolean(detail.isMuted));
        if (audioRef.current) {
          audioRef.current.volume = detail.volume;
          audioRef.current.muted = Boolean(detail.isMuted);
        }
      }
    };

    const handleOtherPlay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.src !== src && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    window.addEventListener("osu_volume_change", handleSyncVolume);
    window.addEventListener("osu_player_play", handleOtherPlay);

    return () => {
      window.removeEventListener("osu_volume_change", handleSyncVolume);
      window.removeEventListener("osu_player_play", handleOtherPlay);
    };
  }, [src]);

  // Reset playback when src changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
  }, [src]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      window.dispatchEvent(
        new CustomEvent("osu_player_play", {
          detail: { src },
        })
      );
      audioRef.current.play().catch(() => {
        setHasError(true);
      });
    }
  }, [isPlaying, src]);

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (isMuted && newVol > 0) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
      saveVolumeState(newVol, false);
    } else {
      saveVolumeState(newVol, isMuted);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    saveVolumeState(volume, nextMuted);
  };

  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleSeek(e.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      handleSeek(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentVolPercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      className={`rounded-[3px] border border-line bg-subtle p-3 transition-colors hover:border-line-strong/60 ${className}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (!isDragging && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onError={() => setHasError(true)}
      />

      {/* Top Row: Play/Pause, Title/Visualizer, Volume Control */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={hasError}
          aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-accent text-canvas font-bold transition-all hover:bg-accent-strong active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-xs"
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4 fill-current" />
          ) : (
            <PlayIcon className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Track Label & Playing Visualizer */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="truncate font-sans text-xs font-semibold text-fg">
              {title || "Audio Preview"}
            </span>
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3 shrink-0" title="Playing">
                <span className="w-0.5 bg-accent rounded-full animate-eq-1" />
                <span className="w-0.5 bg-accent rounded-full animate-eq-2" />
                <span className="w-0.5 bg-accent rounded-full animate-eq-3" />
              </div>
            ) : null}
          </div>
          {hasError ? (
            <span className="font-mono text-[10px] text-red-400">Preview audio unavailable</span>
          ) : (
            <span className="truncate font-mono text-[10px] text-faint">
              {artist ? `${artist} · ` : ""}preview
            </span>
          )}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute volume" : "Mute volume"}
            className="rounded-[2px] p-1 text-faint hover:text-fg transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <SpeakerIcon volume={volume} isMuted={isMuted} className="h-4 w-4" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeSlider}
            aria-label="Volume slider"
            className="h-1.5 w-16 sm:w-20 cursor-pointer accent-accent bg-line rounded-[1px]"
            title={`Volume: ${currentVolPercent}%`}
          />
          <span className="w-7 text-right font-mono text-[10px] text-faint tabular-nums">
            {currentVolPercent}%
          </span>
        </div>
      </div>

      {/* Bottom Row: Progress bar & Time */}
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="w-8 shrink-0 text-left font-mono text-[11px] text-faint tabular-nums">
          {formatLength(currentTime)}
        </span>

        {/* Interactive Scrub Bar */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="group/track relative flex h-3 flex-1 cursor-pointer items-center select-none"
        >
          <div className="h-1.5 w-full rounded-[1px] bg-canvas border border-line overflow-hidden group-hover/track:h-2 transition-all">
            <div
              className="h-full bg-accent rounded-[1px] transition-[width] duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <span className="w-8 shrink-0 text-right font-mono text-[11px] text-faint tabular-nums">
          {duration > 0 ? formatLength(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}
