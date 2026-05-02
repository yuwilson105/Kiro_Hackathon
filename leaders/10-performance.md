# Leader 10 — Performance

> **Audience:** All 24 screen-builder agents. Read this before writing any list, animation, or store access.
> **Goal:** Steady 60 fps on a 3-year-old iPhone (iPhone 12-class hardware). Every pattern below serves that goal.

---

## Stack at a Glance

| Layer | Package | Notes |
|---|---|---|
| Runtime | Hermes + New Architecture (Fabric / TurboModules) | JSI bridge is mostly gone — direct calls |
| Lists | `@shopify/flash-list` v2 | **No FlatList** |
| Animations | Reanimated 4 | Worklets run on UI thread |
| 2D graphics | `@shopify/react-native-skia` | Flame, confetti, charts |
| Styles | NativeWind 4 | Compiled to native styles at build time |
| State | Zustand with persist | AsyncStorage underneath |
| Compiler | React 19.1 Compiler (enabled in `app.json` experiments) | Handles most memoization automatically |

---

## 1. List Rendering

**Rule:** Any vertical list with more than 10 items uses FlashList. Period.

```tsx
import { FlashList } from '@shopify/flash-list';

// Catch Up feed — ~36 items
<FlashList
  data={feedItems}
  renderItem={({ item }) => <FeedCard item={item} />}
  estimatedItemSize={130}
  keyExtractor={(item) => item.id}
/>

// Find Help resources — ~84 items
<FlashList
  data={resources}
  renderItem={({ item }) => <ResourceCard item={item} />}
  estimatedItemSize={180}
  keyExtractor={(item) => item.id}
/>
```

**When plain `map()` inside ScrollView is fine:**
- Plan steps within a single week (3–5 items)
- Onboarding question pills (4–5 options)
- Any static list that will never exceed ~10 items

**Common mistakes → fixes:**

| Mistake | Fix |
|---|---|
| `FlatList` anywhere | Replace with `FlashList` |
| `keyExtractor={(_, index) => index.toString()}` | Use item ID: `keyExtractor={(item) => item.id}` |
| FlashList nested inside a `ScrollView` | FlashList IS the scroll container — remove the wrapper ScrollView |
| `estimatedItemSize` omitted | Measure roughly (ruler or visual estimate), provide a number — doesn't need to be exact, but wrong values cause white flashes during fast scroll |

---

## 2. Re-render Minimization

React Compiler handles the bulk of memoization. Do not sprinkle `useMemo`/`useCallback` pre-emptively — that adds noise and can conflict with the compiler's output. Only add manual memoization when the profiler shows a confirmed hot spot.

### Zustand — always use selectors

```tsx
// CORRECT — component re-renders only when streak changes
const streak = useStore((s) => s.streak);

// WRONG — re-renders on every store mutation, even unrelated ones
const store = useStore();
const { streak } = store;
```

For multiple fields from the same store, batch them with `useShallow`:

```tsx
import { useShallow } from 'zustand/shallow';

const { streak, longestStreak } = useStore(
  useShallow((s) => ({ streak: s.streak, longestStreak: s.longestStreak }))
);
```

### Shared values — never read `.value` during render

```tsx
// WRONG — triggers re-renders and reads stale value
const scale = useSharedValue(1);
return <View style={{ transform: [{ scale: scale.value }] }} />;

// CORRECT
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
return <Animated.View style={animatedStyle} />;
```

---

## 3. Skia Optimization

**Rule:** Parse paths and define paint/gradient/path objects at module scope, not inside the component.

```tsx
import { Skia } from '@shopify/react-native-skia';

// Module scope — parsed once, reused forever
const flamePath = Skia.Path.MakeFromSVGString(
  'M 50 0 C 20 30 10 60 50 80 C 90 60 80 30 50 0'
)!;

export function FlameIcon() {
  // flamePath is already ready — no parsing on every render
  return (
    <Canvas style={{ width: 48, height: 48 }}>
      <Path path={flamePath} color="#FF6B35" />
    </Canvas>
  );
}
```

**Confetti with 80 particles — single shared value, not 80 components:**

