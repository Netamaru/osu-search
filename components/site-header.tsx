"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChangelogModal } from "@/components/changelog-modal";
import { ApiClientButton, useCredentials } from "@/components/credentials-provider";
import {
  BookmarkIcon,
  CloseIcon,
  GithubIcon,
  HeartIcon,
  MenuIcon,
  OsuLogo,
  SearchIcon,
} from "@/components/icons";
import { SearchBackLink } from "@/components/search-back-link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, authenticated, logout, openLoginModal } = useAuth();
  const { credentials, openModal: openCredentialsModal } = useCredentials();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isSearch = pathname === "/";
  const isCollections = pathname?.startsWith("/collections");
  const isFavorites = pathname === "/favorites";

  return (
    <div className="sticky top-0 z-40">
      <header className="border-b border-line bg-canvas">
        <div className="column flex h-14 md:h-16 items-center justify-between px-4 sm:px-6 md:px-10">
          {/* Left section: Logo + Desktop Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <SearchBackLink restore={false} className="display shrink-0 text-xl sm:text-2xl md:text-[1.65rem]">
              osu! <span className="text-accent">Search</span>
            </SearchBackLink>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
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

          {/* Right section: Desktop Actions */}
          <div className="hidden md:flex items-center">
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

            {/* Auth / User status */}
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

          {/* Right section: Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            {authenticated && user ? (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-full ring-1 ring-line hover:ring-accent transition-all cursor-pointer"
                title={user.username}
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-pink-500 hover:bg-pink-600 text-white px-2.5 py-1 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                <OsuLogo className="h-3.5 w-3.5 shrink-0" />
                <span>Log in</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-line text-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="h-4 w-4" />
              ) : (
                <MenuIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen ? (
          <div className="md:hidden border-t border-line bg-canvas px-4 py-4 sm:px-6 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            {/* Primary Navigation Links */}
            <div className="flex flex-col gap-1 font-mono text-xs">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 transition-colors ${
                  isSearch
                    ? "bg-subtle text-accent font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="text-sm">Search Beatmaps</span>
              </Link>
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 transition-colors ${
                  isCollections
                    ? "bg-subtle text-accent font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                <BookmarkIcon className="h-4 w-4 shrink-0" />
                <span className="text-sm">My Collections</span>
              </Link>
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 transition-colors ${
                  isFavorites
                    ? "bg-subtle text-accent font-semibold"
                    : "text-muted hover:text-fg hover:bg-subtle/50"
                }`}
              >
                <HeartIcon className="h-4 w-4 shrink-0" />
                <span className="text-sm">Favorites</span>
              </Link>
            </div>

            <div className="my-3 border-t border-line" />

            {/* Utility buttons */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCredentialsModal();
                }}
                className="flex items-center gap-2 rounded-[3px] border border-line bg-subtle/30 px-3 py-2 text-left text-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${credentials ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                <span className="truncate">{credentials ? "API Client" : "Add API Client"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setChangelogOpen(true);
                }}
                className="flex items-center gap-2 rounded-[3px] border border-line bg-subtle/30 px-3 py-2 text-left text-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                <span>Changelog</span>
              </button>
            </div>

            <div className="mt-2 font-mono text-xs">
              <a
                href="https://github.com/Netamaru/osu-search"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-[3px] border border-line bg-subtle/30 px-3 py-2 text-muted hover:text-fg hover:bg-subtle transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4 shrink-0" />
                  <span>GitHub Repository</span>
                </span>
                <span className="text-faint">↗</span>
              </a>
            </div>

            {/* User status in mobile drawer */}
            <div className="mt-3 border-t border-line pt-3">
              {authenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-[3px] bg-subtle/50 p-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover shrink-0 shadow-xs"
                        />
                      ) : (
                        <span className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent font-bold shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-fg truncate">{user.username}</p>
                        <a
                          href={`https://osu.ppy.sh/users/${user.osu_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-accent hover:underline block truncate"
                        >
                          osu! profile ↗
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="rounded-[3px] px-2.5 py-1 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-[4px] bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 font-mono text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <OsuLogo className="h-4 w-4 shrink-0" />
                  <span>Log in with osu! account</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 top-14 bg-black/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {changelogOpen ? <ChangelogModal onClose={() => setChangelogOpen(false)} /> : null}
    </div>
  );
}
