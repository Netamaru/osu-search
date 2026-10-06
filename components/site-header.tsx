"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChangelogModal } from "@/components/changelog-modal";
import { ApiClientButton } from "@/components/credentials-provider";
import { BookmarkIcon, GithubIcon, HeartIcon, OsuLogo } from "@/components/icons";
import { SearchBackLink } from "@/components/search-back-link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, authenticated, logout, openLoginModal } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSearch = pathname === "/";
  const isCollections = pathname?.startsWith("/collections");
  const isFavorites = pathname === "/favorites";

  return (
    <div className="sticky top-0 z-40">
      <header className="border-b border-line bg-canvas">
        <div className="column flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-10">
          <div className="flex items-center gap-6">
            <SearchBackLink restore={false} className="display shrink-0 text-[1.65rem]">
              osu! <span className="text-accent">Search</span>
            </SearchBackLink>

            <nav className="hidden sm:flex items-center gap-1 font-mono text-xs">
              <Link
                href="/"
                className={`rounded-[2px] px-2.5 py-1.5 transition-colors ${
                  isSearch
                    ? "bg-subtle text-fg font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                Search
              </Link>
              <Link
                href="/collections"
                className={`rounded-[2px] px-2.5 py-1.5 transition-colors ${
                  isCollections
                    ? "bg-subtle text-fg font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                Collections
              </Link>
              <Link
                href="/favorites"
                className={`rounded-[2px] px-2.5 py-1.5 transition-colors ${
                  isFavorites
                    ? "bg-subtle text-fg font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                Favorites
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Mobile nav links */}
            <div className="flex sm:hidden items-center gap-1 mr-2 font-mono text-xs">
              <Link
                href="/collections"
                className={`rounded-[2px] p-1.5 transition-colors ${
                  isCollections ? "text-accent" : "text-muted hover:text-fg"
                }`}
                title="Collections"
              >
                <BookmarkIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/favorites"
                className={`rounded-[2px] p-1.5 transition-colors ${
                  isFavorites ? "text-accent" : "text-muted hover:text-fg"
                }`}
                title="Favorites"
              >
                <HeartIcon className="h-4 w-4" />
              </Link>
            </div>

            <ApiClientButton />
            <span className="mx-2.5 h-4 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              className="label hover:text-fg transition-colors"
              onClick={() => setChangelogOpen(true)}
            >
              Changelog
            </button>
            <span className="mx-2.5 h-4 w-px bg-line" aria-hidden="true" />
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
            <span className="mx-2.5 h-4 w-px bg-line" aria-hidden="true" />
            <ThemeToggle />

            <span className="mx-3 h-5 w-px bg-line" aria-hidden="true" />

            {/* Auth / User status - Enlarged, borderless, placed at the far right */}
            {authenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-[4px] px-2 py-1 hover:bg-subtle transition-colors cursor-pointer select-none"
                  aria-expanded={userMenuOpen}
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover shadow-xs"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-mono text-sm font-semibold text-fg max-w-[140px] truncate tracking-tight">
                    {user.username}
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-3.5 w-3.5 text-muted transition-transform duration-150 ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4H4z" />
                  </svg>
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-52 rounded-[4px] border border-line bg-canvas p-1.5 shadow-2xl z-50 font-mono text-xs">
                    <div className="border-b border-line px-3 py-2.5">
                      <p className="font-bold text-sm text-fg truncate">{user.username}</p>
                      <a
                        href={`https://osu.ppy.sh/users/${user.osu_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-accent hover:underline inline-block mt-0.5"
                      >
                        osu! profile ↗
                      </a>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-muted hover:text-fg hover:bg-subtle transition-colors"
                      >
                        <HeartIcon className="h-4 w-4 text-accent" />
                        <span>My Favorites</span>
                      </Link>
                      <Link
                        href="/collections"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-muted hover:text-fg hover:bg-subtle transition-colors"
                      >
                        <BookmarkIcon className="h-4 w-4" />
                        <span>My Collections</span>
                      </Link>
                    </div>
                    <div className="border-t border-line my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left rounded-[3px] px-3 py-2 text-red-400 hover:text-red-300 hover:bg-subtle transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-2 rounded-[4px] bg-pink-500 hover:bg-pink-600 text-white px-3.5 py-1.5 font-mono text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <OsuLogo className="h-4 w-4 shrink-0" />
                <span className="tracking-wide">Log in</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {changelogOpen ? <ChangelogModal onClose={() => setChangelogOpen(false)} /> : null}
    </div>
  );
}
