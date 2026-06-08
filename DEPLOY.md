# Deploying Mhanga (public URL)

The app in `web/` is a **zero-config static site** — fully deploy-ready. The only
step I can't do for you is the one-time browser login. Everything else is prepared.

## Deploy readiness checklist ✅
- [x] `index.html` — self-contained (HTML + CSS + JS, no build step)
- [x] `manifest.json` — PWA manifest
- [x] `sw.js` — service worker (offline-capable, network-first HTML)
- [x] `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — generated, referenced
- [x] `vercel.json` — clean-URLs config
- [x] No backend, no database, no env vars required

## Option A — Vercel (recommended, ~2 min)
```bash
npm i -g vercel                      # one-time install
cd /Users/kmunj/payment-reminder/bantu_crossword/web
vercel login                         # opens browser — YOUR step (auth)
vercel deploy --prod                 # returns https://<project>.vercel.app
```
First run asks a couple of setup questions — accept the defaults (it auto-detects
a static site). The folder deploys as its own project; it does **not** touch the
`elevenreader` app at the repo root.

## Option B — Netlify drop (no CLI, no login friction)
1. Go to https://app.netlify.com/drop
2. Drag the `web/` folder onto the page.
3. You get a public URL instantly. (Custom domain optional.)

## Option C — GitHub Pages (free, from the repo)
The crossword lives under `bantu_crossword/web/` on the `elevenreader` branch.
Pages serves from a branch root or `/docs`, so you'd either:
- copy `web/` to `/docs` on a Pages-enabled branch, or
- push `web/`'s contents to a `gh-pages` branch.
Vercel/Netlify are simpler for a subfolder; use one of those unless you
specifically want Pages.

## After deploy
- Test "Add to Home Screen" on iOS + Android (PWA install) — icons now present.
- Share the URL with the diaspora community / test group.
- The Daily puzzle is date-seeded, so everyone sees the same puzzle each day.

## What needs you vs. what's done
| Step | Who |
|------|-----|
| Static build, icons, manifest, SW, config | ✅ Done |
| `vercel login` (browser OAuth) | **You** — can't be done headless |
| `vercel deploy --prod` | You (one command after login) |

Tell me once you've logged in and I can run the deploy command for you, or just
run it yourself — it's a single line.
