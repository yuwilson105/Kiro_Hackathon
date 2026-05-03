---
inclusion: always
---

# UI Standards

The following steering files are always active and contain the full standards for this project:

- `animation.md` — Reanimated and Skia animation patterns
- `interactions.md` — press states, haptics, gestures, navigation
- `accessibility.md` — a11y requirements, contrast, screen reader
- `color-typography.md` — color tokens, surface hierarchy, font sizes and weights
- `copy-voice.md` — tone, banned phrases, companion response structure
- `motion-physics.md` — spring configs, easing, duration tokens, stagger
- `performance.md` — FlashList, Zustand selectors, Skia optimization

For detailed formatting rules see `formatting.md`. For the full anti-slop checklist and 20 forbidden patterns see `anti-slop.md`.

## Non-negotiable rules

- Never use `shadow-lg` + `rounded-xl` card pattern
- Never use gradient blobs, glassmorphism on more than one element per screen, or Lottie confetti
- Never use `font-bold` or italic — they are not loaded
- Never use `any` type
- Never use relative `../` imports — always `@/`
- Never add `<View className="h-[n]" />` spacers — use padding/gap on parent
- Border OR shadow on a card, never both
- One filled `bg-primary` button per screen maximum
- All copy must pass the anti-slop checklist in `leaders/03-anti-ai-slop.md`
