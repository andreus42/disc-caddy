# Distribution

How to ship a build of Disc Caddie to testers via **Firebase App
Distribution**. Disc Caddie is a local-only app (no auth, no analytics,
no remote data — see spec §12), so we don't integrate the Firebase SDK
at runtime — we only use App Distribution as a delivery channel.

Flow:

```
  source → EAS Build (cloud) → signed APK → Firebase App Distribution → testers
```

---

## One-time setup

### 1. Install the CLIs

```bash
npm install -g eas-cli firebase-tools
```

### 2. Create accounts (free)

- **Expo** account: <https://expo.dev/signup> — required for EAS Build.
- **Firebase** project: <https://console.firebase.google.com> — create a
  new project (e.g. "Disc Caddie"). You can disable Google Analytics; we
  don't use it.

### 3. Register the Android app in Firebase

In the Firebase console:

1. Project Overview → click the **Android** icon to add an Android app.
2. **Package name**: `com.disccaddy.app` (matches `app.json`'s
   `android.package`).
3. App nickname: anything, e.g. "Disc Caddie Android".
4. SHA-1: skip (only needed for Auth / Dynamic Links — we have neither).
5. **Skip** "Add Firebase SDK" and "Verify installation" — we don't
   integrate the SDK.
6. Copy the **App ID** that Firebase shows on the app's settings page
   (looks like `1:1234567890:android:abcdef1234567890`). Save it; you'll
   pass it to the upload command below.

### 4. Set up App Distribution

In the Firebase console:

1. **Release & Monitor → App Distribution → Get started**.
2. **Testers & Groups** tab → **Add group** → name it `testers`.
3. Add tester emails to the group.

### 5. Authenticate the CLIs

```bash
eas login            # Expo account
firebase login       # Google account
```

### 6. Initialize EAS in this repo

```bash
eas init
```

This adds an `extra.eas.projectId` entry to `app.json`. **Commit it.**

---

## Releasing a build

### Build the APK (runs in EAS cloud, ~5–10 min)

```bash
eas build --profile preview --platform android
```

The `preview` profile in `eas.json` produces a signed **APK** (not
`.aab`) with internal distribution — exactly what Firebase App
Distribution expects.

When the build finishes, the CLI prints an artifact URL. The build also
shows up in the Expo dashboard.

### Distribute to testers

Download the APK from that URL (the build details page has a Download
button), then upload it to Firebase:

```bash
firebase appdistribution:distribute path/to/build.apk \
  --app 1:1234567890:android:abcdef1234567890 \
  --groups testers \
  --release-notes "Initial preview build — try New Round and Statistics"
```

Replace the `--app` value with **your** Android App ID from step 3.

Testers receive an email from Firebase with a one-tap install link. On
Android they'll need to allow "Install from unknown sources" the first
time.

### Convenience env var

Put your App ID in your shell once:

```bash
export FIREBASE_ANDROID_APP_ID=1:1234567890:android:abcdef1234567890
```

(Windows / PowerShell: `$env:FIREBASE_ANDROID_APP_ID = "..."`)

Then the upload command becomes:

```bash
firebase appdistribution:distribute build.apk \
  --app $FIREBASE_ANDROID_APP_ID \
  --groups testers \
  --release-notes "..."
```

---

## iOS (later)

Same flow, with two extra prerequisites:

- An **Apple Developer account** ($99/year).
- The `ios.bundleIdentifier` (`com.disccaddy.app`) registered with
  Apple — EAS handles certificates and provisioning profiles when you
  let it manage credentials during `eas build`.

Then:

```bash
eas build --profile preview --platform ios
firebase appdistribution:distribute build.ipa \
  --app <YOUR_IOS_FIREBASE_APP_ID> \
  --groups testers
```

The iOS Firebase app is registered the same way as the Android one in
step 3, using the bundle identifier instead of the package name. iOS
testers install via the Firebase tester app (one-time install) plus a
device-UDID provisioning step — Firebase's tester emails walk them
through it.

---

## Going to production later

When you're ready for the Play Store, the `production` build profile in
`eas.json` produces an `.aab` instead of `.apk` (Play Store requires
`.aab`) and auto-increments `versionCode`. `eas submit --platform
android` handles the upload to the Play Console once you've configured
service-account credentials.

For now, Firebase App Distribution is enough to share preview builds.
