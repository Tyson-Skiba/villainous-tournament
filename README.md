# Villainous Tournament

A mobile-first React + TypeScript app for randomly assigning Disney Villainous characters to players across multiple rounds.

## Stack

- Node.js
- React
- TypeScript
- Vite
- lucide-react icons
- Browser `localStorage`
- Plain CSS (no UI framework required)

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Local image assets

The app first looks for an image in `public/assets/`, then falls back to the remote URL in `data/assets.json`.

To download the supplied remote images:

```bash
npm run download-assets
```

Add more image entries to `data/assets.json` and rerun the command. The downloader creates deterministic local filenames.

## Data

`data/sets.json` contains the set/villain catalogue. It deliberately treats a villain appearing in two owned sets as two copies. For example, owning both **The Worst Takes It All** and **Introduction to Evil** gives two Captain Hook copies, two Maleficent copies, two Prince John copies and two Ursula copies.

The set catalogue through Treacherous Tides follows the Disney Villainous Wiki's current villain list. The source notes that Introduction to Evil contains revamped versions of four characters from The Worst Takes It All.

## localStorage

The main blob is stored under:

`villainous-tournament`

It contains:

- owned set IDs
- saved player names
- default round count
- historical round stats
- theme

## Game rules implemented

- Screen 1 is shown when no owned-set configuration exists.
- 2-column mobile set grid with selected checkmark and faded unselected cards.
- Screen 2 starts with Player 1 and Player 2, plus add/remove.
- Character capacity is the sum of all villain entries across owned sets, so duplicates count.
- Characters are randomly assigned each round.
- A character cannot be assigned more times in one round than the number of owned copies.
- The same character pool is rebuilt for each round.
- Each player has one refresh for the whole game.
- Refresh excludes the player's current character and respects round capacity.
- Finish places support ties naturally, including 1, 2, 2, 4.
- Leaderboard uses points: first gets N points, second N-1, etc. Wins are first-place finishes.
- Historical stats persist across games.
- Stats can be viewed by player or character.
- Settings and stats are accessible from the top navigation.
- Light/dark mode persists.

## Free hosting

The project is a static Vite build and can be hosted on Netlify, Cloudflare Pages, GitHub Pages, or similar static hosting.

For Netlify, the build settings are:

- Build command: `npm run build`
- Publish directory: `dist`

No server/database is required for the current design because the game state and statistics live in each browser's localStorage.

## Important image/licensing note

The included remote image URLs are from the Disney Villainous Wiki/Fandom and are only an example data source. Before publishing the site publicly, verify that you have the right to redistribute/cache each image. The app itself is not affiliated with Disney or Ravensburger.


## Downloading local images

The asset downloader now uses `curl` first because Fandom's CDN can reject Node's
default HTTP client. It sends a browser-style User-Agent and Fandom Referer, follows
redirects, retries transient failures, and falls back to Node `fetch`.

Run:

```bash
npm run download-assets
```

If your machine does not have `curl`, the script automatically tries `fetch`.

Downloaded files are written to `public/assets/` and are included in the Vite build.


## Complete set catalogue

The catalogue now includes all 13 sets/repackaged sets listed in the current Disney Villainous Wiki catalogue, including the 2026 releases. Duplicate villains are intentionally retained across sets so owning multiple sets gives multiple physical copies for random selection.


## Asset downloading

`data/assets.json` stores stable Disney Villainous Wiki page URLs, not Fandom CDN
image URLs. `scripts/download-assets.mjs` fetches each Wiki page, reads its
`og:image`, and downloads that image into `public/assets/`.

This avoids committing brittle `static.wikia.nocookie.net` URLs and avoids the
403/404 failures caused by directly requesting those CDN paths.

Run:

```bash
npm run download-assets
```

The generated files in `public/assets/` should be committed to the repository
before deploying to Netlify.
