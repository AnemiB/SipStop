# SipStop
> A friendly sobriety-tracking app — log drinks, save mood notes with emoji, track your sober time, and support each other.

![GitHub repo size](https://img.shields.io/github/repo-size/AnemiB/SipStop)
![GitHub watchers](https://img.shields.io/github/watchers/AnemiB/SipStop)
![GitHub language count](https://img.shields.io/github/languages/count/AnemiB/SipStop)
![GitHub code size](https://img.shields.io/github/languages/code-size/AnemiB/SipStop)
![GitHub top language](https://img.shields.io/github/languages/top/AnemiB/SipStop)

<p align="center">
  <img src="assets/logo.png" alt="SipStop logo" width="220" />
</p>

<p align="center">
  <a href="https://github.com/AnemiB/SipStop">Repository</a>
  ·
  <a href="https://github.com/AnemiB/SipStop/issues">Report Bug / Request Feature</a>
  ·
  <a href="REPLACE_ME_DEMO_LINK">Demo (if available)</a>
</p>

---

## Table of Contents

- [About the Project](#about-the-project)  
- [Built With](#built-with)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Install & Run](#install--run)  
- [App Features](#app-features)  
- [Design & Concept](#design--concept)  
- [Development Notes & Gotchas](#development-notes--gotchas)  
- [Testing](#testing)  
- [Future Work](#future-work)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## About the Project

SipStop helps people track sober streaks, reflect with mood-tagged notes, and share encouragement via a small community. Built with React Native (Expo) and Firebase, the app focuses on simple logging, gentle encouragement and reflection.


## Built With

- **React Native (Expo)** — cross-platform mobile app
- **React** 19.0.0
- **React Native** 0.79.5
- **Expo** ~53.0.20
- **TypeScript**
- **Firebase** ^12.1.0 (Auth, Firestore, Storage)
- **react-native-svg** ^15.12.1 (SVG mood icons)
- **react-navigation** (native-stack) @ ^7.3.23
- Other notable libraries:
  - `@react-native-async-storage/async-storage` ^1.24.0
  - `@react-native-community/datetimepicker` ^8.4.2
  - `@react-native-picker/picker` ^2.11.1
  - `react-native-toast-message` ^2.3.3

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI (optional but recommended): `npm install -g expo-cli`
- Android Studio or Xcode if you want to run on emulator / build natively

### Install & Run (local dev)

1. Clone the repo:
```bash
git clone https://github.com/AnemiB/SipStop.git
cd SipStop
````

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Add your Firebase config, create `.env` or configure `firebase.ts` depending on your project structure. Example env vars:

```
FIREBASE_API_KEY=REPLACE_ME
FIREBASE_AUTH_DOMAIN=REPLACE_ME
FIREBASE_PROJECT_ID=REPLACE_ME
FIREBASE_STORAGE_BUCKET=REPLACE_ME
FIREBASE_MESSAGING_SENDER_ID=REPLACE_ME
FIREBASE_APP_ID=REPLACE_ME
```

4. Start Expo:

```bash
npx expo start
# or
expo start -c
```

Open with Expo Go on your phone or run in an emulator.

---

## App Features

* Email sign up / log in with Firebase (auth state handled in `App.tsx`).
* Home dashboard showing current sober time (time since last drink).
* Encouragement card that displays dynamic messages based on the last drink / note mood and optional goals.
* Create Note screen: title, details, mood via SVG emoji icons.
* Drinks log: add & view drink events with timestamps.
* Community screen: browse public notes and comment (usernames shown).
* Settings: update username/password & sign out (auth listener handles navigation).

---

## Design & Concept

* Mood-tagged notes that map to `happy`, `normal`, `sad` categories.
* Goal-based encouragement messages (1 week / 1 month / 3 months / etc.).
* Calm colour palette and gentle microcopy to avoid triggering users — UX designed to be supportive, not judgmental.

---

## Future Work

* Offline support & local caching for notes
* More community features (likes, threaded comments, anonymity toggle)
* Export streak reports (CSV / shareable badges)
* Mobile build pipelines (Play Store / App Store)

---

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes and push.
4. Open a Pull Request.

Please follow TypeScript, linting and commit conventions.

---

## License

Distributed under the MIT License. See `LICENSE` for details.

---

## Contact

**Anemi Breytenbach** — [231178@virtualwindow.co.za](mailto:231178@virtualwindow.co.za)
GitHub: [AnemiB](https://github.com/AnemiB)

---

## Troubleshooting Quicklinks (copy/paste)

* Reset Expo cache:

```bash
expo start -c
```

* Common repo searches:

```bash
# find explicit navigation calls to LogIn
rg "navigate\\('LogIn'\\)" || rg "navigate\\(\"LogIn\"\\)"

# find cloneElement usage and svg prop spreads
rg "cloneElement" || rg "<Svg \\{\\.\\.\\." || rg "React\\.cloneElement"
```
---

## Git commands to commit & push README (copy & paste)

```bash
# from repo root
git checkout -b docs/add-readme
# create README.md (paste the content above into it)
git add README.md
git commit -m "docs: add project README for SipStop"
git push origin docs/add-readme
````

Then open a Pull Request on GitHub from branch `docs/add-readme` → `main` (or `master`), review and merge.

Which one do you want next, pookie? 💜
