# SipStop

> A friendly sobriety-tracking app — log drinks, save mood notes with emoji, track your sober time, and share/community notes to encourage each other.

![GitHub repo size](https://img.shields.io/badge/repo-size-REPLACE_ME-blue)
![GitHub watchers](https://img.shields.io/badge/watchers-REPLACE_ME-blue)
![Languages Count](https://img.shields.io/badge/languages-REPLACE_ME-blue)
![Code size](https://img.shields.io/badge/code-size-REPLACE_ME-blue)

<p align="center">
  <img src="client/assets/logo.png" alt="SipStop logo" width="200" />
</p>

<p align="center">
  <a href="REPLACE_ME_DEMO_LINK">View Demo</a>
  ·
  <a href="REPLACE_ME_ISSUES">Report Bug / Request Feature</a>
</p>

---

## Table of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [How to Install](#how-to-install)
* [App Features](#app-features)
* [Concept & Design](#concept--design)
* [Development Notes & Gotchas](#development-notes--gotchas)
* [Testing](#testing)
* [Future Work](#future-work)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## About the Project

SipStop helps people track their sober streaks, reflect with mood-tagged notes, and support a small community. It’s a lightweight React Native (Expo) app using Firebase for auth and Firestore for persistence. The UI emphasizes simplicity and encouragement — quick logging and gentle nudges to keep going.

---

## Built With

* **React Native / Expo** — cross-platform mobile app
* **TypeScript** — type-safe codebase
* **React Navigation** — app navigation and stacks
* **Firebase** — Authentication (email/anonymous), Firestore, Storage
* **react-native-svg** — emoji/mood icons as SVGs
* **Jest / React Native Testing Library** — unit & component tests

---

## Getting Started

### Prerequisites

* Node.js >= 16
* npm or yarn
* Expo CLI: `npm install -g expo-cli`
* (For building on device) Android Studio or Xcode / macOS

### How to Install (local dev)

1. Clone repo

```bash
git clone REPLACE_ME_YOUR_REPO_URL
cd sipstop
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Create environment config
   Create `app.json` / `.env` or however you store config in your project and add your Firebase config:

```env
FIREBASE_API_KEY=REPLACE_ME
FIREBASE_AUTH_DOMAIN=REPLACE_ME
FIREBASE_PROJECT_ID=REPLACE_ME
FIREBASE_STORAGE_BUCKET=REPLACE_ME
FIREBASE_MESSAGING_SENDER_ID=REPLACE_ME
FIREBASE_APP_ID=REPLACE_ME
```

4. Start Expo

```bash
npx expo start
```

Open on a device or emulator.

---

## App Features

### Auth & Onboarding

* Email sign up / login (Firebase).
* Auth state is observed at app root (`onAuthStateChanged`) — the app renders `AuthStack` or `AppStack` conditionally.

### Home/Dashboard

* Shows current sober time (time since last logged drink), updated live.
* Encouragement card with dynamic messages and mood emoji based on latest notes.
* Quick “Log Drink” CTA.

### Drinks Log

* Log a drink with timestamp and optional motivation/notes.
* See history of drink events.

### Create Note

* Create reflection notes with title, details and mood selected via emoji (SVG icons).
* Notes saved to Firestore with timestamp, mood category, and emoji id.

### Community

* View and comment on public notes (usernames shown).
* Simple moderation (report) flow.

### Settings

* Update username and password (via Firebase).
* Sign out (handled by auth listener — see nav note below).

---

## Concept & Design

* Mood-oriented note-taking: emojis represent `happy`, `normal`, `sad` moods — each maps to SVG icons.
* Goal-based messages: if user has set a sobriety goal (1 week / 1 month / 3 months …), the encouragement card adapts when goal is near or reached.
* Minimal, soft UI (pale background, warm accent colors) to avoid triggering/harsh UX.

---

## Development Notes & Gotchas

A few things we learned while building this — include these in your README so teammates don’t get surprised:

### Navigation & auth stack switching

We use conditional stacks in `App.tsx`:

```tsx
{!isLoggedIn ? (
  // AuthStack: LogIn, SignUp, Splash
) : (
  // AppStack: Home, Create, Settings, Community, ...
)}
```

**Important:** **Do not** call `navigation.navigate('LogIn')` after sign-up or sign-out if you rely on this pattern — the `LogIn` route is not mounted when `isLoggedIn` is true. Instead:

* After `registerUser()` simply let `onAuthStateChanged` flip `isLoggedIn` (and the navigator will re-render), or
* Use `navigation.goBack()` for “Return to Log In” buttons if the flow came from a previous screen.

If you need to force a reset to a particular nested route, structure a root-level navigator (AuthStack + AppStack) and call navigation on the root container.

### SVG key/spread warning

If you import SVGs as React components (via `react-native-svg-transformer`), **always render them as components**:

```tsx
// GOOD
const Icon = HappyOne;
return <Icon width={36} height={36} />;

// BAD (may cause "key prop being spread" warning)
const elem = <HappyOne />;
const props = elem.props; // may include internal key
<Svg {...props} />
```

If you must accept an element, sanitize props before rendering and remove `key`.

### Auth & Navigation Example (Sign up)

When a user signs up:

* `registerUser(...)` should create the account and return the result.
* **Do not** call `navigation.navigate('LogIn')` — the app root will automatically show the logged-in stack.

---

## Testing

* Run unit tests (Jest)

```bash
npm test
```

* Consider writing integration tests for auth flows and Firestore interactions using emulator suite.

---

## Future Work

* Add offline support and local caching of notes using Redux-Persist or WatermelonDB.
* Improve community features: likes, threaded comments, anonymity toggle.
* Add export of streak reports (CSV / shareable images).
* Expand onboarding: recovery resources, emergency contacts.

---

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes and push.
4. Open a PR describing the changes.

Please follow the existing TypeScript, linting, and commit conventions.

---

## License

Distributed under the MIT License. See `LICENSE` for details.

---

## Contact

**Anemi Breytenbach** — [231178@virtualwindow.co.za](mailto:231178@virtualwindow.co.za)
GitHub: [AnemiB](https://github.com/AnemiB) (replace if different)
