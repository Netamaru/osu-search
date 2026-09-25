import { ModeIcon } from "@/components/mode-icon";
import { difficultyColor, difficultyTextColor } from "@/lib/format";
import type { Ruleset } from "@/lib/osu/types";

type DifficultyChipProps = {
  rating: number;
  name: string;
  mode?: Ruleset;
  variant?: "name" | "rating";
  tooltip?: boolean;
  loading?: boolean;
};

export function DifficultyChip({
  rating,
  name,
  mode,
  variant = "name",
  tooltip = true,
  loading = false,
}: DifficultyChipProps) {
  const style = { background: difficultyColor(rating), color: difficultyTextColor() };

  if (variant === "rating" && mode && loading) {
    return (
      <span
        title={tooltip ? undefined : `${name} (calculating converted stars...)`}
        className="group/chip relative inline-flex h-[20px] min-w-[58px] box-border shrink-0 items-center gap-1 rounded-[2px] border border-line-strong/30 border-dashed bg-code px-1.5 font-mono text-[11px] leading-none font-medium text-faint hover:z-20 shadow-xs"
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
            className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-max max-w-56 break-words border border-line bg-slab px-2 py-1 text-left font-sans text-[11px] leading-snug font-medium text-on-slab shadow-lg group-hover/chip:block"
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
        className="group/chip relative inline-flex h-[20px] min-w-[58px] box-border shrink-0 items-center gap-1 rounded-[2px] border border-transparent px-1.5 font-mono text-[11px] leading-none font-medium hover:z-20"
        style={style}
      >
        <ModeIcon mode={mode} />
        <span className="shrink-0 tabular-nums">{rating.toFixed(2)}</span>
        {tooltip ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-max max-w-52 break-words border border-line bg-slab px-1.5 py-1 text-left font-sans text-[11px] leading-snug font-medium text-on-slab group-hover/chip:block"
          >
            {name}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span
      title={name}
      className="inline-flex shrink-0 max-w-full items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium"
      style={style}
    >
      {mode ? <ModeIcon mode={mode} /> : null}
      <span className="truncate">{name}</span>
    </span>
  );
}
