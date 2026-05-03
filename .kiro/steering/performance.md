---
inclusion: always
---

# Performance

Target: steady 60fps on iPhone 12-class hardware.

## Lists

- Any vertical list with more than 10 items uses `FlashList` from `@shopify/flash-list` — never `FlatList`
- Always provide a numeric `estimatedItemSize` (measure a representative item)
- `keyExtractor` uses item ID, never array index
- Never nest `FlashList` inside a `ScrollView` — FlashList IS the scroll container
- ≤10 items: plain `map()` inside `ScrollView` is fine

## Zustand — Always Use Selectors

```ts
// CORRECT
const streak = useStore((s) => s.streak);

// WRONG — re-renders on every store mutation
const store = useStore();
```

For multiple fields, use `useShallow`:

```ts
import { useShallow } from "zustand/shallow";
const { streak, plan } = useStore(
  useShallow((s) => ({ streak: s.streak, plan: s.plan })),
);
```

Never read store state before hydration completes (`useStoreHydrated()` in `app/_layout.tsx`).

## Reanimated

- Never read `.value` during render — always use `useAnimatedStyle`
- Never `runOnJS` inside worklets unless there is no alternative
- Animate `transform` (scale, translateY) — never animate `width`, `height`, or `padding` directly

## Skia

- Define paths, paints, and gradients at module scope — never inside render or hooks
- Give Canvas explicit `width` and `height` — never rely on flex sizing
- Use `useDerivedValue` to compute transforms from shared values, not `setState`
- 80 confetti particles: one shared value array + one Canvas, not 80 separate components

## Images

- Use `expo-image` for all raster images — has disk and memory caching built in
- Always provide explicit `width` and `height` on Image components
- Preload images that appear after a tap: `Image.prefetch([...])`

## Store Persistence

- Text inputs: local `useState` first, write to Zustand store on blur/submit — never on every keystroke

## Memoization

- React 19.1 Compiler handles most memoization automatically
- Do not add `useMemo`/`useCallback` pre-emptively — only when profiler shows a confirmed hot spot

## Bottom Sheet

- `BottomSheetModal` provider mounted once at root in `app/_layout.tsx` — never per-screen
- Use `BottomSheetModal` (imperative `.present()`) not `BottomSheet` (always mounted)

## Forbidden

- `FlatList` anywhere — use `FlashList`
- `keyExtractor={(_, index) => index.toString()}`
- `FlashList` nested inside `ScrollView`
- `const store = useStore()` without a selector
- Skia objects created inside render cycles
- `runOnJS` in worklets without documented justification
- Animating `width`/`height`/`padding` — use `transform` instead
- `KeyboardAvoidingView` from React Native — use `react-native-keyboard-controller`
