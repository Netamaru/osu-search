import { ModeIcon } from "@/components/mode-icon";
import { ClockIcon, ComboIcon, NoteIcon, StarIcon } from "@/components/icons";
import { difficultyColor, difficultyTextColor, formatLength } from "@/lib/format";
import type { Beatmap, Ruleset } from "@/lib/osu/types";

function StatBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const formattedValue = Number(value.toFixed(1)).toString();

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="w-5 text-[10px] font-mono font-medium text-faint uppercase shrink-0">{label}</span>
      <div className="h-1.5 flex-1 min-w-[32px] rounded-[1px] bg-subtle border border-line overflow-hidden">
        <div
          className="h-full rounded-[1px] bg-accent transition-all duration-150"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-6 text-left font-mono text-[11px] font-medium text-fg tabular-nums shrink-0">
        {formattedValue}
      </span>
    </div>
  );
}


export function DifficultyStatsBody({
  beatmap,
  fallbackBpm,
  fallbackLength,
}: {
  beatmap: Beatmap;
  fallbackBpm?: number;
  fallbackLength?: number;
}) {
  const bpm = beatmap.bpm || fallbackBpm;
  const length = beatmap.total_length || fallbackLength || 0;

  return (
    <div className="flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-line pb-2 min-w-0">
        <ModeIcon mode={beatmap.mode} />
        <span
          className="truncate font-sans font-semibold text-xs text-fg flex-1 min-w-0"
          title={beatmap.version}
        >
          {beatmap.version}
        </span>
        {beatmap.convert ? (
          <span className="font-mono text-[10px] text-faint shrink-0">(convert)</span>
        ) : null}
        <span
          className="ml-auto inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] leading-none font-semibold tabular-nums shadow-xs shrink-0"
          style={{
            background: difficultyColor(beatmap.difficulty_rating),
            color: difficultyTextColor(),
          }}
        >
          <StarIcon className="h-3.5 w-3.5 shrink-0 fill-current" />
          <span>{beatmap.difficulty_rating.toFixed(2)}</span>
        </span>
      </div>

      {/* Body: Left (AR, CS, HP, OD) and Right (Length, BPM, Combo) */}
      <div className="flex gap-3 pt-2">
        {/* Left Side: AR, CS, HP, OD */}
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <StatBar label="AR" value={beatmap.ar} />
          <StatBar label={beatmap.mode === "mania" ? "Key" : "CS"} value={beatmap.cs} />
          <StatBar label="HP" value={beatmap.drain} />
          <StatBar label="OD" value={beatmap.accuracy} />
        </div>

        {/* Right Side: Length, BPM, Combo */}
        <div className="flex flex-col justify-between border-l border-line pl-3 font-mono text-[11px] tabular-nums shrink-0 py-0.5 min-w-[82px]">
          <div className="flex items-center gap-1.5" title="Length">
            <ClockIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
            <span className="font-medium text-fg">{formatLength(length)}</span>
          </div>
          <div className="flex items-center gap-1.5" title="BPM">
            <NoteIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
            <span className="font-medium text-fg">{bpm ? `${Math.round(bpm)} BPM` : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Max combo">
            <ComboIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
            <span className="font-medium text-fg">
              {beatmap.max_combo ? `${beatmap.max_combo.toLocaleString()}x` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyStatTooltip({
  beatmap,
  fallbackBpm,
  fallbackLength,
  align = "left",
}: {
  beatmap: Beatmap;
  fallbackBpm?: number;
  fallbackLength?: number;
  align?: "left" | "right";
}) {
  const alignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute bottom-full ${alignClass} z-50 mb-1.5 hidden w-72 max-w-[calc(100vw-2rem)] flex-col rounded-[3px] border border-line bg-canvas p-2.5 text-left shadow-xl shadow-black/20 group-hover/chip:flex`}
    >
      <DifficultyStatsBody
        beatmap={beatmap}
        fallbackBpm={fallbackBpm}
        fallbackLength={fallbackLength}
      />
    </div>
  );
}

type DifficultyChipProps = {
  rating: number;
  name: string;
  mode?: Ruleset;
  variant?: "name" | "rating";
  tooltip?: boolean;
  loading?: boolean;
  beatmap?: Beatmap;
  fallbackBpm?: number;
  fallbackLength?: number;
  align?: "left" | "right";
  onHover?: (beatmap: Beatmap | null) => void;
};

export function DifficultyChip({
  rating,
  name,
  mode,
  variant = "name",
  tooltip = true,
  loading = false,
  beatmap,
  fallbackBpm,
  fallbackLength,
  align = "left",
  onHover,
}: DifficultyChipProps) {
  const style = { background: difficultyColor(rating), color: difficultyTextColor() };
  const alignClass = align === "right" ? "right-0" : "left-0";

  const handleMouseEnter = () => {
    if (onHover && beatmap) onHover(beatmap);
  };

  const handleMouseLeave = () => {
    if (onHover) onHover(null);
  };

  if (variant === "rating" && mode && loading) {
    return (
      <span
        title={tooltip ? undefined : `${name} (calculating converted stars...)`}
        className="group/chip relative inline-flex h-[20px] min-w-[58px] box-border shrink-0 items-center gap-1 rounded-[2px] border border-line-strong/30 border-dashed bg-code px-1.5 font-mono text-[11px] leading-none font-medium text-faint hover:z-50 shadow-xs"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ModeIcon mode={mode} />
        <span className="inline-flex flex-1 items-center justify-center text-[9px] tracking-widest text-faint [overflow-anchor:none]" aria-label="Calculating">
          <span className="animate-pulse">·</span>
          <span className="animate-pulse [animation-delay:150ms]">·</span>
          <span className="animate-pulse [animation-delay:300ms]">·</span>
        </span>
        {tooltip ? (
          <span
            role="tooltip"
            className={`pointer-events-none absolute bottom-full ${alignClass} z-50 mb-1.5 hidden w-max max-w-56 break-words rounded-[2px] border border-line bg-canvas p-2 text-left font-sans text-[11px] leading-snug font-medium text-fg shadow-lg group-hover/chip:block`}
          >
            <span className="block font-semibold text-fg">{name}</span>
            <span className="font-mono text-[10px] text-accent">$ calculating convert stars…</span>
          </span>
        ) : null}
      </span>
    );
  }

  if (variant === "rating" && mode) {
    return (
      <span
        title={tooltip ? undefined : name}
        className="group/chip relative inline-flex h-[20px] min-w-[58px] box-border shrink-0 items-center gap-1 rounded-[2px] border border-transparent px-1.5 font-mono text-[11px] leading-none font-medium hover:z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={style}
      >
        <ModeIcon mode={mode} />
        <span className="shrink-0 tabular-nums">{rating.toFixed(2)}</span>
        {tooltip ? (
          beatmap && !loading ? (
            <DifficultyStatTooltip
              beatmap={beatmap}
              fallbackBpm={fallbackBpm}
              fallbackLength={fallbackLength}
              align={align}
            />
          ) : (
            <span
              role="tooltip"
              className={`pointer-events-none absolute bottom-full ${alignClass} z-50 mb-1.5 hidden w-max max-w-52 break-words rounded-[2px] border border-line bg-canvas px-2 py-1 text-left font-sans text-[11px] leading-snug font-medium text-fg shadow-lg group-hover/chip:block`}
            >
              {name}
            </span>
          )
        ) : null}
      </span>
    );
  }

  return (
    <span
      title={tooltip && beatmap ? undefined : name}
      className="group/chip relative inline-flex shrink-0 max-w-full items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium hover:z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {mode ? <ModeIcon mode={mode} /> : null}
      <span className="truncate">{name}</span>
      {tooltip && beatmap ? (
        <DifficultyStatTooltip
          beatmap={beatmap}
          fallbackBpm={fallbackBpm}
          fallbackLength={fallbackLength}
          align={align}
        />
      ) : null}
    </span>
  );
}
