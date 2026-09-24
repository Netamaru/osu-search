"use client";

import { useEffect, useId } from "react";

type ChangeType = "feat" | "improve" | "fix";

type ChangeItem = {
  type: ChangeType;
  title: string;
  description?: string;
};

type ChangelogEntry = {
  version: string;
  date: string;
  badge?: string;
  highlights?: string;
  changes: ChangeItem[];
};

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v1.2.0",
    date: "Latest",
    badge: "Current",
    highlights: "Converts support, terminal loading aesthetic, query syntax highlighting, and UI polish.",
    changes: [
      {
        type: "feat",
        title: "Standard Difficulty Converts for Rulesets",
        description:
          "When searching Catch, Taiko, or Mania, standard osu! maps that convert into that ruleset now appear in the difficulty list with calculated converted star ratings.",
      },
      {
        type: "feat",
        title: "Terminal-Style Difficulty Loading",
        description:
          "Difficulties awaiting asynchronous convert rating calculation now feature a pulsing terminal loading state and detailed hover tooltip.",
      },
      {
        type: "feat",
        title: "Query Strip Syntax Highlighting",
        description:
          "Color-coded query tokens for parameters (q, m, s), operators, filters (stars, ar, bpm), numbers, and quoted search phrases for effortless reading.",
      },
      {
        type: "improve",
        title: "Tri-State Include Filters",
        description:
          "Added tri-state controls (Include, Only, Exclude) for Video, Storyboard, Featured Artists, Converts, and Explicit content.",
      },
      {
        type: "improve",
        title: "Creator Profile Quick Links",
        description:
          "Beatmapset creator names across cards, modal views, and detail pages now link directly to their osu! user profiles.",
      },
      {
        type: "improve",
        title: "Infinite Scroll & Scroll to Top",
        description:
          "Optional bottom-of-page auto-load more toggle with threshold check, plus a smooth floating scroll-to-top action button.",
      },
      {
        type: "fix",
        title: "Difficulty Dropdown Layout & Truncation",
        description:
          "Fixed text overlapping on lengthy difficulty titles, right-aligned convert badges, and broadened the popover width.",
      },
      {
        type: "improve",
        title: "Dynamic Beatmap Cover Fallbacks",
        description:
          "Seeded radial gradient rhythm discs for beatmaps without official cover art.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "September 2026",
    highlights: "Multi-status searching, detailed modal view, and client credentials storage.",
    changes: [
      {
        type: "feat",
        title: "Multi-Status Search Support",
        description:
          "Search across multiple statuses simultaneously (e.g., Ranked + Loved + Qualified) with interleaving cursor pagination.",
      },
      {
        type: "feat",
        title: "Beatmap Detail Modal",
        description:
          "Inspect complete diff parameters (AR, CS, OD, HP, BPM, combo), difficulties categorized by ruleset, and listen to audio previews without leaving search results.",
      },
      {
        type: "improve",
        title: "Client-Side OAuth Credentials",
        description:
          "Save and securely manage personal osu! API client credentials in browser storage.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "Initial Release",
    highlights: "High-performance advanced osu! beatmap search engine.",
    changes: [
      {
        type: "feat",
        title: "Advanced Range & Exact Filters",
        description:
          "Fast filtering by stars, approach rate, circle size, drain, overall difficulty, bpm, song length, mania key count, artist, mapper, and genre.",
      },
      {
        type: "feat",
        title: "Shareable Search URLs",
        description:
          "Full state synchronization with query parameters for effortless sharing and bookmarking.",
      },
      {
        type: "feat",
        title: "Interactive Query Strip",
        description:
          "Inspect, copy, and manually edit the raw query to rapidly test complex search queries.",
      },
    ],
  },
];

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TypeBadge({ type }: { type: ChangeType }) {
  switch (type) {
    case "feat":
      return (
        <span className="inline-flex items-center rounded-[2px] border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-600 uppercase tracking-wider dark:text-emerald-400">
          new
        </span>
      );
    case "improve":
      return (
        <span className="inline-flex items-center rounded-[2px] border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-sky-600 uppercase tracking-wider dark:text-sky-400">
          improved
        </span>
      );
    case "fix":
      return (
        <span className="inline-flex items-center rounded-[2px] border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-600 uppercase tracking-wider dark:text-amber-400">
          fix
        </span>
      );
  }
}

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
      <button
        type="button"
        className="fixed inset-0 bg-[rgb(12_12_12/0.65)] backdrop-blur-xs transition-opacity"
        aria-label="Close changelog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden bg-canvas shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="label">Updates</span>
            <span className="h-3 w-px bg-line" aria-hidden="true" />
            <span className="font-mono text-xs text-faint">osu! Search</span>
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="mb-6">
            <h2 id={titleId} className="display text-3xl sm:text-4xl">
              Changelog<span className="text-accent">.</span>
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Recent features, improvements, and fixes for osu! Search.
            </p>
          </div>

          <div className="relative space-y-8 pl-5 border-l border-line sm:pl-6">
            {CHANGELOG_DATA.map((entry) => (
              <div key={entry.version} className="relative">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[25px] sm:-left-[29px] top-1.5 h-3 w-3 rounded-full ring-4 ring-canvas ${
                    entry.badge ? "bg-accent" : "bg-line-strong"
                  }`}
                  aria-hidden="true"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-base font-bold text-fg">{entry.version}</h3>
                  {entry.badge ? (
                    <span className="rounded-[2px] border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent uppercase tracking-wider">
                      {entry.badge}
                    </span>
                  ) : null}
                  <span className="text-xs text-faint font-mono">· {entry.date}</span>
                </div>

                {entry.highlights ? (
                  <p className="mt-1 text-xs text-muted leading-relaxed">{entry.highlights}</p>
                ) : null}

                <ul className="mt-3.5 space-y-2.5">
                  {entry.changes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="mt-0.5 shrink-0">
                        <TypeBadge type={item.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-fg">{item.title}</span>
                        {item.description ? (
                          <p className="mt-0.5 text-muted leading-normal">{item.description}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
