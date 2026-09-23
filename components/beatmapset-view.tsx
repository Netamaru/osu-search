"use client";

import { useEffect, useState } from "react";
import { SearchBackLink } from "@/components/search-back-link";
import { BeatmapDetail } from "@/components/beatmap-detail";
import { useCredentials } from "@/components/credentials-provider";
import { SetupNotice } from "@/components/setup-notice";
import type { Beatmapset } from "@/lib/osu/types";

type Snapshot =
  | { id: string | null; status: "loading" }
  | { id: string; status: "setup" }
  | { id: string; status: "missing" }
  | { id: string; status: "error"; message: string }
  | { id: string; status: "ok"; beatmapset: Beatmapset };

export function BeatmapsetView({ id }: { id: string }) {
  const { ready, headers, openModal } = useCredentials();
  const [snapshot, setSnapshot] = useState<Snapshot>({ id: null, status: "loading" });
  const current = snapshot.id === id ? snapshot : null;

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    fetch(`/api/beatmapsets/${id}`, { signal: controller.signal, headers })
      .then(async (response) => {
        const data = (await response.json()) as Beatmapset & { error?: string; message?: string };
        if (controller.signal.aborted) return;
        if (data.error === "missing_credentials") {
          setSnapshot({ id, status: "setup" });
          openModal();
          return;
        }
        if (response.status === 404) {
          setSnapshot({ id, status: "missing" });
          return;
        }
        if (!response.ok) {
          setSnapshot({ id, status: "error", message: data.message || "Could not load this beatmap." });
          return;
        }
        setSnapshot({ id, status: "ok", beatmapset: data });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSnapshot({ id, status: "error", message: "Could not load this beatmap." });
      });

    return () => controller.abort();
  }, [id, ready, headers, openModal]);

  if (!current || current.status === "loading") {
    return (
      <div className="column flex flex-col gap-6 px-5 py-10 md:px-10 md:py-14">
        <div className="h-4 w-24 animate-pulse bg-subtle" />
        <div className="card h-72 animate-pulse bg-subtle" />
      </div>
    );
  }

  if (current.status === "setup") {
    return (
      <div className="column px-5 py-14 md:px-10 md:py-16">
        <SetupNotice />
      </div>
    );
  }

  if (current.status === "missing") {
    return (
      <div className="column flex flex-col gap-4 px-5 py-16 md:px-10">
        <p className="label">404</p>
        <h1 className="display text-5xl">
          Nothing here<span className="text-accent">.</span>
        </h1>
        <SearchBackLink className="label hover:text-fg">Back to search</SearchBackLink>
      </div>
    );
  }

  if (current.status === "error") {
    return (
      <div className="column px-5 py-14 md:px-10">
        <p className="border border-line bg-accent-soft px-4 py-3 text-sm">{current.message}</p>
      </div>
    );
  }

  return <BeatmapDetail beatmapset={current.beatmapset} />;
}
