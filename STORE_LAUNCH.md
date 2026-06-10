# Maneno — App Store & Play Store Launch Guide

Step-by-step from today's PWA to live store listings. Steps marked **[YOU]** need your
identity/payment and cannot be done by the assistant; everything else is automatable.

**Launch gate (do first):** native-speaker sign-off via `/review.html` — flagged clues
fixed, Zulu graduated or kept "(Beta)" in the listing. Shipping unreviewed clues risks
early 1-star reviews from the exact heritage audience the app serves.

---

## Phase 0 — Accounts (one-time) **[YOU]**

| | Google Play | Apple App Store |
|---|---|---|
| Account | [play.google.com/console/signup](https://play.google.com/console/signup) | [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/) |
| Cost | **$25 once** | **$99 / year** |
| Time to approve | ~1–3 days (ID verification) | ~1–2 days (longer for org accounts) |
| Identity | Google account + ID check | Apple ID + 2FA; D-U-N-S only if enrolling as a company |

Personal vs company: a personal account is fastest; a company account (needs D-U-N-S
number, free but ~1–2 weeks) shows a business name as the seller. For a first launch,
personal is fine — you can transfer the app later.

---

## Phase 1 — Google Play (the easy one: PWA → TWA)

Maneno is already a compliant PWA (manifest, service worker, offline, icons), so Play
accepts it via a **Trusted Web Activity** wrapper — no rewrite.

1. **Wrap with Bubblewrap** (automatable):
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest https://kmunjy.github.io/maneno/manifest.json
   bubblewrap build        # produces app-release-signed.aab + assetlinks.json
   ```
2. **Digital Asset Links**: put the generated `assetlinks.json` at
   `/.well-known/assetlinks.json` on the site (proves you own the URL → hides the
   browser bar). One commit; automatable.
3. **Play Console** **[YOU]**: create app → upload the `.aab` to *Internal testing*
   first, then *Production*.
4. **Store listing** (copy below) + **Data safety form** — answers are trivial because
   the privacy policy is true: *no data collected, no data shared*. Privacy policy URL:
   `https://kmunjy.github.io/maneno/privacy.html`.
5. **Content rating questionnaire** → IARC, expect *Everyone / PEGI 3*.
6. Submit. First review typically **1–7 days**. Note: new personal accounts must run a
   ~14-day closed test with 12+ testers before production — plan for it (the diaspora
   community group is the natural tester pool, and doubles as a marketing seed).

## Phase 2 — Apple App Store (needs a thin native wrapper)

Apple doesn't accept TWAs; wrap with **Capacitor** (automatable except signing/upload):

1. ```bash
   npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init Maneno com.kmunjy.maneno --web-dir .
   npx cap add ios && npx cap sync
   ```
2. Open in Xcode **[YOU on your Mac]**: set signing team (your developer account),
   bundle id `com.kmunjy.maneno`, build → *Product → Archive* → upload via Organizer.
3. **App Store Connect** **[YOU]**: new app → fill listing (copy below), upload
   screenshots, set **Privacy Nutrition Label**: "Data Not Collected" (true).
4. **4.2 Minimum-functionality risk (be ready):** Apple sometimes rejects thin web
   wrappers. Mitigations already in the app: offline play, haptics, share sheet,
   installable behaviour. If rejected, the standard fix is adding 1–2 native touches
   via Capacitor plugins (haptic engine, native share — both near-free to wire).
5. Submit. Review typically **1–3 days**.

## Phase 3 — Store assets (automatable; I can generate all of these)

| Asset | Play | App Store |
|---|---|---|
| Icon | 512×512 PNG | 1024×1024 PNG (no alpha) |
| Feature graphic | 1024×500 | — |
| Screenshots | ≥2 phone (16:9–9:16) | 6.7" (1290×2796) + 6.5" sets |
| Short description | 80 chars | Subtitle, 30 chars |
| Full description | 4000 chars | 4000 chars |

**Draft listing copy (edit freely):**
- **Name:** Maneno — Bantu Crossword
- **Short / subtitle:** "Crosswords in Shona, Swahili & Zulu" (35 chars → trim to "Shona · Swahili · Zulu crosswords" for Apple's 30)
- **Description opener:** "The first crossword built for Bantu languages — where ng', zv and dl each fill a single square, the way the language actually sounds. Play for fun or learn your mother tongue: 4 difficulty levels, themed categories, a shared daily puzzle, Learn Mode with meanings and pronunciation, streaks and achievements. Works offline. No ads, no tracking, no account."
- **Keywords (Apple, 100 chars):** `shona,swahili,zulu,crossword,bantu,african,language,learn,puzzle,word game,heritage,zimbabwe`
- **Category:** Word (Games) / secondary Education

## Phase 4 — Post-launch wiring (after URLs exist)
- In-app **rate-the-app prompt** pointed at the real store URLs (deliberately deferred until now)
- Store badges on the landing page; share text gains the store link
- Monitor first reviews daily for the first 2 weeks — early replies boost ranking

## Sequence summary
```
[YOU] Phase 0 accounts ──┐
Native review sign-off ──┼─→ Play internal test (14d) → Play production
Assets + copy (auto) ────┘            └→ Capacitor build → [YOU] sign/upload → App Store review
```
Realistic elapsed time: **~3 weeks to Play production, ~1–2 weeks to App Store** (parallel),
dominated by Play's new-account testing requirement, not by build work.
