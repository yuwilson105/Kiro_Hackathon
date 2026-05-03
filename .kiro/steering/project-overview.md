---
inclusion: always
---

# Project: Second Chance

A React Native / Expo mobile app (Expo Router, NativeWind, TypeScript) for people rebuilding their lives after incarceration. The app helps users manage documents, track check-ins, plan milestones, and access resources.

## Stack

- Expo SDK with Expo Router (file-based routing)
- NativeWind 4 (Tailwind for React Native)
- React Native Reanimated + Skia for animations
- Zustand for state management
- TypeScript (strict mode)

## Key conventions

- `@/` alias resolves from project root — always use it, never relative `../` imports
- No barrel exports (`index.ts` files)
- `export function` only — no `export default`, no `React.FC`
- Props typed as `type Props = { ... }` directly above the component
- No `any` types ever
- File length cap: ~250 lines

## Directory structure

- `app/` — Expo Router screens
- `components/<screen-name>/` — screen-specific components
- `components/ui/` — shared primitives
- `lib/` — theme, motion, haptics, store, utilities
- `leaders/` — design system standards (read before writing UI)
- `types/` — shared TypeScript types
