"use client";

import { useState } from "react";
import { formatOsuQuery } from "@/lib/osu/query";
import type { SearchFilters } from "@/lib/osu/types";

export function QueryStrip({ filters }: { filters: SearchFilters }) {
  const query = formatOsuQuery(filters);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border border-line bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <p className="label">query</p>
        <button type="button" className="label hover:text-fg" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-fg">{query}</pre>
    </div>
  );
}
