"use client";

import { useEffect } from "react";
import { CloseIcon, OsuLogo } from "@/components/icons";
import { useAuth } from "./auth-provider";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const { login, serverOsuConfigured, dbConfigured, loading } = useAuth();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-[4px] border border-line bg-canvas p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <OsuLogo className="h-8 w-8 shrink-0 drop-shadow-sm" />
            <div>
              <h2 className="display text-2xl font-bold tracking-tight">
                Log in with <span className="text-accent">osu!</span>
              </h2>
              <p className="font-mono text-xs text-muted mt-0.5">OAuth 2.0 Account Sign-in</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-[2px] p-1.5 text-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-muted">
          <p>
            Signing in with your official osu! account lets you:
          </p>
          <ul className="space-y-2 font-mono text-xs text-fg">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Favorite beatmaps and sync them across devices
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Organize custom collections (jump training, streams, favorite maps)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Share collection links with anyone
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Keep archived beatmaps saved even if removed from osu!
            </li>
          </ul>

          {!loading && !serverOsuConfigured ? (
            <div className="rounded-[3px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-1 font-mono">
              <p className="font-semibold text-amber-200">Server OAuth Setup Notice</p>
              <p className="text-[11px] leading-relaxed">
                <code>OSU_CLIENT_ID</code> and <code>OSU_CLIENT_SECRET</code> are not configured in <code>.env.local</code>.
                To enable login, register an OAuth application at{" "}
                <a
                  href="https://osu.ppy.sh/home/account/edit#oauth"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-amber-100 hover:text-white"
                >
                  osu! account settings
                </a>{" "}
                with callback URL <code>/api/auth/callback/osu</code>.
              </p>
            </div>
          ) : null}

          {!loading && !dbConfigured ? (
            <div className="rounded-[3px] border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 space-y-1 font-mono">
              <p className="font-semibold text-blue-200">PostgreSQL Database Notice</p>
              <p className="text-[11px] leading-relaxed">
                <code>DATABASE_URL</code> is not configured in <code>.env.local</code>.
                Add your pgsql connection string to save favorites and collections.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-[3px] border border-line bg-subtle px-4 py-2 text-sm font-medium text-fg hover:bg-canvas hover:border-line-strong transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!serverOsuConfigured}
            onClick={() => login()}
            className="inline-flex items-center justify-center gap-2.5 rounded-[3px] bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <OsuLogo className="h-5 w-5 shrink-0" />
            <span className="text-white font-bold tracking-wide">Authorize with osu!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
