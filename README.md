![GitHub repo size](https://img.shields.io/github/repo-size/AnemiB/SipStop)
![GitHub watchers](https://img.shields.io/github/watchers/AnemiB/SipStop)
![GitHub language count](https://img.shields.io/github/languages/count/AnemiB/SipStop)
![GitHub code size](https://img.shields.io/github/languages/code-size/AnemiB/SipStop)
![GitHub top language](https://img.shields.io/github/languages/top/AnemiB/SipStop)

<p align="center">
  <img src="/assets/Logo.png" alt="SipStop logo" width="220" />
</p>
A friendly sobriety-tracking app; log drinks, save mood notes with emoji, track your sober time, and support each other.

<p align="center">
  <a href="https://github.com/AnemiB/SipStop">Repository</a>
  ·
  <a href="https://github.com/AnemiB/SipStop/issues">Report Bug / Request Feature</a>
  ·
  <a href="REPLACE_ME_DEMO_LINK">Demo (if available)</a>
</p>

---

## Table of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Install & Run](#install--run)
* [App Features](#app-features)
* [Design & Concept](#design--concept)

  * [Concept Process](#concept-process)

    * [Ideation](#ideation)
    * [ER Diagram](#er-diagram)
    * [Wireframes](#wireframes)
  * [Custom UI](#custom-ui)
* [Development Process](#development-process)

  * [Implementation Process](#implementation-process)

    * [Frontend](#frontend)
    * [Backend / Persistence](#backend--persistence)
    * [DevOps & Tooling](#devops--tooling)
  * [Highlights](#highlights)
  * [Challenges](#challenges)
  * [Future Implementation](#future-implementation)
* [Final Outcome](#final-outcome)

  * [Mockups](#mockups)
  * [Video Demonstration](#video-demonstration)
* [Conclusion](#conclusion)
* [License](#license)
* [Contact](#contact)
* [Responsibilities](#responsibilities)
* [Acknowledgements](#acknowledgements)
* [Troubleshooting Quicklinks](#troubleshooting-quicklinks)
* [Git commands to commit & push README](#git-commands-to-commit--push-readme)

---

## About the Project

SipStop helps people track sober streaks, reflect with mood-tagged notes, and share encouragement via a small community. Built with React Native (Expo) and Firebase, the app focuses on simple logging, gentle encouragement and reflection.

---

## Built With

* **React Native (Expo)** — cross-platform mobile app
* **React** 19.0.0
* **React Native** 0.79.5
* **Expo** \~53.0.20
* **TypeScript**
* **Firebase** ^12.1.0 (Auth, Firestore, Storage)
* **react-native-svg** ^15.12.1 (SVG mood icons)
* **react-navigation** (native-stack) @ ^7.3.23

Other notable libraries:

* `@react-native-async-storage/async-storage` ^1.24.0
* `@react-native-community/datetimepicker` ^8.4.2
* `@react-native-picker/picker` ^2.11.1
* `react-native-toast-message` ^2.3.3

---

## Getting Started

### Prerequisites

* Node.js (v16+)
* npm or yarn
* Expo CLI (optional but recommended): `npm install -g expo-cli`
* Android Studio or Xcode if you want to run on emulator / build natively

### Install & Run (local dev)

1. Clone the repo:

```bash
git clone https://github.com/AnemiB/SipStop.git
cd SipStop
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Add your Firebase config — create `.env` or configure `firebase.ts` depending on your project structure. Example env vars:

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

SipStop is designed to be calm, supportive, and easy to use. Below are the design thinking and artifacts.

### Concept Process

#### Ideation & Challenges

* Focused on low-friction logging: a fast way to log a drink and a short reflection note.
* Encouragement-first UX: gentle copy and personalized messages based on recent activity and note mood.
* Community support: allow users to see community notes and leave supportive comments.

During development, SipStop needed to meet three key challenges:

1. **One-Colour Theme (Pink)**

   * *Challenge*: The UI had to rely on a single primary colour, which can risk feeling flat or overwhelming.
   * *Solution*: We designed with a pink palette, using those shades and tints. This kept the design consistent while still calming and readable.

2. **Real-Time Data**

   * *Challenge*: The app required real-time updates for notes, drink logs, and community content, so users always see the latest data.
   * *Solution*: We integrated Firebase Firestore listeners, ensuring instant updates when a user adds a note, logs a drink, or posts in the community. No manual refresh needed.

3. **Break a Habit**

   * *Challenge*: The goal wasn’t just tracking, it was supporting sobriety and reducing alcohol intake without being judgmental and being able to offer a safe space for this.
   * *Solution*: We implemented a sober time tracker (since last drink), encouragement cards with supportive messages, and mood-tagged reflection notes. This combination helps users stay motivated and build healthier habits over time.

#### ER Diagram

> **Placeholder** — add your ER diagram here when ready.
> `![ER Diagram placeholder](/assets/placeholder-er-diagram.png)`
> *(Replace `/assets/placeholder-er-diagram.png` with your diagram file.)*

#### Wireframes

> **Placeholder** — add wireframe images exported from Figma.
> `![Wireframes placeholder](/assets/placeholder-wireframes.png)`
> *(Replace with real wireframes later.)*

### Custom UI

* **Color Palette**
Shades and tints of #F25077

---

## Development Process

### Implementation Process

#### Frontend

* Built with Expo + React Native + TypeScript.
* Navigation structure: conditional stacks in `App.tsx` that render *Auth* vs *App* stacks based on `onAuthStateChanged`.
* Screens:

  * `Splash`, `LogIn`, `SignUp` (Auth stack)
  * `Home`, `Create`, `Community`, `Settings`, `Drinks` (App stack)
* SVG handling: `react-native-svg-transformer` for importing SVGs as components.

#### Backend / Persistence

* Firebase used for authentication and Firestore for notes and drinks.
* Consider using the Firebase Emulator Suite locally for integration testing before deploying to production.

#### DevOps & Tooling

* Expo for development & testing.
* Metro / packager caching caveats: sometimes requires `expo start -c` or `npx react-native start --reset-cache`.
* Recommended local development flow:

  * `npm run lint` (if configured)
  * `npm test` (Jest unit tests)

### Highlights

* Dynamic encouragement messaging engine that adapts to last drink time, mood, and goal progress.
* Mood-tagged notes with emoji selection implemented using SVG components.
* Simple, minimal UI that’s fast to use for on-the-fly logging.

### Challenges

* React Navigation stack switching: when `onAuthStateChanged` flips `isLoggedIn`, the mounted navigator changes. Avoid `navigation.navigate('LogIn')` in those flows — it will throw route-not-found warnings. Use `navigation.goBack()` or rely on the auth listener.
* SVG `key`-spread warnings: ensure you render imported SVGs as components (`const Icon = HappyOne; <Icon />`) and don’t spread an element’s props directly into `<Svg />`.
* Handling password updates with Firebase requires re-authentication in some cases — account for that in the Settings screen.

### Future Implementation

* Offline support & local caching for notes.
* More community features (likes, threaded comments, anonymity toggle).
* Export streak reports (CSV / shareable badges).
* Mobile store builds & release pipeline (Play Store / App Store).

---

## Final Outcome

### Mockups

> **Placeholders** — replace with exported mockup images.

* `![Mockup 1 placeholder](/assets/placeholder-mockup-1.png)`
* `![Mockup 2 placeholder](/assets/placeholder-mockup-2.png)`
* `![Mockup 3 placeholder](/assets/placeholder-mockup-3.png)`

### Video Demonstration

> **Placeholders** — replace with your demo URLs (Google Drive / Vimeo / YouTube).

* [View Demonstration (placeholder)](REPLACE_ME_VIDEO_LINK)
* 
---

## Conclusion

SipStop delivers a focused, empathetic tool for tracking sobriety progress and reflecting through mood-tagged notes. The app balances simple functionality (fast logging) with supportive UX (encouragement messages and community support).

---

## License

Distributed under the MIT License. See `LICENSE` for details.

---

## Contact

**Anemi Breytenbach** — [231178@virtualwindow.co.za](mailto:231178@virtualwindow.co.za)
GitHub: [AnemiB](https://github.com/AnemiB)

---

## Acknowledgements

* Figma for wireframing and mockups.
* react-native-svg and react-native-svg-transformer for SVG handling.
* Expo / React Native / Firebase open-source projects.
* The open-source community and contributors.
