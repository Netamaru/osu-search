"use client";

import { useState } from "react";
import { ApiClientButton } from "@/components/credentials-provider";
import { ChangelogModal } from "@/components/changelog-modal";
import { GithubIcon } from "@/components/icons";
import { SearchBackLink } from "@/components/search-back-link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [changelogOpen, setChangelogOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40">
      <header className="border-b border-line bg-canvas">
        <div className="column flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-10">
          <SearchBackLink restore={false} className="display shrink-0 text-[1.65rem]">
            osu! <span className="text-accent">Search</span>
          </SearchBackLink>
          <div className="flex items-center">
            <ApiClientButton />
            <span className="mx-3.5 h-4 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              className="label hover:text-fg transition-colors"
              onClick={() => setChangelogOpen(true)}
            >
              Changelog
            </button>
            <span className="mx-3.5 h-4 w-px bg-line" aria-hidden="true" />
            <a
              href="https://github.com/Netamaru/osu-search"
              target="_blank"
              rel="noopener noreferrer"
              className="label hover:text-fg transition-colors inline-flex items-center gap-1.5"
              title="GitHub repository"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <span className="mx-3.5 h-4 w-px bg-line" aria-hidden="true" />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {changelogOpen ? <ChangelogModal onClose={() => setChangelogOpen(false)} /> : null}
    </div>
  );
}
