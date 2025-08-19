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

---

## Built With

- **React Native (Expo)** — cross-platform mobile app
- **React** 19.0.0
- **React Native** 0.79.5
- **Expo** ~53.0.20
- **TypeScript**
- **Firebase** ^12.1.0 (Auth, Firestore, Storage)
- **react-native-svg** ^15.12.1 (SVG nav icons)
- **react-navigation** (native-stack) @ ^7.3.23
- Other notable libraries:
  - `@react-native-async-storage/async-storage` ^1.24.0
  - `@react-native-community/datetimepicker` ^8.4.2
  - `@react-native-picker/picker` ^2.11.1
  - `react-native-toast-message` ^2.3.3

---

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
