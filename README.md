# Villainous Tournament

A mobile-first React + TypeScript app for randomly assigning Disney Villainous characters to players across multiple rounds.

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
