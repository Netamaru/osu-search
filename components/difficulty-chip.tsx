import { ModeIcon } from "@/components/mode-icon";
import { difficultyColor, difficultyTextColor } from "@/lib/format";
import type { Ruleset } from "@/lib/osu/types";

type DifficultyChipProps = {
  rating: number;
  name: string;
  mode?: Ruleset;
  variant?: "name" | "rating";
};

export function DifficultyChip({ rating, name, mode, variant = "name" }: DifficultyChipProps) {
  const style = { background: difficultyColor(rating), color: difficultyTextColor() };

  if (variant === "rating" && mode) {
    return (
      <span
        className="group/chip relative inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium hover:z-20"
        style={style}
      >
        <ModeIcon mode={mode} />
        <span className="shrink-0 tabular-nums">{rating.toFixed(2)}</span>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-max max-w-52 border border-line bg-slab px-1.5 py-1 text-left font-sans text-[11px] leading-snug font-medium text-on-slab group-hover/chip:block"
        >
          {name}
        </span>
      </span>
    );
  }

  return (
    <span
      title={name}
      className="inline-flex max-w-full items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium"
      style={style}
    >
      {mode ? <ModeIcon mode={mode} /> : null}
      <span className="truncate">{name}</span>
    </span>
  );
}
