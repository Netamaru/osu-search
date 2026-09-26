"use client";

import { useEffect, useState } from "react";
import { ModeSvg } from "@/components/mode-icon";
import { statusIcon } from "@/lib/format";
import { GENRES, LANGUAGES, MODES, SORTS, STATUSES } from "@/lib/osu/constants";
import { defaultFilters, hasAdvancedFilters, toggleStatus } from "@/lib/osu/filters";
import type { DateOp, Ruleset, SearchFilters, SearchStatus, TriStateFilter } from "@/lib/osu/types";

type When = "now" | "soon";

const ADVANCED_OPEN_KEY = "osu_advanced_filters_open";

const MODE_RULESETS: Record<string, Ruleset> = {
  "0": "osu",
  "1": "taiko",
  "2": "fruits",
  "3": "mania",
};

function AllModesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="0.75" />
      <rect x="9" y="2" width="5" height="5" rx="0.75" />
      <rect x="2" y="9" width="5" height="5" rx="0.75" />
      <rect x="9" y="9" width="5" height="5" rx="0.75" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 2a1 1 0 0 0-1 1v1.5C3 5.88 4.12 7 5.5 7h.05A4.5 4.5 0 0 0 7.25 9.7V12H5.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5H8.75V9.7A4.5 4.5 0 0 0 10.45 7h.05C11.88 7 13 5.88 13 4.5V3a1 1 0 0 0-1-1H4Zm0 1.5h1.5V5.5C4.67 5.5 4 4.83 4 4V3.5Zm6.5 2V3.5H12V4c0 .83-.67 1.5-1.5 1.5Z" />
    </svg>
  );
}

function AsteriskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 2a.75.75 0 0 1 .75.75v3.44l2.98-1.72a.75.75 0 1 1 .75 1.3L9.5 7.49l2.98 1.72a.75.75 0 1 1-.75 1.3L8.75 8.79v3.46a.75.75 0 0 1-1.5 0V8.79L4.27 10.51a.75.75 0 0 1-.75-1.3l2.98-1.72L3.52 5.77a.75.75 0 0 1 .75-1.3l2.98 1.72V2.75A.75.75 0 0 1 8 2Z" />
    </svg>
  );
}

function ModeFilterIcon({ modeId }: { modeId: string }) {
  if (!modeId) {
    return <AllModesIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />;
  }
  const ruleset = MODE_RULESETS[modeId];
  if (!ruleset) return null;
  return <ModeSvg mode={ruleset} className="h-3.5 w-3.5 shrink-0" />;
}

function StatusFilterIcon({ status }: { status: SearchStatus }) {
  if (status === "leaderboard") {
    return <TrophyIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
  }
  if (status === "any") {
    return <AsteriskIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={statusIcon(status)}
      alt=""
      width={14}
      height={14}
      className="h-3.5 w-3.5 shrink-0 [image-rendering:pixelated]"
    />
  );
}

const RANGES: { key: string; min: keyof SearchFilters; max: keyof SearchFilters; hint?: string }[] = [
  { key: "Stars", min: "starsMin", max: "starsMax" },
  { key: "AR", min: "arMin", max: "arMax" },
  { key: "CS", min: "csMin", max: "csMax" },
  { key: "OD", min: "odMin", max: "odMax" },
  { key: "HP", min: "hpMin", max: "hpMax" },
  { key: "BPM", min: "bpmMin", max: "bpmMax" },
  { key: "Length", min: "lengthMin", max: "lengthMax", hint: "seconds or m:ss" },
  { key: "Keys", min: "keysMin", max: "keysMax", hint: "mania" },
];

const TEXTS: { key: keyof SearchFilters; label: string; placeholder: string }[] = [
  { key: "artist", label: "Artist", placeholder: "artist=" },
  { key: "title", label: "Title", placeholder: "title=" },
  { key: "creator", label: "Mapper", placeholder: "creator=" },
  { key: "difficulty", label: "Difficulty", placeholder: "difficulty=" },
  { key: "source", label: "Source", placeholder: "source=" },
  { key: "tag", label: "Tag", placeholder: "tag=" },
];

