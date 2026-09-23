"use client";

import { useCredentials } from "@/components/credentials-provider";

export function SetupNotice() {
  const { openModal } = useCredentials();

  return (
    <section className="card mx-auto max-w-2xl p-6 sm:p-8">
      <p className="label">Setup</p>
      <h2 className="display mt-3 text-4xl">Add an osu! API client.</h2>
      <p className="mt-4 max-w-xl text-muted">
        Search uses a client id and secret saved in this browser. Create an OAuth application in your osu! account
        settings. The callback URL can be left blank.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-solid h-11 px-5 text-sm font-semibold" onClick={openModal}>
          Add API client
        </button>
        <a className="label hover:text-fg" href="https://osu.ppy.sh/home/account/edit#oauth">
          Open osu! settings
        </a>
      </div>
    </section>
  );
}
