# Maneno — Targeted Marketing Model

Operational model: segments → message → channel → budget → KPI. All population figures
below are **census-verified** (from the adversarial research run; refuted market-size
figures are deliberately excluded). Built for a solo founder: a zero-budget organic
engine first, paid tiers only when the loop is proven.

## 1 · Positioning (one line per audience)
> **Core:** "The first crossword in the language you grew up with."
> Learners: "Learn Shona, Swahili or Zulu — one word a day."
> Press/communities: "Duolingo never made a Shona course. We made Shona a game."

The defensible hook is **cultural pride + first-ever**, not puzzle mechanics.

## 2 · Segment model (priority-ordered)

| # | Segment | Size (verified) | Trigger emotion | Primary message | Where they are |
|---|---|---|---|---|---|
| S1 | **Zimbabwean diaspora adults** (UK, SA, AUS, US) | ~125k UK alone (ONS; ZimStat undercount documented) | Pride / nostalgia — *nothing exists for Shona* | "Shona finally has its own game" | Zim diaspora Facebook groups, WhatsApp family groups, X (#Zimbabwe, #Shona, #twimbos), church networks |
| S2 | **SA diaspora adults** (Zulu) | 217,180 England/Wales + 189,207 AUS + ~128k US (census) | Heritage connection | "Play in isiZulu — clicks and all" | SA expat FB groups (UK/AUS/NZ huge), Springbok-fan communities, Mzansi Twitter |
| S3 | **Heritage parents** (kids born abroad) | Subset of S1+S2; highest intent | Fear of language loss in their children | "Your kids can learn Gogo's language — as a game" | Parenting groups within diaspora communities, Saturday/heritage schools, churches |
| S4 | **Swahili learners & East African diaspora** | Largest L2 base globally | Aspiration / utility | "Practise Swahili 10 minutes a day" | r/Swahili, language-learning TikTok, Duolingo-adjacent communities |
| S5 | **Word-game tourists** | Mass market, low loyalty | Novelty | "A crossword where 'ng'' is one square" | r/crossword, Wordle-community X, puzzle newsletters |

**Resource rule:** 60% effort on S1+S3 (uncontested: Duolingo has no Shona), 25% on S2,
15% on S4+S5. S5 is fed by the share loop, not by spend.

## 3 · Growth loop (the engine everything feeds)
```
Daily puzzle (same grid for everyone)
   → solve → celebration screen → "Share result"
   → Wordle-style text lands in WhatsApp/Facebook group
   → friend taps link (their language, their pride)
   → plays → streak + achievements retain → shares again
```
WhatsApp is the diaspora's home channel — the share text is engineered for it.
KPI for the loop: **k-factor** (invites accepted per active player) and **D7 retention**.

## 4 · Channel plan by phase

### Phase A — Zero budget (now → store launch)
| Channel | Action | Segment | Success looks like |
|---|---|---|---|
| Diaspora Facebook groups | Founder-voice post ("I built this because…") in 10–15 Zim/SA UK-AUS-US groups; ask admins first | S1,S2,S3 | 30+ comments, 200 first-week players/group |
| WhatsApp | Seed daily-puzzle share into family/community groups; the share button does the rest | S1,S3 | Organic re-shares appearing |
| X/Twitter | Daily puzzle result thread; tag #Shona #isiZulu #Kiswahili; engage twimbos | S1,S2,S4 | One amplification by a 10k+ heritage account |
| Reddit | One honest "I made this" post each in r/Zimbabwe, r/southafrica, r/Swahili, r/languagelearning (rules permitting) | S1,S2,S4 | Front page of one sub |
| Heritage/Saturday schools | Email + **Print mode** flyer: free classroom crossword worksheets | S3 | 3 schools using weekly handouts |
| Press (community media) | Pitch: "Duolingo skipped Shona — a Zimbabwean built it anyway" → NewZimbabwe, ZimEye, SABC digital, TechZim, TechCabal | S1,S2 | 1–2 stories at launch |
| Play Store closed test | Recruit the 12+ required testers FROM the FB groups — testing requirement doubles as community seeding | S1 | 20 testers, testimonial quotes for the listing |

### Phase B — Micro-budget ($150–500/mo, only after D7 > 20%)
- **Meta ads**: the targeting gem — Facebook lets you target *expats by origin country + current country* (e.g. "lives in UK, from Zimbabwe"). Tiny, cheap, hyper-relevant audiences. Creative = the celebration screen + "first ever in Shona". $5–10/day per segment test.
- **Diaspora micro-influencers** (5–50k followers, Zim/SA UK TikTok & IG): product gifting + small fees; one authentic "my mum's reaction" video outperforms any banner.
- KPI gate: CPI < $0.60 (Play) before scaling anything.

### Phase C — Scale (only with revenue or grant funding)
- ASA/Google App Campaigns on heritage keywords ("learn shona", "zulu game" — near-zero competition, cheap);
- Partnerships: heritage-language orgs, Zim/SA embassies' cultural programmes, African Language departments (UCT, UZ, SOAS);
- Localise store listings into Shona/Swahili/Zulu themselves (signal + ASO).

## 5 · ASO model (store search is a channel)
- Title carries the keywords: **"Maneno — Bantu Crossword: Shona, Swahili & Zulu"**
- Target queries with weak competition: "shona game", "learn shona" (no Duolingo!), "zulu crossword", "swahili puzzle", "african word game"
- Screenshots tell the story in 3 frames: (1) "ng' = one square" grid close-up, (2) Learn Mode card, (3) celebration + streak
- "No ads · No tracking · Works offline" as a listed feature — rare and true.

## 6 · Measurement (privacy-respecting)
No tracking SDK (it's the brand promise). Measure with:
- Store console installs/uninstalls + country split (free, server-side)
- GitHub Pages → later host analytics that are cookieless/aggregate only (e.g. Cloudflare) if needed
- In-app, device-local funnel counters surfaced in admin (plays, shares tapped, streaks) — opt-in export only
- North-star: **weekly active solvers**; supporting: D1/D7 retention, share-taps per win, daily-puzzle participation rate

## 7 · 90-day calendar
| Weeks | Motion |
|---|---|
| 1–2 | Native review closes → Play closed test recruits from 5 FB groups |
| 3–4 | Play production live → founder posts everywhere (Phase A full sweep) + press pitches |
| 5–6 | App Store live → second wave; heritage-school flyer push; collect testimonials |
| 7–8 | First Meta ad tests ($5/day × 3 segments); kill or scale by CPI |
| 9–12 | Double down on best channel; influencer gifting; school partnerships formalised |

## 8 · Honest constraints
- Segment sizes are **census of birth-country**, not "active social users" — reachable audiences are a fraction; that's why Phase A is community-direct rather than broad ads.
- No verified language-app market $ figures exist (all were refuted in research) — this model spends on *loops with measured k-factor*, not on market-size optimism.
- The share loop only compounds if the native review lands first: accuracy IS the marketing.
