# Changelog
All notable changes to **osu! Search** will be documented in this file.

## [v1.3.0] - Latest

### Highlights
Card redesign, layout shift elimination, advanced filter query sync, and stability improvements.

### Added
- **Beatmap Card Status & Stats Redesign**: Moved the beatmap status badge to the top-left over the cover, and added play count & favourites badges to the top-right corner with sharp play and heart icons.
- **Last Updated Date Display with UTC Pop-up**: Beatmap cards and detail views display the last updated date in local short date format with a full UTC timestamp hover pop-up.

### Improved
- **Zero-CLS Convert Rating Loading & Scroll Stability**: Eliminated upward scroll jumping and layout shifts during asynchronous star rating calculation by locking difficulty chip dimensions, reserving chip row height, and enforcing scroll anchoring.
- **Full Advanced Filters Query Serialization**: All advanced filters (BPM, AR, CS, OD, HP, length, keys, mapper, artist, etc.) now sync directly with URL search params for instant sharing and direct query imports.
- **Filter Debounce & State Persistence**: Added a 350ms debounce delay before triggering searches while adjusting filters, and persist advanced filters collapse state across page reloads via `localStorage`.

### Fixed
- **Long Title Word-Break & Overflow Prevention**: Fixed unbroken long beatmap titles and artist strings spilling outside card and modal boundaries with flex min-width constraints and universal word breaking.
- **Convert Rating Resiliency & Stuck Calculation Fix**: Made convert resolution error-tolerant per beatmapset and optimized batch requests to ensure calculations never get stuck indefinitely.

---

## [v1.2.0] - September 2026

### Highlights
Converts support, terminal loading aesthetic, query syntax highlighting, and UI polish.

### Added
- **Standard Difficulty Converts for Rulesets**: When searching Catch, Taiko, or Mania, standard osu! maps that convert into that ruleset appear with calculated converted star ratings.
- **Terminal-Style Difficulty Loading**: Difficulties awaiting asynchronous convert rating calculation feature a pulsing terminal loading state and detailed hover tooltip.
- **Query Strip Syntax Highlighting**: Color-coded query tokens for parameters (q, m, s), operators, filters, numbers, and quoted search phrases.

### Improved
- **Tri-State Include Filters**: Added tri-state controls (Include, Only, Exclude) for Video, Storyboard, Featured Artists, Converts, and Explicit content.
- **Creator Profile Quick Links**: Beatmapset creator names across cards, modal views, and detail pages link directly to their osu! user profiles.
- **Infinite Scroll & Scroll to Top**: Optional auto-load more toggle with threshold check, plus a smooth floating scroll-to-top action button.
- **Dynamic Beatmap Cover Fallbacks**: Seeded radial gradient rhythm discs for beatmaps without official cover art.

### Fixed
- **Difficulty Dropdown Layout & Truncation**: Fixed text overlapping on lengthy difficulty titles, right-aligned convert badges, and broadened the popover width.

---

## [v1.1.0] - September 2026

### Added
- **Multi-Status Search Support**: Search across multiple statuses simultaneously (e.g., Ranked + Loved + Qualified) with interleaving cursor pagination.
- **Beatmap Detail Modal**: Inspect complete diff parameters (AR, CS, OD, HP, BPM, combo), difficulties categorized by ruleset, and listen to audio previews without leaving search results.

### Improved
- **Client-Side OAuth Credentials**: Save and securely manage personal osu! API client credentials in browser storage.

---

## [v1.0.0] - Initial Release

### Added
- **Advanced Range & Exact Filters**: Fast filtering by stars, approach rate, circle size, drain, overall difficulty, bpm, song length, mania key count, artist, mapper, and genre.
- **Shareable Search URLs**: Full state synchronization with query parameters for effortless sharing and bookmarking.
- **Interactive Query Strip**: Inspect, copy, and manually edit the raw query to rapidly test complex search queries.
