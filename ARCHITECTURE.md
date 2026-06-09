# Maneno — Architecture

Maneno is one of three independent projects (repos: **maneno**, **walletvibe**, **yourreader**).

## Today: static client app (shipped)

```
maneno/web/
├── index.html      Landing page (Indaba design)
├── play.html       The game  ──┐
├── register.html   Profile     │ all load ↓
├── admin.html      Content admin (CRUD + dashboard)
├── words.js        ◀── single source of truth for the word bank
│                       (BASE_LANGUAGES + admin overlay → window.LANGUAGES)
├── sw.js           Service worker (offline-first, cache maneno-v1)
├── manifest.json   PWA install
└── icons…
```

- **No backend.** Word bank bundled in `words.js`; player profile, settings and the
  admin content-overlay live in `localStorage`.
- **Admin loop (client-side):** `admin.html` writes a content overlay to
  `localStorage["maneno_v1_customwords"]` → `words.js` merges it (add / override /
  hide) → the game reflects it on next load. Export/Import as JSON.
- **Difficulty:** 4 levels (Learner / Intermediate / Experienced / Expert) banding
  word length, hint budget, autocheck and check-gating.
- **Hosting:** any static host (Vercel / Netlify / GitHub Pages). Free, instant.

## Target: full stack (when accounts + sync are needed)

```
 CLIENT (PWA: index/play/register/admin)
   │  HTTPS / JSON
 EDGE/API  — Vercel Functions (Fluid Compute, Node)
   │  /api/words   /api/profile   /api/daily   /api/admin/* (auth-gated)
 DATA      — Postgres (Vercel Marketplace): words, users, scores, daily_seed, audit_log
 AUTH      — Sign in with Vercel / OAuth, role-based (player vs admin)
```

**Migration is a data-source swap, not a rewrite:**
| Concern | Today | Full stack |
|---|---|---|
| Word bank | `words.js` file | `GET /api/words` (edge-cached) |
| Admin CRUD | localStorage overlay | `POST/PATCH/DELETE /api/admin/words` → Postgres |
| Profile / streak | localStorage | `users` table (cross-device) |
| Daily puzzle | date-seeded client RNG | `daily_seed` row, served by `/api/daily` |
| Auth | none | Sign in with Vercel, role-gated admin |

The UI screens (game, admin) stay the same — only their data calls change.

## Why static-first
Fastest path to a usable product, free to host, works offline, and the admin overlay
gives real content management now. The full stack is additive when the audience and
content scale demand accounts, moderation and cross-device sync.
