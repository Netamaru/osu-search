"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { clearCredentials, saveCredentials } from "@/lib/browser-credentials";
import { parseClientCredentials, type ClientCredentials } from "@/lib/credentials";

export function CredentialsModal({
  credentials,
  onClose,
}: {
  credentials: ClientCredentials | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const idRef = useRef<HTMLInputElement>(null);
  const [clientId, setClientId] = useState(credentials?.clientId ?? "");
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    idRef.current?.focus();
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

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseClientCredentials(clientId, clientSecret);
    if (!parsed) {
      setError("Use a numeric client id and the client secret from your osu! OAuth application.");
      return;
    }
    saveCredentials(parsed);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-5 py-16 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[rgb(12_12_12/0.55)]"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card relative w-full max-w-lg p-6 sm:p-8"
        onSubmit={submit}
      >
        <p className="label">osu!api</p>
        <h2 id={titleId} className="display mt-3 text-4xl">
          API client<span className="text-accent">.</span>
        </h2>
        <p className="mt-4 text-sm text-muted">
          Create an OAuth application in your osu! settings. The callback URL can be left blank. The id and secret are
          saved in this browser and sent with searches so this server can request a public token.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="label">Client ID</span>
            <input
              ref={idRef}
              className="field font-mono"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">Client secret</span>
            <span className="flex gap-2">
              <input
                className="field font-mono"
                type={showSecret ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                value={clientSecret}
                onChange={(event) => setClientSecret(event.target.value)}
              />
              <button
                type="button"
                className="btn-ghost h-10 shrink-0 px-3 text-xs font-medium"
                onClick={() => setShowSecret((current) => !current)}
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </span>
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-fg">{error}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-solid h-11 px-5 text-sm font-semibold">
            Save
          </button>
          {credentials ? (
            <button
              type="button"
              className="btn-ghost h-11 px-4 text-sm font-medium"
              onClick={() => {
                clearCredentials();
                onClose();
              }}
            >
              Remove
            </button>
          ) : null}
          <a className="label hover:text-fg" href="https://osu.ppy.sh/home/account/edit#oauth">
            Open osu! settings
          </a>
        </div>
      </form>
    </div>
  );
}