```tsx
import { useSharedValue, useDerivedValue, useFrameCallback } from 'react-native-reanimated';

type Particle = { x: number; y: number; rotation: number; opacity: number };

export function ConfettiCanvas({ width, height }: { width: number; height: number }) {
  const particles = useSharedValue<Particle[]>(
    Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * width,
      y: -20 - Math.random() * 100,
      rotation: Math.random() * Math.PI * 2,
      opacity: 1,
    }))
  );

  // All physics on the UI thread — no JS involvement per frame
  useFrameCallback(() => {
    'worklet';
    particles.value = particles.value.map((p) => ({
      ...p,
      y: p.y + 3,
      rotation: p.rotation + 0.05,
      opacity: p.y > height ? 0 : p.opacity,
    }));
  });

  // Single derived value drives one Canvas repaint
  const derived = useDerivedValue(() => particles.value);

  return (
    <Canvas style={{ width, height }}>
      {/* render particles via a single animated Group */}
    </Canvas>
  );
}
```

**Additional Skia rules:**
- Give Canvas explicit `width` and `height` — never rely on flexbox auto-sizing.
- Define paints, gradients, and paths with `useMemo` (if component-scoped) or at module scope (preferred).
- Use `useDerivedValue` to compute Skia transforms from shared values, not `setState`.

---

## 4. Animations

Reanimated 4 worklets run on the UI thread and are inherently fast. The risk is crossing back to the JS thread unnecessarily.

```tsx
// WRONG — runOnJS every frame kills performance
useAnimatedReaction(
  () => progress.value,
  (val) => {
    runOnJS(setProgressState)(val); // bridge crossing every frame
  }
);

// CORRECT — keep everything on the UI thread
const animatedWidth = useDerivedValue(() => progress.value * maxWidth);
const style = useAnimatedStyle(() => ({ width: animatedWidth.value }));
```

**Layout animations** (`LinearTransition`, `FadeIn`, `FadeOut`) are cheap — use freely for list item insertions/removals.

**Property selection:** prefer `transform: [{ scale }, { translateY }]` over animating `width`, `height`, or `padding`. Layout-affecting properties force a layout pass on every frame.

---

## 5. Images

Use `expo-image` for every raster image — it has disk and memory caching built in.

```tsx
import { Image } from 'expo-image';

<Image
  source={require('../assets/onboarding-illustration.png')}
  style={{ width: 280, height: 200 }}  // explicit — avoid layout thrash
  contentFit="contain"
/>
```

Preload images that appear after a tap (e.g. onboarding illustrations on the next screen):

```tsx
import { Image } from 'expo-image';
Image.prefetch([require('../assets/step-2.png')]);
```

Skia handles the flame and confetti — no PNG needed for those.

---

## 6. Store Persistence

AsyncStorage writes are async; the persist middleware batches them. Protect it from high-frequency updates:

```tsx
// WRONG — store write on every keystroke
<TextInput onChangeText={(t) => setNote(t)} />  // setNote = zustand action

// CORRECT — local state first, persist on blur/submit
const [localNote, setLocalNote] = useState(note);
<TextInput
  value={localNote}
  onChangeText={setLocalNote}
  onBlur={() => setNote(localNote)}  // single store write
/>
```

The hydration gate lives in `app/_layout.tsx` (`useStoreHydrated`). Never read store state before hydration completes — you will get default/empty values and cause subtle bugs.

---

## 7. Navigation

Expo Router lazy-loads routes automatically via the file system. Do not import screen components at the root layout — that defeats lazy loading and increases startup JS bundle size.

Move heavy work out of a screen's top-level synchronous scope:

```tsx
// WRONG — runs synchronously before first paint
const parsed = JSON.parse(rawData); // heavy
export default function MyScreen() { ... }

// CORRECT — deferred
export default function MyScreen() {
  const parsed = useMemo(() => JSON.parse(rawData), [rawData]);
  ...
}
```

---

## 8. Component Structure

- Keep components under 200 lines. Smaller components give the React Compiler more surface area to optimize.
- Extract pure presentational pieces (cards, badges, pills) into their own files.
- Pass only the props a child actually needs — never pass the entire store object or a large parent state bag.

