function OpenIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M6.5 3H3.8A1.8 1.8 0 0 0 2 4.8v7.4A1.8 1.8 0 0 0 3.8 14h7.4a1.8 1.8 0 0 0 1.8-1.8V9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 2h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2 7.5 8.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DownloadIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M8 2.2v7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.6 7.2 8 10.6l3.4-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 13.2h10" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function BeatmapActions({ id, size = "md" }: { id: number; size?: "sm" | "md" }) {
  const compact = size === "sm";
  const box = compact
    ? "min-h-8 gap-1.5 px-2.5 py-1.5 text-xs"
    : "min-h-11 gap-2 px-3 py-2 text-sm";
  const icon = compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0";

  return (
    <div className="relative z-10 grid grid-cols-2 gap-2">
      <a
        className={`btn-solid inline-flex w-full items-center justify-center font-semibold ${box}`}
        href={`https://osu.ppy.sh/beatmapsets/${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <OpenIcon className={icon} />
        Open on osu!
      </a>
      <a
        className={`btn-direct inline-flex w-full items-center justify-center font-semibold ${box}`}
        href={`osu://dl/${id}`}
      >
        <DownloadIcon className={icon} />
        osu!direct
      </a>
    </div>
  );
}
