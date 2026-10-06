<div align="center">

# osu! Search

An advanced, real-time beatmap search engine built with **Next.js 16**, **React 19**, and the official **[osu!api v2](https://osu.ppy.sh/docs/index.html)**.

[![Build & Deploy](https://github.com/Netamaru/osu-search/actions/workflows/deploy.yml/badge.svg)](https://github.com/Netamaru/osu-search/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-osusearch.netamaru.id-ff1f8f?style=flat-square)](https://osusearch.netamaru.id/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-black?style=flat-square&logo=bun)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<br />

<img src="./public/preview.png" alt="osu! Search Dark Theme Preview" width="100%" />

<br />
<br />

[**🌐 Explore Live Demo**](https://osusearch.netamaru.id/) · [**Report Bug**](https://github.com/Netamaru/osu-search/issues) · [**Request Feature**](https://github.com/Netamaru/osu-search/issues)

</div>

---

## ✨ Features

- **Advanced Filtering**: Filter by ruleset (*osu!*, *taiko*, *catch*, *mania*), status (*Ranked*, *Qualified*, *Loved*, *Pending*, *WIP*, *Graveyard*), difficulty stars, AR, CS, OD, HP, BPM, song length, mapper, source, tags, and more.
- **Deep Query Syntax**: Full interactive query strip supporting complex range expressions, exact matches, exclusions, and sorting.
- **Login with osu! Account**: Secure OAuth 2.0 authorization code login directly with your official osu! account.
- **Custom Collections & Shareable Links**: Organize beatmaps into collections (e.g. stream training, jump practice, anime OSTs) and share them with a link (`/collections/:id`).
- **Favorite Beatmaps**: Save your favorite beatmapsets with 1-click and access them anytime on `/favorites`.
- **Offline / Official-Deleted Beatmap Preservation**: When beatmaps are favorited or saved to collections, snapshots of their complete metadata and difficulties are cached in PostgreSQL. If a map is later removed or DMCA'd from official osu!, it remains fully preserved in your collections and favorites with an **Archived Snapshot** badge.
- **Integrated Audio Preview**: Listen to beatmap preview tracks directly within the search results.
- **Shareable Filter State**: Search parameters and active filters synchronize automatically to the browser URL for easy bookmarking and sharing.
- **Dark & Light Mode**: Clean, high-contrast brutalist design with seamless theme toggling and persistent preferences.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3 or higher
- [PostgreSQL](https://www.postgresql.org/) (for user accounts, collections, and favorites)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Netamaru/osu-search.git
   cd osu-search
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Configure your variables:
   - **osu! OAuth App (for user login)**:
     Register an application at [osu! account settings](https://osu.ppy.sh/home/account/edit#oauth):
     - Set **Application Callback URL** to `http://localhost:3000/api/auth/callback/osu` (or your domain).
     - Set `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` in `.env.local`.
   - **PostgreSQL Database**:
     Provide your PostgreSQL connection string in `DATABASE_URL`:
     ```env
     DATABASE_URL=postgres://user:password@localhost:5432/osu_search
     ```
   - Initialize tables automatically by running:
     ```bash
     bun run db:init
     ```
     *(The database schema is also auto-migrated on first connection if tables do not exist yet).*

4. **Start the development server:**
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 osu! API Credentials

To perform searches against the osu! API, users configure their own client credentials in the browser:

1. Create an OAuth application in your [osu! account settings](https://osu.ppy.sh/home/account/edit#oauth). The callback URL can be left blank.
2. In the browser, click **API client** in the top navigation bar and enter your Client ID and Client Secret. These are stored locally in `localStorage` on your machine and sent directly with search requests.

> **Note:** `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` in `.env.local` on the server are reserved exclusively for the osu! OAuth login flow and are not used for public searches.

---

## 🛠️ Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Starts the Next.js local development server |
| `bun run build` | Compiles and optimizes the production build |
| `bun run start` | Serves the production build |
| `bun run lint` | Runs ESLint checks |
| `bun test` | Runs the test suite |
| `bun run db:init` | Initialize PostgreSQL schema and tables |

---

## 📝 API & Rate Limiting

- API endpoints under `app/api/` proxy requests to `https://osu.ppy.sh/api/v2`.
- Requests per Client ID are paced to comply with osu! API limits (~1 request per second).
- Search query responses are cached in memory for 45 seconds, and ruleset difficulty convert queries for 30 minutes.

### Endpoints
- `/api/auth/login` – Initiates osu! OAuth2 authorization flow.
- `/api/auth/callback/osu` – Handles OAuth code exchange and session establishment.
- `/api/auth/me` – Returns authenticated user session and status.
- `/api/auth/logout` – Destroys session.
- `/api/favorites` – Manage user's favorite beatmaps.
- `/api/favorites/ids` – Fast ID lookup for favorited items.
- `/api/collections` – List and create custom collections.
- `/api/collections/[id]` – View (public/shared), update, or delete a collection.
- `/api/collections/[id]/items` – Add or remove beatmaps from a collection.
- `/api/beatmapsets/[id]` – Returns beatmapset details with automatic PostgreSQL cache fallback for deleted maps.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
Copyright © 2026 [Netamaru](https://github.com/Netamaru).
