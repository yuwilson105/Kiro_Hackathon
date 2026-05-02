# Second Chance

Mobile companion for people coming home from incarceration. Sequenced, adaptive life plan delivered daily — real local resources, real cultural reorientation, real check-ins. Built for the Kiro Hackathon.

## Stack

- Expo SDK 54 + Expo Router 6 + React Native 0.81 (new architecture)
- TypeScript strict, NativeWind 4 (Tailwind), Reanimated 4, Skia
- Zustand + AsyncStorage (persisted state, frontend-only)

## Run it

```bash
npm install
npx expo start --ios     # opens iPhone Simulator (requires Xcode)
npx expo start           # then scan QR with Expo Go on a physical phone
```

## Dev menu

Tap the **⚙ Dev menu** pill at the bottom of the Home screen (or long-press the streak badge) to:
- Restart onboarding
- Skip onboarding with a fake "Marcus" profile + generated plan
- Jump to any tab or modal
- Trigger the milestone celebration

## Layout

- `app/` — Expo Router routes (splash, onboarding, tabs, modals)
- `components/` — UI atoms, screen-specific components, Skia animations
- `lib/` — theme, motion tokens, Zustand store, plan generator, AI companion voice
- `lib/mock/` — plan DAG, cultural feed, local resources, companion seeds
- `leaders/` — design + engineering standards docs (formatting, animation, copy/voice, accessibility, etc.)
