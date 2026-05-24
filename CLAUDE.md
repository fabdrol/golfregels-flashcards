# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Flashcard SPA to study for the Dutch NGF GVB (Golfvaardigheidsbewijs) theory exam. UI copy is in Dutch — keep new strings Dutch unless asked.

## Commands

```bash
npm install
npm run dev        # vite dev server on http://localhost:5173/
npm run build      # outputs to dist/
npm run preview    # serve the production build
./deploy.sh        # build + sync to s3://video.superyachtapi.com/golf/ + CloudFront invalidation (AWS profile: syt)
```

There is no linter, formatter, or test framework configured.

## Architecture

Single-page React 18 app built with Vite. No router, no TypeScript, no state library.

- **View routing** is a `useState('home' | 'study' | 'done')` switch in `src/App.jsx`. All three views are mounted conditionally from `App`.
- **Flashcards** are a static array in `src/data/flashcards.js`. Each card has `{ id, topic, front, back }`. Topics are declared in the same file as `{ id: { label, color } }` and drive both the home filter UI and the per-card badge color. Adding a card = appending to the array with a unique `id` and an existing `topic` key.
- **Progress** is persisted per browser via `useProgress` (`src/hooks/useProgress.js`) under the `localStorage` key `golfregels.progress.v1` as `{ [cardId]: 'known' | 'practice' }`. The hook also exposes `storageAvailable` so the UI can warn when storage is blocked. Bump the key suffix if the shape changes.
- **Study session** (`src/components/Study.jsx`): `App` shuffles the ids of the selected topics into a `pool` and passes it in. Cards marked `practice` are re-appended to the pool **once** per session (tracked by a `rescheduled` Set) so the user sees them again before finishing. Keyboard bindings: space/enter flip, `1` = known, `2` = practice, `→` = skip, `Esc` = exit.
- **Styling** lives in a single `src/App.css` using BEM-ish class names (`card`, `card--flipped`, `study__progress-fill`, …). Topic colors come from the data file, not CSS.

## Deploy

`vite.config.js` sets `base: '/golf/'` because the site is served from the `/golf/` subpath at `https://video.superyachtapi.com/golf/`. Don't change the base unless the deploy target moves. `deploy.sh` uploads hashed assets with a 1-year immutable cache and `index.html` with `no-cache`, then fires a CloudFront invalidation in the background.

## Planning docs

`docs/superpowers/plans/` and `docs/superpowers/specs/` hold implementation plans and design specs written via the superpowers workflow. Check them before starting work that may already be specced.
