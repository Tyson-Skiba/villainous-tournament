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
