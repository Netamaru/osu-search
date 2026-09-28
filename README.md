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
- **No Account Login Needed**: Connects via OAuth Client Credentials (`public` scope). Beatmap downloads link directly to `osu://dl/{id}` or the official beatmap listings.
- **Integrated Audio Preview**: Listen to beatmap preview tracks directly within the search results.
- **Shareable Filter State**: Search parameters and active filters synchronize automatically to the browser URL for easy bookmarking and sharing.
- **Dark & Light Mode**: Clean, high-contrast brutalist design with seamless theme toggling and persistent preferences.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3 or higher

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

3. **Start the development server:**
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 osu! API Credentials

To perform searches against the osu! API, an OAuth application is required:

1. Create an OAuth application in your [osu! account settings](https://osu.ppy.sh/home/account/edit#oauth). The callback URL can be left blank.
2. You can provide credentials in either of two ways:
   - **In the browser:** Click **API client** in the top navigation bar and enter your Client ID and Client Secret. These are stored locally in `localStorage` on your machine and never sent elsewhere.
   - **On the server (Optional fallback):** Copy `.env.example` to `.env.local` and configure `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`. Never commit `.env.local`.

> **Note:** Credentials entered in the browser always take precedence over server environment fallbacks.

---

## 🛠️ Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Starts the Next.js local development server |
| `bun run build` | Compiles and optimizes the production build |
| `bun run start` | Serves the production build |
| `bun run lint` | Runs ESLint checks |
| `bun test` | Runs the test suite |

---

## 📝 API & Rate Limiting

- API endpoints under `app/api/` proxy requests to `https://osu.ppy.sh/api/v2`.
- Requests per Client ID are paced to comply with osu! API limits (~1 request per second).
- Search query responses are cached in memory for 45 seconds, and ruleset difficulty convert queries for 30 minutes.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
Copyright © 2026 [Netamaru](https://github.com/Netamaru).
