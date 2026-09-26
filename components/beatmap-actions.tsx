import { DetailIcon, DownloadIcon, ExternalIcon as OpenIcon } from "@/components/icons";

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
          <span>Details</span>
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
