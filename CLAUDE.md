# zac-portfolio

Zachary's personal portfolio site (About / Work / Contact), deployed to GitHub Pages at https://zachyboiii.github.io/zac-portfolio/. React 18 + Vite, framer-motion animations, Spline 3D embeds, and an in-browser RAG feature (see `rag.md`).

## Stack & layout
- `src/` — React app; react-router-dom for pages, react-anchor-link-smooth-scroll for section navigation.
- RAG/AI features: `@xenova/transformers` for in-browser embeddings, `@mediapipe/tasks-vision`; `scripts/generate-embeddings.mjs` precomputes embeddings (`npm run embed`). `rag.md` documents the approach.
- Deploy: `npm run deploy` builds and pushes `dist/` to GitHub Pages via `gh-pages`.

## Commands
- `npm run dev` — local dev server.
- `npm run embed` — regenerate embeddings after changing site content the RAG feature indexes.
- `npm run build` / `npm run lint`.
- `npm run deploy` — publishes the live site; never run without being asked.

## Working notes
- Global working principles apply from `~/.claude/CLAUDE.md`.
- This is a public-facing personal site — visual polish and copy accuracy matter; don't reword personal content (bio, project descriptions) without asking.
- Everything runs client-side (GitHub Pages is static hosting); don't add features that need a server.
