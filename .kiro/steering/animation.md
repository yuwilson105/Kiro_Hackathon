---
inclusion: always
---

# Animation Standards

Stack: `react-native-reanimated` v4 for all layout-aware animation, `@shopify/react-native-skia` for particles/gradients/flame logo. NativeWind is styling only — no animation utilities.

## Imports

Always import from `react-native-reanimated`, never from `react-native`. Use `Animated.View`, `Animated.Text`, `Animated.ScrollView` from reanimated.

## Motion Tokens

Always import from `@/lib/motion`. Never hardcode durations, easing, or spring configs inline.

```ts
import { ease, duration, spring, enter, stagger } from "@/lib/motion";
```

## Entrance Animations

Use `enter.*` helpers. Pass delay through the helper — never chain `.delay()` externally.

- `enter.fadeUp(delay?)` — most content blocks
- `enter.fade(delay?)` — overlays, sheet contents
- `enter.zoom(delay?)` — icons/badges only, use sparingly
- `enter.sheetUp(delay?)` — modal sheets

## Stagger

Use `stagger(index, base)` for list entrance. Cap index at 8: `Math.min(index, 8)`. Items beyond 8 enter at the same delay as item 8.

## Press Feedback

Every interactive card/button: scale `1 → 0.96` with `spring.press`, paired with `haptics.tap()` on pressIn. Always check `useReducedMotion()` — if true, use opacity-only feedback instead.

## Reduced Motion — Non-Negotiable

Always check `useReducedMotion()` from `react-native-reanimated`. If true:

- Collapse all scale/translate/spring to opacity-only fades
- Zero or near-zero delays
- No loop animations whatsoever

## Skia Rules

- Cache `Skia.Path.MakeFromSVGString(...)` at module scope — never inside render
- Set Canvas size explicitly via `style={{ width, height }}` — never rely on flex
- Import Reanimated hooks from `react-native-reanimated`, not from Skia
- Never create Skia objects inside render cycles

## Flame Behaviors

- **Splash flame:** `loop={false}`, plays once over `duration.splash` (1400ms)
- **Streak flame (Home/check-in):** `loop={true}`, gentle 2-second breath — the only sanctioned loop on those screens

## Forbidden

- `Easing.elastic(...)` or `Easing.bounce` — wrong tone
- `moti` / `MotiView` — dropped from stack
- `import { Animated } from 'react-native'` — use reanimated
- More than 2 looping animations on a single screen
- Chaining `.delay()` on `enter.*` helpers
- Creating Skia objects inside render
- Customizing page transitions unless spec explicitly calls for it