```tsx
// WRONG
<StepCard store={store} />

// CORRECT
<StepCard title={step.title} completed={step.completed} onPress={handlePress} />
```

---

## 9. NativeWind

`className` strings compile to native styles at build time — zero runtime overhead. Dynamic classes via template literals or arrays are fine.

```tsx
// Fine — computed at build time, no runtime style object
<View className={`rounded-xl p-4 ${isActive ? 'bg-orange-500' : 'bg-gray-800'}`} />

// Avoid when className suffices
<View style={{ borderRadius: 12, padding: 16, backgroundColor: isActive ? '#f97316' : '#1f2937' }} />
```

---

## 10. Bottom Sheet

The `BottomSheetModal` provider is mounted once at root in `app/_layout.tsx`. Do not mount a second provider per screen.

Use `BottomSheetModal` (imperative `.present()` call) — not `BottomSheet` which stays permanently mounted in the tree.

```tsx
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';

const { present } = useBottomSheetModal();
// ...
<Button onPress={() => present('mySheet')} />
<BottomSheetModal ref={ref} snapPoints={['60%']}>
  {/* lazy content — only rendered when open */}
</BottomSheetModal>
```

If the sheet's internal content has its own scroll list, set `enableContentPanningGesture={false}`.

---

## 11. Keyboard

`KeyboardProvider` from `react-native-keyboard-controller` is mounted at root. On any screen with text inputs, wrap with `KeyboardAwareScrollView`:

```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function JournalEntryScreen() {
  return (
    <KeyboardAwareScrollView>
      <TextInput multiline ... />
    </KeyboardAwareScrollView>
  );
}
```

Do not use `KeyboardAvoidingView` — it has known bugs on RN 0.81.

---

## 12. Startup

The splash screen stays up until both fonts are loaded **and** the store is hydrated. The flame animation plays during this window — do not extend its duration beyond 1.4 s. All provider setup and gating logic goes in `app/_layout.tsx`; heavy work does not.

---

## 13. Profiling Tools

- **Frame drops:** React Native Performance tab in Chrome DevTools (via Expo dev client).
- **Skia:** Enable `Skia.PaintDebug` when investigating Canvas performance.
- **Lists:** Fast-scroll white flashes = wrong `estimatedItemSize` or missing FlashList.
- **Re-renders:** React DevTools Profiler — look for components highlighted on every action.
- **Store access:** `useStore()` without a selector will appear as a broad re-render across many components — easy to spot.

---

## 14. What Not to Build

| Do not | Because |
|---|---|
| Synchronous network requests (blocking UI thread) | No backend today; if you add `fetch`, always `await` in a non-blocking context |
| Polyfills for APIs RN 0.81 already supports | Bloats the bundle |
| Custom virtualization / windowing logic | FlashList handles it |
| Pre-emptive `useMemo`/`useCallback` everywhere | React Compiler already does this; manual wrapping adds noise |
| `FlatList` | Use FlashList |
| 80 separate animated components for confetti | Single shared value + single Canvas |

---

## 15. Self-Review Checklist (run before marking a screen done)

1. [ ] Lists with more than 10 items use `FlashList` with a numeric `estimatedItemSize`.
2. [ ] `keyExtractor` uses item ID, not array index.
3. [ ] No `FlashList` nested inside a `ScrollView`.
4. [ ] Every Zustand access uses a selector: `useStore((s) => s.field)`.
5. [ ] No `const store = useStore()` pattern anywhere in the file.
6. [ ] Skia paths, paints, and gradients are defined at module scope or in `useMemo` — not inline in JSX.
7. [ ] No `runOnJS` inside animation worklets unless there is no alternative (and it is documented why).
8. [ ] No animated `width`/`height`/`padding` — use `transform: [{ scale }, { translateY }]` instead.
9. [ ] All raster images use `expo-image` with explicit width and height.
10. [ ] Text input values live in local `useState`; the Zustand store is written on blur/submit, not on every keystroke.

---

*Leader 10 — Performance. Questions about a specific screen's list size or animation approach? Check this doc first; if it still isn't covered, flag in the shared coordination thread.*
