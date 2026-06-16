# Maneno — iOS build (Capacitor)

The iOS app is a **Capacitor** wrapper around the same PWA that powers the web app and the
Android TWA. One codebase → three targets. The Xcode project lives **outside this repo** at
`/Users/kmunj/maneno-ios/` (a build workspace, like `/Users/kmunj/maneno-android/`).

## What's already done (by assistant)
- `maneno-ios/` scaffolded: `@capacitor/core`, `ios`, `haptics`, `share` installed.
- `capacitor.config.json` → appId `com.kmunjy.maneno`, appName `Maneno`, webDir `www`.
- App assets bundled into `maneno-ios/www/` (copied from this repo).
- `npx cap add ios` complete → `ios/App/App.xcworkspace` generated.
- `pod install` complete (Capacitor + Haptics + Share pods). *(Needed `LANG=en_US.UTF-8`
  to dodge a CocoaPods ASCII-8BIT encoding bug.)*
- **Native plugins wired into `play.html`** (guarded by `window.Capacitor`, inert in the
  browser): native Haptics engine + native Share sheet when running as the iOS app — this is
  the standard hedge against App Store guideline 4.2 "minimum functionality".

## To re-sync after any web change
```bash
cp /Users/kmunj/maneno/*.html /Users/kmunj/maneno/*.js /Users/kmunj/maneno-ios/www/
cd /Users/kmunj/maneno-ios && LANG=en_US.UTF-8 npx cap copy ios   # copy only (no xcodebuild)
```
> Use `cap copy` not `cap sync` here: `sync` calls `xcodebuild` for version detection, which
> needs full Xcode. `copy` just refreshes the bundled web assets and always works.

## Final steps **[YOU — needs full Xcode + Apple Developer account]**
1. Install **Xcode** from the Mac App Store (free, ~7 GB). This box currently has only
   Command Line Tools, which is enough to scaffold/pod but not to archive/sign.
2. ```bash
   open /Users/kmunj/maneno-ios/ios/App/App.xcworkspace
   ```
3. In Xcode: select the **App** target → **Signing & Capabilities** → set your **Team**
   (your Apple Developer account); confirm bundle id `com.kmunjy.maneno`.
4. Drop in the app icon (`store-assets/icon-1024.png`) via the asset catalog.
5. **Product → Archive** → **Distribute App → App Store Connect → Upload**.
6. In **App Store Connect**: create the app, paste listing copy from `STORE_LISTING.md`,
   upload the 1290×2796 screenshots, set Privacy Nutrition Label = **Data Not Collected**,
   set Privacy Policy URL = `https://kmunjy.github.io/maneno/privacy.html`, submit.

Review is typically 1–3 days. If 4.2 is raised, the native Haptics/Share are already live —
reply citing offline play + native haptics + native share + installable behaviour.
