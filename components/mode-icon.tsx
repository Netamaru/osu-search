import type { Ruleset } from "@/lib/osu/types";

const MODE_ICON: Record<Ruleset, string> = {
  osu: "/modes/osu.png",
  taiko: "/modes/taiko.png",
  fruits: "/modes/catch.png",
  mania: "/modes/mania.png",
};

export function ModeIcon({ mode }: { mode: Ruleset }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MODE_ICON[mode]}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 [image-rendering:pixelated]"
    />
  );
}
