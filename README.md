# Szókincs — Hungarian Vocab Keeper

A minimalist flashcard app for advanced Hungarian vocabulary, styled after Claude's light-mode UI. Built with Next.js, TypeScript, and Tailwind CSS.

Pre-loaded with **150+ advanced Hungarian cards** covering vonzatok (verb + case phrases), idioms, literary-register verbs, formal adjectives, and native-speaker-level nouns.

## Features

- **Browse & filter** — Search by text, filter by tag (verb, noun, adjective, phrase, idiom, adverb, conjunction, vonzat), sort by newest/alphabetical/mastery
- **Tag system** — 8 categories including `vonzat` for verb-case government patterns
- **Add & delete cards** — Quick card creation with all fields
- **Inline editing** — Edit any card without leaving the browse view
- **Review mode** — Spaced-review sessions with tag filtering; weakest cards shown first
- **Stats & progress** — Custom "Heritage Speaker Progress" composite score, mastery by tag, session history, day streaks
- **Anki export** — One-click TSV export with HTML formatting for Anki import
- **Persistent storage** — All data saved in localStorage between sessions

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### Option A: One-click (recommended)

1. Push this folder to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click **Deploy** — no configuration needed

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Vercel will detect it as a Next.js project automatically.

### Important note on persistence

This app uses `localStorage` for data persistence — your vocabulary lives in your browser. If you want server-side persistence, you'd need to add a database (e.g., Supabase, PlanetScale, or a simple JSON file on the server).

## Anki Import

1. Go to **Stats** → click **Export for Anki**
2. In Anki: File → Import
3. Select the downloaded `hungarian-vocab-anki.txt`
4. Set field separator to **Tab**
5. Map fields: Field 1 = Front, Field 2 = Back, Field 3 = Tags
6. Check "Allow HTML in fields"

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- localStorage for persistence
- No external database required
