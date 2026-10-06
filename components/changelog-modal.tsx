"use client";

import { useEffect, useId } from "react";
import { CloseIcon } from "@/components/icons";

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
    version: "v2.0.0",
    date: "October 2026",
    badge: "Current",
    highlights:
      "Full osu! OAuth 2.0 user login, personal beatmap collections, 1-click favorites, PostgreSQL offline map archival, Card vs List view switcher, and UI polish.",
    changes: [
      {
        type: "feat",
        title: "Login with osu! Account (OAuth 2.0)",
        description:
          "Sign in directly with your official osu! account via OAuth 2.0 code authorization. Displays your avatar, username, and user dropdown menu in the top navigation bar with easy logout and profile shortcuts.",
      },
      {
        type: "feat",
        title: "Personal Beatmap Collections System",
        description:
          "Organize beatmaps into customized private collections (e.g. stream training, jump practice, anime OSTs). Add or remove beatmaps effortlessly with a unified modal from search cards, lists, and detail views.",
      },
      {
        type: "feat",
        title: "1-Click Beatmap Favorites",
        description:
          "Save your top beatmaps with a single click and access them anytime on the dedicated /favorites page with instant text filtering and view options.",
      },
      {
        type: "feat",
        title: "Card vs. List View Toggle",
        description:
          "Switch between visual card view and compact high-density list view on both Collections and Favorites pages, with your preference remembered automatically.",
      },
      {
        type: "feat",
        title: "Offline & Deleted Beatmap Archival (PostgreSQL Snapshot)",
        description:
          "Whenever a beatmap is saved to collections or favorites, complete metadata snapshots are archived to PostgreSQL. If a map is later removed or DMCA'd on official osu!, it remains fully accessible and viewable with an Archived Snapshot badge.",
      },
      {
        type: "feat",
        title: "Collection Search, Scrollable Lists & Local Timestamps",
        description:
          "Search through collections in real-time with an integrated search bar, navigate long lists with smooth scroll containment, and view exact creation/addition dates converted to your local device timezone.",
      },
      {
        type: "improve",
        title: "Isolated API Credentials Architecture",
        description:
          "Dedicated server environment credentials strictly to user OAuth authentication, requiring browser-stored credentials for search queries to prevent shared rate-limit throttling.",
      }
    ],
  },
  {
    version: "v1.4.0",
    date: "September 2026",
    highlights:
      "Custom music player with volume memory, card frosted glass & micro-interactions, live extra difficulty preview, and beatmap detail redesign.",
    changes: [
      {
        type: "feat",
        title: "Custom Brutalist Music Player with Volume Memory",
        description:
          "Replaced native browser audio controls with a custom player featuring persistent volume/mute memory in localStorage (defaulting safely to 50%), live 3-bar animated sound equalizer, interactive drag-and-click scrub bar, and single-active playback management.",
      },
      {
        type: "feat",
        title: "Frosted Glass Cover Badges & Micro-Interactions",
        description:
          "Upgraded card badges to semi-transparent frosted glass, relocated song length badge to bottom-right corner, merged plays & favourites into a sleek horizontal pill, and added subtle cover image zoom with ambient hot-pink card hover glow.",
      },
      {
        type: "feat",
        title: "Live Stats Panel for More Difficulties Popover",
        description:
          "Scoped scroll containment inside the difficulty popover to eliminate tooltip clipping, adding a live difficulty stats panel that displays real-time AR, CS, HP, OD, BPM, Length, and Combo when hovering any difficulty chip or row.",
      },
      {
        type: "feat",
        title: "Enhanced Beatmap Detail & Table Icons",
        description:
          "Transformed metadata text in detail views into clean, self-contained pill tags with dedicated vector icons (User, Play, Heart, Note, Calendar), added icons to difficulty table headers (Stars, BPM, Length, Combo), and highlighted difficulty ratings with colored star badges.",
      },
      {
        type: "improve",
        title: "Primary CTA Hierarchy & Action Labels",
        description:
          "Transformed osu!direct into the primary call-to-action with vibrant signature hot-pink accent styling, and streamlined action button labels to 'Details' to prevent awkward line breaks.",
      },
      {
        type: "improve",
        title: "De-duplication in Detail Views",
        description:
          "Removed redundant overlay badges from detail cover banners to keep artwork completely clean and unobstructed, and streamlined music player labels to avoid repeating song titles already featured in the main header.",
      },
      {
        type: "improve",
        title: "Dead Code & Asset Consolidation",
        description:
          "Purged obsolete formatting functions, eliminated redundant local SVG icon definitions across components into a centralized @/components/icons module, and cleaned up unused CSS variables.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "September 2026",
    highlights:
      "Card redesign, layout shift elimination, advanced filter query sync, and stability improvements.",
    changes: [
      {
        type: "feat",
        title: "Mode & Status Filter Icons & Brutalist Buttons",
        description:
          "Added official pixel art and SVG icons to all Mode and Status filter options, and unified their shape with the site's brutalist technical theme by replacing 999px pills with rounded-[2px] buttons.",
      },
      {
        type: "feat",
        title: "Dark Mode Switch Button in Navbar",
        description:
          "Replaced the external osu! beatmaps link in the header with a theme switch button featuring smooth transitions, sun/moon icons, accessibility attributes, and persistent localStorage sync.",
      },
      {
        type: "feat",
        title: "Interactive Difficulty Stat Preview Tooltip",
        description:
          "Hovering any difficulty chip now reveals a rich pop-up preview with star rating, themed stat bars for CS, AR, OD, HP, and bottom stats for BPM, duration, and max combo with an authentic hitcircle combo icon. Hovering also dynamically updates the card's duration badge to that difficulty's specific length.",
      },
      {
        type: "feat",
        title: "Beatmap Card Status & Stats Redesign",
        description:
          "Relocated beatmap status badge to the top-left with dynamic beatmap duration (supporting multi-length ranges and difficulty hover preview) directly below, and added play count & favourites badges to the top-right over the cover.",
      },
      {
        type: "feat",
        title: "Last Updated Date Display with UTC Pop-up",
        description:
          "Beatmap cards and detail views now display the last updated date in the user's local short date format with a full UTC timestamp hover tooltip.",
      },
      {
        type: "improve",
        title: "Zero-CLS Convert Rating Loading & Scroll Stability",
        description:
          "Eliminated upward scroll jumping and layout shifts during asynchronous star rating calculation by locking difficulty chip dimensions, reserving chip row height, and enforcing scroll anchoring.",
      },
      {
        type: "improve",
        title: "Full Advanced Filters Query Serialization",
        description:
          "All advanced filters (BPM, AR, CS, OD, HP, length, keys, mapper, artist, etc.) now sync directly with URL search params for instant sharing and direct query imports.",
      },
      {
        type: "improve",
        title: "Filter Debounce & State Persistence",
        description:
          "Added a 350ms debounce delay before triggering searches while adjusting filters, and persist advanced filters collapse state across page reloads.",
      },
      {
        type: "fix",
        title: "Long Title Word-Break & Overflow Prevention",
        description:
          "Fixed unbroken long beatmap titles and artist strings spilling outside card and modal boundaries with flex min-width constraints and universal word breaking.",
      },
      {
        type: "fix",
        title: "Convert Rating Resiliency & Stuck Calculation Fix",
        description:
          "Made convert resolution error-tolerant per beatmapset and optimized batch requests to ensure calculations never get stuck indefinitely.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "September 2026",
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
                  className={`absolute -left-[25px] sm:-left-[29px] top-1.5 h-3 w-3 rounded-full ring-4 ring-canvas ${entry.badge ? "bg-accent" : "bg-line-strong"
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
