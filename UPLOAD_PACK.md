# Maneno — Upload Pack (everything staged for the store sessions)

Pre-flight run 2026-06-16 — **all green**. This is the single sheet to work from once your
Play Console ($25) and Apple Developer ($99/yr) accounts are approved. Field → exact value.

## ✅ Pre-flight verification (re-run anytime)
| Item | Status |
|---|---|
| `maneno-android/maneno-release.aab` | **signed**, `jar verified`, 1,019,000 bytes |
| Upload-key SHA-256 | `B1:53:81:1D:49:DA:3D:7B:E9:8F:33:CC:34:D2:E7:0D:E4:12:0F:BD:00:89:34:ED:B5:15:DE:C4:28:6F:84:8E` |
| assetlinks.json fingerprint | **matches** the AAB ✓ |
| icon-1024 / feature-graphic / 3 screenshots | exact dimensions; icon alpha = none (Apple-safe) ✓ |
| Copy char limits | short 69/80 · subtitle 28/30 · keywords 92/100 ✓ |
| privacy.html · assetlinks.json · play.html | all HTTP **200** ✓ |

## ⚠️ ONE thing to do during Play upload (don't skip)
New Play apps auto-enroll in **Play App Signing**: Google generates its *own* app-signing key
and re-signs your bundle. The fingerprint above is your **upload** key — Google's **app-signing**
key fingerprint is different. After you upload the first AAB:
1. Play Console → **Setup → App integrity → App signing** → copy the **"SHA-256 certificate fingerprint"**.
2. Send it to me → I add it as a *second* entry in `assetlinks.json` and push.
3. Without this, the installed Android app shows the browser URL bar (asset-link check fails).

---

## 🟢 GOOGLE PLAY — field-by-field

**Create app:** App name `Maneno — Bantu Crossword` · Default language English (US) · App · Free.

**Store listing**
| Field | Paste |
|---|---|
| App name | `Maneno — Bantu Crossword` |
| Short description (80) | `Crosswords in Shona, Swahili & Zulu — play, learn, and dig for words.` |
| Full description | the block in `STORE_LISTING.md` (≤4000) |
| App icon | `store-assets/icon-1024.png` |
| Feature graphic | `store-assets/feature-graphic-1024x500.png` |
| Phone screenshots | `store-assets/screen-1-grid.png`, `screen-2-learn.png`, `screen-3-streak.png` |
| Category | Games → **Word** (secondary: Education) |
| Email | kkmunjeri83@gmail.com |
| Privacy policy | `https://kmunjy.github.io/maneno/privacy.html` |

**Release:** Testing → **Internal testing** → upload `maneno-android/maneno-release.aab` →
add 12+ testers (recruit from the diaspora FB groups per MARKETING.md) → run ~14 days → Production.

**Data safety:** *No data collected. No data shared.* (true — see privacy.html)
**Content rating:** questionnaire → expect **Everyone**.
**What's new:** `First release. Crosswords and word-learning in Shona, Swahili and Zulu.`

---

## 🍎 APPLE APP STORE — field-by-field  *(after Xcode archive; see BUILD_IOS.md)*

| Field | Paste |
|---|---|
| Name | `Maneno — Bantu Crossword` |
| Subtitle (30) | `Shona · Swahili · Zulu words` |
| Keywords (100) | `shona,swahili,zulu,crossword,bantu,african,language,learn,puzzle,word game,heritage,zimbabwe` |
| Description | full block from `STORE_LISTING.md` |
| Promotional text | `The first crossword built for Bantu languages.` |
| App icon | `store-assets/icon-1024.png` (no alpha ✓) |
| 6.7" screenshots | the three 1290×2796 PNGs |
| Bundle ID | `com.kmunjy.maneno` |
| Category | Games (Word) / secondary Education |
| Privacy policy | `https://kmunjy.github.io/maneno/privacy.html` |
| Privacy nutrition | **Data Not Collected** |
| Price | Free |

**4.2 note:** native Haptics + Share are wired (verified by QA's web-inertness test + code review).
If rejected, reply citing offline play + native haptics + native share + installable behaviour.

---

## Sequence
```
[YOU] sign up Play ($25) + Apple ($99) ──approved──┐
                                                    ├─► Play: I fill listing → you Submit → internal test 14d → Production
[YOU] install Xcode → I prep archive ──────────────┘   iOS: you sign+upload → I fill ASC listing → you Submit
```
The only blockers left are your account approvals and the two final Submit clicks. Everything
else is staged and verified.
