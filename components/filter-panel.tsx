"use client";

import { useState } from "react";
import { GENRES, LANGUAGES, MODES, SORTS, STATUSES } from "@/lib/osu/constants";
import { defaultFilters, hasAdvancedFilters } from "@/lib/osu/filters";
import type { DateOp, SearchFilters } from "@/lib/osu/types";

type When = "now" | "soon";

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
  onPatch: (partial: Partial<SearchFilters>, when: When) => void;
  onReplace: (next: SearchFilters) => void;
}) {
  const [open, setOpen] = useState(() => hasAdvancedFilters(value));
  const advanced = hasAdvancedFilters(value);

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup label="Mode">
        {MODES.map((mode) => (
          <button
            key={mode.id || "any"}
            type="button"
            className="pill"
            aria-pressed={value.mode === mode.id}
            onClick={() => onPatch({ mode: mode.id }, "now")}
          >
            {mode.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Status">
        {STATUSES.map((status) => (
          <button
            key={status.id}
            type="button"
            className="pill"
            aria-pressed={value.status === status.id}
            onClick={() => onPatch({ status: status.id }, "now")}
          >
            {status.label}
          </button>
        ))}
      </FilterGroup>

      <label className="flex max-w-xs flex-col gap-2">
        <span className="label">Sort</span>
        <select className="field" value={value.sort} onChange={(event) => onPatch({ sort: event.target.value }, "now")}>
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
          onClick={() => setOpen((current) => !current)}
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
                onClick={() =>
                  onReplace({
                    ...defaultFilters(),
                    q: value.q,
                    mode: value.mode,
                    status: value.status,
                    sort: value.sort,
                  })
                }
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
              <select className="field" value={value.genre} onChange={(event) => onPatch({ genre: event.target.value }, "now")}>
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
                onChange={(event) => onPatch({ language: event.target.value }, "now")}
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
              onOp={(rankedOp) => onPatch({ rankedOp }, "now")}
            />
            <DateField
              label="Updated"
              value={value.updated}
              op={value.updatedOp}
              onValue={(updated) => onPatch({ updated }, "soon")}
              onOp={(updatedOp) => onPatch({ updatedOp }, "now")}
            />
          </div>

          <FilterGroup label="Include">
            <Toggle pressed={value.video} onClick={() => onPatch({ video: !value.video }, "now")}>
              Video
            </Toggle>
            <Toggle pressed={value.storyboard} onClick={() => onPatch({ storyboard: !value.storyboard }, "now")}>
              Storyboard
            </Toggle>
            <Toggle
              pressed={value.featuredArtist}
              onClick={() => onPatch({ featuredArtist: !value.featuredArtist }, "now")}
            >
              Featured artist
            </Toggle>
            <Toggle pressed={value.converts} onClick={() => onPatch({ converts: !value.converts }, "now")}>
              Converts
            </Toggle>
            <Toggle pressed={value.nsfw} onClick={() => onPatch({ nsfw: !value.nsfw }, "now")}>
              Explicit
            </Toggle>
          </FilterGroup>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="pill" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
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
