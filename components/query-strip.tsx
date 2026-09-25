"use client";

import { memo, useState } from "react";
import { formatOsuQuery, parseOsuQuery } from "@/lib/osu/query";
import type { SearchFilters } from "@/lib/osu/types";

export function QueryStrip({
  filters,
  onApply,
}: {
  filters: SearchFilters;
  onApply?: (next: SearchFilters) => void;
}) {
  const query = formatOsuQuery(filters);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prevQuery, setPrevQuery] = useState(query);
  const [draftText, setDraftText] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    if (!isEditing) {
      setDraftText(query);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(isEditing ? draftText : query);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function handleStartEdit() {
    setDraftText(query);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftText(query);
    setIsEditing(false);
  }

  function handleApply() {
    if (!onApply) return;
    const parsed = parseOsuQuery(draftText);
    onApply(parsed);
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleApply();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  }

  return (
    <div className="border border-line bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="label">query</p>
          {isEditing ? (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
              (editing)
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" className="label hover:text-fg" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
          {onApply ? (
            <>
              <span className="h-3.5 w-px bg-line" aria-hidden="true" />
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="label hover:text-fg"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <span className="h-3.5 w-px bg-line" aria-hidden="true" />
                  <button
                    type="button"
                    className="btn-solid px-3 py-1 font-mono text-[11px] font-semibold text-white uppercase tracking-wider"
                    onClick={handleApply}
                  >
                    Apply query
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="label font-semibold text-accent hover:text-accent-strong"
                  onClick={handleStartEdit}
                >
                  Edit
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 p-3">
          <textarea
            className="field font-mono text-[13px] leading-6 w-full resize-y min-h-[140px] bg-canvas text-fg p-3 focus:outline-none"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="q=...&#10;m=0&#10;s=ranked"
            autoFocus
          />
          <div className="px-1 text-xs text-muted">
            <span className="font-mono text-[11px] text-faint">
              Tip: Press <kbd className="rounded border border-line bg-subtle px-1 py-0.5 text-[10px]">Ctrl+Enter</kbd> to apply, <kbd className="rounded border border-line bg-subtle px-1 py-0.5 text-[10px]">Esc</kbd> to cancel.
            </span>
          </div>
        </div>
      ) : (
        <HighlightedQuery query={query} />
      )}
    </div>
  );
}

const TOKEN_REGEX = /(\s+)|([a-zA-Z_]+(?:>=|<=|>|<|=)(?:"(?:[^"\\]|\\.)*"|[^\s]+))|("(?:[^"\\]|\\.)*"|[^\s]+)/g;

function renderQueryTokens(val: string) {
  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(val)) !== null) {
    const keyId = idx++;
    const [, whitespace, filterToken, generalToken] = match;

    if (whitespace) {
      elements.push(<span key={keyId}>{whitespace}</span>);
      continue;
    }

    if (filterToken) {
      const opMatch = filterToken.match(/^([a-zA-Z_]+)(>=|<=|>|<|=)(.*)$/);
      if (opMatch) {
        const [, fKey, op, fVal] = opMatch;
        const isNumOrDate = /^-?\d+(\.\d+)?$/.test(fVal) || /^\d{4}-\d{2}-\d{2}$/.test(fVal);
        const valClass = isNumOrDate
          ? "font-mono font-medium text-amber-600 dark:text-amber-400"
          : "font-medium text-emerald-600 dark:text-emerald-400";

        elements.push(
          <span key={keyId} className="inline">
            <span className="font-medium text-purple-600 dark:text-purple-400">{fKey}</span>
            <span className="text-faint">{op}</span>
            <span className={valClass}>{fVal}</span>
          </span>,
        );
        continue;
      }
    }

    if (generalToken) {
      const isQuoted = generalToken.startsWith('"');
      elements.push(
        <span
          key={keyId}
          className={isQuoted ? "text-emerald-600 dark:text-emerald-400" : "text-fg"}
        >
          {generalToken}
        </span>,
      );
    }
  }

  return <>{elements}</>;
}

function renderParamValue(key: string, val: string) {
  const lowerKey = key.toLowerCase();

  if (lowerKey === "q") {
    return renderQueryTokens(val);
  }

  if (lowerKey === "s" || lowerKey === "status") {
    return <span className="font-medium text-pink-600 dark:text-pink-400">{val}</span>;
  }

  if (
    lowerKey === "m" ||
    lowerKey === "mode" ||
    lowerKey === "g" ||
    lowerKey === "genre" ||
    lowerKey === "l" ||
    lowerKey === "language"
  ) {
    return <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{val}</span>;
  }

  if (lowerKey === "sort") {
    return <span className="font-medium text-indigo-600 dark:text-indigo-400">{val}</span>;
  }

  if (
    lowerKey === "c" ||
    lowerKey === "e" ||
    lowerKey === "video" ||
    lowerKey === "storyboard" ||
    lowerKey === "converts" ||
    lowerKey === "featured_artists" ||
    lowerKey === "featured_artist" ||
    lowerKey === "featuredartist"
  ) {
    const isExclude = val.toLowerCase() === "exclude" || val === "0" || val.toLowerCase() === "false";
    const isOnly = val.toLowerCase() === "only" || val === "1" || val.toLowerCase() === "true";
    const colorClass = isExclude
      ? "font-medium text-rose-600 dark:text-rose-400"
      : isOnly
      ? "font-medium text-teal-600 dark:text-teal-400"
      : "font-medium text-muted";

    const parts = val.split(".");
    return (
      <span className={colorClass}>
        {parts.map((part, idx) => (
          <span key={idx}>
            {idx > 0 ? <span className="text-faint">.</span> : null}
            <span>{part}</span>
          </span>
        ))}
      </span>
    );
  }

  if (lowerKey === "nsfw") {
    const isExclude = val.toLowerCase() === "exclude" || val === "false" || val === "0";
    const isOnly = val.toLowerCase() === "only";
    const colorClass = isOnly
      ? "font-medium text-rose-600 dark:text-rose-400"
      : isExclude
      ? "font-medium text-faint"
      : "font-medium text-amber-600 dark:text-amber-400";
    return <span className={colorClass}>{val}</span>;
  }

  return <span className="text-fg-muted dark:text-muted">{val}</span>;
}

function renderLine(line: string) {
  if (!line) return "\u00A0";

  const eqIndex = line.indexOf("=");
  if (eqIndex === -1) {
    return <span className="text-fg">{line}</span>;
  }

  const key = line.slice(0, eqIndex);
  const val = line.slice(eqIndex + 1);

  return (
    <>
      <span className="font-semibold text-sky-600 dark:text-sky-400">{key}</span>
      <span className="text-faint">=</span>
      {renderParamValue(key, val)}
    </>
  );
}

const HighlightedQuery = memo(function HighlightedQuery({ query }: { query: string }) {
  const lines = query.split("\n");
  return (
    <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-fg">
      {lines.map((line, index) => (
        <span key={index} className="block min-h-[1.5em]">
          {renderLine(line)}
        </span>
      ))}
    </pre>
  );
});
