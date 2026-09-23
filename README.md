# osu! Search

Advanced beatmap search on top of the official [osu!api v2](https://osu.ppy.sh/docs/index.html). Filter by mode, status, stars, AR, CS, OD, HP, BPM, length, mapper, and the rest of the osu! search query, then open a set on osu.ppy.sh or send it to osu!direct.

There is no user login. The app talks to osu! with an OAuth client-credentials token (`public` scope). Beatmap downloads stay on osu!: the site links to the beatmap page and to `osu://dl/{id}`. It does not proxy `.osz` files.

## Setup

Requires [Bun](https://bun.sh) 1.3.

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Search needs an OAuth application from [osu! account settings](https://osu.ppy.sh/home/account/edit#oauth). The callback URL can be left blank.

- In the browser, use **API client** and save the client id and secret. They stay in `localStorage` on that browser and are sent only to this app’s API routes.
- Or copy `.env.example` to `.env.local` and set `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`. That pair is a server fallback used when the request has no browser credentials. Do not commit `.env.local`.

A client id and secret in the request always win over the env fallback. An invalid pair is rejected and is not replaced with the env values.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun test` | Unit tests |

## What you can search

Mode (osu!, taiko, catch, mania), status, and sort sit on the main filter bar. Advanced filters add genre, language, star rating and other difficulty ranges, BPM, length, mania key count, artist, title, mapper, source, tags, ranked and updated dates, plus featured artist, video, storyboard, explicit, and converts.

The current filters are written into the page URL. Opening a beatmap and coming back restores that query and the scroll position.

A beatmap page shows the cover, preview audio, and each ruleset’s difficulties. Search results do not include converts; those are loaded from the beatmapset endpoint and cached separately.

## API notes

Routes under `app/api` call `https://osu.ppy.sh/api/v2` with the resolved client. Each client id is paced to about one request per second. Search responses are cached in memory for 45 seconds, and convert lookups for 30 minutes. The osu! rate limit is per token, so rotating proxies does not raise it.