export function FilterPanel({
  value,
  onPatch,
  onReplace,
}: {
  value: SearchFilters;
  onPatch: (partial: Partial<SearchFilters>, when?: When) => void;
  onReplace: (next: SearchFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const advanced = hasAdvancedFilters(value);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADVANCED_OPEN_KEY);
      if (saved !== null) {
        setOpen(saved === "true");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      try {
        localStorage.setItem(ADVANCED_OPEN_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup label="Mode">
        {MODES.map((mode) => (
          <button
            key={mode.id || "any"}
            type="button"
            className="pill"
            aria-pressed={value.mode === mode.id}
            onClick={() => onPatch({ mode: mode.id }, "soon")}
          >
            <ModeFilterIcon modeId={mode.id} />
            <span>{mode.label}</span>
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Status">
        {STATUSES.map((status) => (
          <button
            key={status.id}
            type="button"
            className="pill"
            aria-pressed={value.status.includes(status.id)}
            onClick={() => onPatch({ status: toggleStatus(value.status, status.id) }, "soon")}
          >
            <StatusFilterIcon status={status.id} />
            <span>{status.label}</span>
          </button>
        ))}
      </FilterGroup>

      <label className="flex max-w-xs flex-col gap-2">
        <span className="label">Sort</span>
        <select className="field" value={value.sort} onChange={(event) => onPatch({ sort: event.target.value }, "soon")}>
          {SORTS.map((sort) => (
            <option key={sort.id || "default"} value={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button
          type="button"
          className="btn-ghost h-10 px-4 text-sm font-medium"
          aria-expanded={open}
          onClick={toggleOpen}
        >
          {open ? "Hide advanced filters" : "Advanced filters"}
          {advanced ? " · on" : ""}
        </button>
      </div>

      {open ? (
        <div className="flex flex-col gap-6 border border-line bg-subtle p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="label">Ranges and exact fields</p>
            {advanced ? (
              <button
                type="button"
                className="label hover:text-fg"
                onClick={() => {
                  try {
                    localStorage.setItem(ADVANCED_OPEN_KEY, "false");
                  } catch {
                    // Ignore storage errors
                  }
                  setOpen(false);
                  onReplace({
                    ...defaultFilters(),
                    q: value.q,
                    mode: value.mode,
                    status: value.status,
                    sort: value.sort,
                  });
                }}
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RANGES.map((range) => (
              <fieldset key={range.key} className="flex flex-col gap-2">
                <legend className="label">
                  {range.key}
                  {range.hint ? <span className="ml-2 normal-case tracking-normal">{range.hint}</span> : null}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="field"
                    inputMode="decimal"
                    placeholder="min"
                    aria-label={`${range.key} minimum`}
                    value={String(value[range.min])}
                    onChange={(event) => onPatch({ [range.min]: event.target.value }, "soon")}
                  />
                  <input
                    className="field"
                    inputMode="decimal"
                    placeholder="max"
                    aria-label={`${range.key} maximum`}
                    value={String(value[range.max])}
                    onChange={(event) => onPatch({ [range.max]: event.target.value }, "soon")}
                  />
                </div>
              </fieldset>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEXTS.map((field) => (
              <label key={field.key} className="flex flex-col gap-2">
                <span className="label">{field.label}</span>
                <input
                  className="field"
                  placeholder={field.placeholder}
                  value={String(value[field.key])}
                  onChange={(event) => onPatch({ [field.key]: event.target.value }, "soon")}
                />
              </label>
            ))}
            <label className="flex flex-col gap-2">
              <span className="label">Genre</span>
              <select className="field" value={value.genre} onChange={(event) => onPatch({ genre: event.target.value }, "soon")}>
                <option value="">Any</option>
                {GENRES.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="label">Language</span>
              <select
                className="field"
                value={value.language}
                onChange={(event) => onPatch({ language: event.target.value }, "soon")}
              >
                <option value="">Any</option>
                {LANGUAGES.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              label="Ranked"
              value={value.ranked}
              op={value.rankedOp}
              onValue={(ranked) => onPatch({ ranked }, "soon")}
              onOp={(rankedOp) => onPatch({ rankedOp }, "soon")}
            />
            <DateField
              label="Updated"
              value={value.updated}
              op={value.updatedOp}
              onValue={(updated) => onPatch({ updated }, "soon")}
              onOp={(updatedOp) => onPatch({ updatedOp }, "soon")}
            />
          </div>

          <FilterGroup label="Include">
            <TriStateSegmented
              label="Video"
              value={value.video}
              onChange={(next) => onPatch({ video: next }, "soon")}
            />
            <TriStateSegmented
              label="Storyboard"
              value={value.storyboard}
              onChange={(next) => onPatch({ storyboard: next }, "soon")}
            />
            <TriStateSegmented
              label="Featured artist"
              value={value.featuredArtist}
              onChange={(next) => onPatch({ featuredArtist: next }, "soon")}
            />
            <TriStateSegmented
              label="Converts"
              value={value.converts}
              onChange={(next) => onPatch({ converts: next }, "soon")}
            />
            <TriStateSegmented
              label="Explicit"
              value={value.nsfw}
              onChange={(next) => onPatch({ nsfw: next }, "soon")}
            />
          </FilterGroup>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

function TriStateSegmented({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TriStateFilter;
  onChange: (next: TriStateFilter) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-[4px] border border-line bg-canvas px-3 py-1.5 shadow-xs">
      <span className="font-mono text-xs font-semibold text-fg">{label}</span>
      <div className="inline-flex rounded-[3px] border border-line bg-subtle p-0.5 font-mono text-[11px]">
        <button
          type="button"
          className={`cursor-pointer rounded-[2px] px-2.5 py-0.5 transition-all ${
            value === "any"
              ? "bg-fg text-canvas font-semibold shadow-xs"
              : "text-muted hover:text-fg"
          }`}
          onClick={() => onChange("any")}
          title={`${label}: Include both (with and without)`}
        >
          Include
        </button>
        <button
          type="button"
          className={`cursor-pointer rounded-[2px] px-2.5 py-0.5 transition-all ${
            value === "only"
              ? "bg-fg text-canvas font-semibold shadow-xs"
              : "text-muted hover:text-fg"
          }`}
          onClick={() => onChange("only")}
          title={`${label}: Only with this feature`}
        >
          Only
        </button>
        <button
          type="button"
          className={`cursor-pointer rounded-[2px] px-2.5 py-0.5 transition-all ${
            value === "exclude"
              ? "bg-accent text-white font-semibold shadow-xs"
              : "text-muted hover:text-fg"
          }`}
          onClick={() => onChange("exclude")}
          title={`${label}: Exclude (without this feature)`}
        >
          Exclude
        </button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  op,
  onValue,
  onOp,
}: {
  label: string;
  value: string;
  op: DateOp;
  onValue: (value: string) => void;
  onOp: (op: DateOp) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-[5.5rem_1fr] gap-2">
        <select className="field" aria-label={`${label} comparison`} value={op} onChange={(event) => onOp(event.target.value as DateOp)}>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
          <option value="=">=</option>
        </select>
        <input className="field" type="date" aria-label={label} value={value} onChange={(event) => onValue(event.target.value)} />
      </div>
    </fieldset>
  );
}
