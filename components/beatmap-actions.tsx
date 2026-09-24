function OpenIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M6.5 3H3.8A1.8 1.8 0 0 0 2 4.8v7.4A1.8 1.8 0 0 0 3.8 14h7.4a1.8 1.8 0 0 0 1.8-1.8V9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 2h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2 7.5 8.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DetailIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

export function BeatmapActions({
  id,
  size = "md",
  onOpenDetails,
}: {
  id: number;
  size?: "sm" | "md";
  onOpenDetails?: () => void;
}) {
  const compact = size === "sm";
  const box = compact
    ? "min-h-8 gap-1.5 px-2 py-1 text-center text-xs leading-tight"
    : "min-h-11 gap-2 px-3 py-2 text-center text-sm leading-snug";
  const icon = compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0";

  return (
    <div className="relative z-10 grid grid-cols-2 gap-2">
      {onOpenDetails ? (
        <button
          type="button"
          className={`btn-solid inline-flex w-full items-center justify-center font-semibold ${box}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenDetails();
          }}
        >
          <DetailIcon className={icon} />
          <span>Open beatmap details</span>
        </button>
      ) : (
        <a
          className={`btn-solid inline-flex w-full items-center justify-center font-semibold ${box}`}
          href={`https://osu.ppy.sh/beatmapsets/${id}`}
          target="_blank"
          rel="noreferrer"
        >
          <OpenIcon className={icon} />
          <span>Open on osu!</span>
        </a>
      )}
      <a
        className={`btn-direct inline-flex w-full items-center justify-center font-semibold ${box}`}
        href={`osu://dl/${id}`}
      >
        <DownloadIcon className={icon} />
        <span>osu!direct</span>
      </a>
    </div>
  );
}
