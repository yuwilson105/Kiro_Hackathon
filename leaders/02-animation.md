# Leader 02 — Animation Standards

**Audience:** All 24 screen-builder agents.  
**Read this before writing a single animated line.**  
**SecondChance tone:** warm, human, grounded. Animations must feel inevitable — not decorative, not playful in ways that undercut the seriousness of the audience. Someone coming home from incarceration deserves motion that respects them.

---

## 0. Stack at a Glance

| Library | Role |
|---|---|
| `react-native-reanimated` v4 | All layout-aware animation: enter, press, list, page |
| `react-native-worklets` | Auto-included via `babel-preset-expo`; powers worklet execution |
| `@shopify/react-native-skia` | Particles, gradients, complex shapes, flame logo |
| NativeWind 4 | Styling only — no animation utilities |

Expo SDK 54.0.33 · React Native 0.81 new arch · worklets plugin auto-included.

---

## 1. Imports — Always from `react-native-reanimated`

**DO:**
```ts
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
```

**DON'T:**
```ts
// WRONG — this is the legacy RN Animated API
import { Animated } from 'react-native';

// WRONG — dropped from the stack
import { MotiView } from 'moti';
```

Use `Animated.View`, `Animated.Text`, `Animated.ScrollView` from reanimated, not from React Native.

---

## 2. Motion Tokens — `lib/motion.ts`

Always import from `@/lib/motion`. Never hardcode durations, easing curves, or spring configs inline.

```ts
import { ease, duration, spring, enter, stagger } from '@/lib/motion';
```

### Available tokens

```ts
// Easing
ease.out     // Bezier(0.22, 1, 0.36, 1)   — most common
ease.inOut   // Bezier(0.65, 0, 0.35, 1)
ease.gentle  // Bezier(0.25, 0.46, 0.45, 0.94)
ease.snap    // Bezier(0.4, 0, 0.2, 1)

// Duration (ms)
duration.micro   // 160
duration.short   // 240
duration.medium  // 360
duration.long    // 520
duration.splash  // 1400  — splash flame only
duration.building // 2400 — progress meters only

// Springs
spring.snap     // { damping: 18, stiffness: 280, mass: 0.7 }
spring.gentle   // { damping: 22, stiffness: 180, mass: 1 }
spring.press    // { damping: 15, stiffness: 320, mass: 0.6 }
spring.bouncy   // { damping: 12, stiffness: 200, mass: 0.8 }

// Entrance helpers — return a Reanimated entering value
enter.fadeUp(delay?)    // FadeInDown + ease.out
enter.fadeDown(delay?)  // FadeInUp + ease.out
enter.fade(delay?)      // FadeIn + ease.out
enter.zoom(delay?)      // ZoomIn + ease.out
enter.sheetUp(delay?)   // SlideInDown + ease.out (modal sheets)
enter.sheetDown(delay?) // SlideInUp + ease.out

// Stagger
stagger(index, base = 60) // returns delay ms: index * base
```

---

## 3. Entrance Animations

Use the `enter` helpers. Pass delay through the helper — **never chain `.delay()` externally**.

**DO:**
```tsx
<Animated.View entering={enter.fadeUp(120)}>
  <Card />
</Animated.View>

<Animated.View entering={enter.fade(0)}>
  <SectionHeader />
</Animated.View>

{/* Sheet / bottom drawer */}
<Animated.View entering={enter.sheetUp(0)}>
  <CheckInSheet />
</Animated.View>
```

**DON'T:**
```tsx
// WRONG — chaining delay externally
<Animated.View entering={FadeInDown.duration(360).delay(120)}>

// WRONG — hardcoded easing
<Animated.View entering={FadeInDown.easing(Easing.elastic(1.2))}>
```

Default to `fadeUp` for most content blocks. Use `fade` for overlays and utility elements. Use `zoom` sparingly — only for icons or badges that benefit from a focal pop.

---

## 4. List Entrance with Stagger

Use `stagger(i)` for index-based delays. Cap visible-item stagger at **8 items** — beyond that, the rest enter at the same delay as item 8 to avoid perceived lag.

**Reference example — entering list with stagger and LinearTransition:**

```tsx
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { enter, stagger } from '@/lib/motion';

type Props = { items: Task[] };

export function TaskList({ items }: Props) {
  const reduced = useReducedMotion();

  return (
    <Animated.FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const cappedIndex = Math.min(index, 8);
        const delay = reduced ? 0 : stagger(cappedIndex);
        const entering = reduced
          ? enter.fade(delay)
          : enter.fadeUp(delay);

        return (
          <Animated.View
            entering={entering}
            layout={LinearTransition.springify().damping(22)}
          >
            <TaskCard task={item} />
          </Animated.View>
        );
      }}
    />
  );
}
```

For layout reorder and item resize, always wrap `Animated.View` items with:
```tsx
layout={LinearTransition.springify().damping(22)}
```
This matches `spring.gentle` damping and feels unhurried — appropriate for this audience.

---

## 5. Press Feedback — Scale + Haptic

Every interactive card or button gets press feedback via `useSharedValue` + `useAnimatedStyle` + `withSpring`. Always pair with a haptic.

**Reference example — pressable card with scale + haptic + reduced-motion fallback:**

```tsx
'use client'; // not needed in RN — just use the component directly

import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { spring } from '@/lib/motion';
import { haptics } from '@/lib/haptics';

type Props = {
  onPress: () => void;
  children: React.ReactNode;
};

export function PressableCard({ onPress, children }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) {
      // Reduced motion: opacity-only, no scale/translate
      return { opacity: opacity.value };
    }
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    haptics.tap(); // always pair with haptic
    if (reduced) {
      opacity.value = withSpring(0.75, spring.press);
    } else {
      scale.value = withSpring(0.96, spring.press);
    }
  };

  const handlePressOut = () => {
    if (reduced) {
      opacity.value = withSpring(1, spring.press);
    } else {
      scale.value = withSpring(1, spring.press);
    }
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

**DON'T:**
```tsx
// WRONG — elastic spring on press, feels clownish
scale.value = withSpring(0.96, { damping: 4, stiffness: 400 });

// WRONG — no haptic
// Missing haptics.tap() on pressIn

// WRONG — using RN Animated instead of reanimated
const scale = new Animated.Value(1);
```

---

## 6. Reduced Motion — Non-Negotiable

**Always** check `useReducedMotion()` from `react-native-reanimated`. If it returns `true`:

- Collapse all scale/translate/spring to **opacity-only fades**.
- Still allow `withTiming` for opacity.
- Zero or near-zero delays.
- No loop animations whatsoever.

```tsx
const reduced = useReducedMotion();

// Entering
const entering = reduced ? enter.fade(0) : enter.fadeUp(stagger(index));

// Loop guard
useEffect(() => {
  if (reduced) return; // bail immediately
  breath.value = withRepeat(...);
}, [reduced]);
```

This is not optional. Accessibility is a core requirement for this app's audience, which includes users on older devices in resource-constrained environments.

---

## 7. Skia vs. Reanimated — When to Use Which

| Use Reanimated for | Use Skia for |
|---|---|
| Layout-aware animations | Particles and confetti |
| List transitions | Gradient fills and blends |
| Press states | Complex SVG-path animation |
| Page enter/exit | The flame logo |
| Layered View opacity/scale/translate | Anything needing 60fps outside the layout tree |
| Sheet slide-ins | Milestone celebration effects |

**Rule of thumb:** If it touches a `View` with layout implications, use Reanimated. If it's purely visual and lives inside a `Canvas`, use Skia.

---

## 8. Skia Rules

### Always

- Use `useSharedValue` and `useDerivedValue` **from `react-native-reanimated`** (not from Skia internals). They integrate correctly.
- Cache `Skia.Path.MakeFromSVGString(...)` **outside the component** at module scope — never inside render or a hook.
- Set `Canvas` size explicitly via `style={{ width, height }}` — never rely on flex to size a Canvas.
- Compute all derived values in `useDerivedValue` worklets, not in render.

### Never

- Create new Skia objects (`Skia.Path.Make()`, `Skia.Paint()`, etc.) inside a render cycle or `useAnimatedStyle`.
- Import Reanimated hooks from Skia's own package — always import from `react-native-reanimated`.

```tsx
// DO — cached at module scope
const flamePath = Skia.Path.MakeFromSVGString('M50 6 C56 22...')!;

// DON'T — created on every render
function BadFlame() {
  const path = Skia.Path.MakeFromSVGString('...'); // WRONG
}
```

---

## 9. Confetti Pattern — Milestone Celebrations

Use 60–100 particles. Each particle gets its own shared values. Colors are **peach `#F0B27A`** (accent) and **sage `#88B17A`** (success) — the app's warmth and growth colors. No blue, no red.

**Reference sketch — Skia confetti (~30 lines):**

```tsx
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { useSharedValue, useDerivedValue, withTiming, withDelay } from 'react-native-reanimated';
import { duration } from '@/lib/motion';

const COLORS = ['#F0B27A', '#88B17A', '#F8D5B3', '#5F8A53'];
const COUNT = 80;

// Pre-compute random starting positions at module scope
const particles = Array.from({ length: COUNT }, (_, i) => ({
  x: Math.random() * 390,
  startY: -20 - Math.random() * 60,
  endY: 780 + Math.random() * 80,
  color: COLORS[i % COLORS.length],
  r: 4 + Math.random() * 4,
  delay: i * 18,
}));

export function Confetti({ visible }: { visible: boolean }) {
  const progress = particles.map(() => useSharedValue(0));
  const opacities = particles.map(() => useSharedValue(0));

  useEffect(() => {
    if (!visible) return;
    particles.forEach((_, i) => {
      progress[i].value = withDelay(particles[i].delay,
        withTiming(1, { duration: duration.long + particles[i].delay })
      );
      opacities[i].value = withDelay(particles[i].delay, withTiming(1, { duration: 80 }));
    });
  }, [visible]);

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: 390, height: 844 }} pointerEvents="none">
      {particles.map((p, i) => {
        const cy = useDerivedValue(() =>
          p.startY + (p.endY - p.startY) * progress[i].value
        );
        const opacity = useDerivedValue(() => opacities[i].value);
        return (
          <Group key={i} opacity={opacity}>
            <Circle cx={p.x} cy={cy} r={p.r} color={p.color} />
          </Group>
        );
      })}
    </Canvas>
  );
}
```

---

## 10. Splash Flame — One-Shot, Not a Loop

The splash-screen flame plays **once** over `duration.splash` (1400ms): a single rise-and-bloom, then fades out. `loop={false}` on `FlameLogo`.

```tsx
// app/splash.tsx — correct usage
<FlameLogo size={120} loop={false} />
```

**Do not** set `loop={true}` on the splash. It is a threshold moment — you do not repeat a threshold.

After the splash completes, the element should fade out (opacity 0, `duration.short`), then navigate. Do not linger.

---

## 11. Streak Flame — Gentle Pulse Loop

The Home screen and check-in sheet header use a **looping** `FlameLogo` at ~60–80px. This is the only sanctioned loop on those screens.

```tsx
// components/home/streak-header.tsx
<FlameLogo size={64} loop={true} />
```

The loop is a gentle 2-second breath (`withRepeat` + `withSequence`, already implemented in `FlameLogo`). Do not add a second loop animation elsewhere on the same screen.

---

## 12. Forbidden Patterns

These are hard bans. Do not use them, do not approximate them.

| Forbidden | Why |
|---|---|
| `Easing.elastic(...)` | Feels like a toy app |
| `Easing.bounce` | Same — disrespects the tone |
| `moti` / `MotiView` | Dropped from the stack |
| `import { Animated } from 'react-native'` | Legacy API — use reanimated |
| More than 2 looping animations on a single screen | Visual noise, drains battery |
| Generic "wobble" spring entrances | Template-app feel |
| Chaining `.delay()` on an `enter.*` helper | Use the helper's own delay param |
| Creating Skia objects inside render | Causes GC churn and frame drops |

---

## 13. Page Transitions

**Do not customize** per-screen unless the spec explicitly calls for it. Expo Router's native iOS stack push is correct for standard navigation. Override only for:

- `modal` — bottom sheet presentation
- `fullScreenModal` — full-cover modal (rare)

If you find yourself writing a custom `Transition` for a standard push route, stop and check the spec first.

---

## 14. Component Naming and Location

All animated components live in **`components/animations/`** and are named in PascalCase.

```
components/
  animations/
    FlameLogo.tsx       ← exists
    Confetti.tsx        ← milestone celebration
    StreakFlame.tsx      ← home + check-in header (wraps FlameLogo loop=true)
    ShimmerLoader.tsx   ← skeleton loading state
    PressableCard.tsx   ← reusable press wrapper
```

Do not scatter animated components into screen folders. If you build a reusable animated primitive, it belongs in `components/animations/`.

---

## 15. Quick Checklist Before Committing Animated Code

- [ ] Imported from `react-native-reanimated`, not `react-native`
- [ ] Duration and easing from `lib/motion` — no inline magic numbers
- [ ] `useReducedMotion()` checked; reduced path collapses to opacity-only
- [ ] Press interactions paired with `haptics.tap()` or `haptics.select()`
- [ ] No `Easing.elastic`, `Easing.bounce`, or `moti`
- [ ] Loop animations: 2 max per screen
- [ ] Skia paths cached at module scope, not inside components
- [ ] `Canvas` has explicit width/height
- [ ] Stagger capped at index 8
- [ ] Splash flame: `loop={false}`; Streak flame: `loop={true}`
- [ ] No `.delay()` chained on `enter.*` helpers

---

## 16. Color Reference (Animation-Relevant)

```ts
colors.accent       // '#F0B27A' — peach, warmth, confetti
colors.success      // '#88B17A' — sage, growth, confetti
colors.accentDeep   // '#D88947' — flame gradient outer
colors.danger       // '#C77B7B' — flame gradient edge (tip only)
colors.primary      // '#6FA8DC' — interactive states
colors.text         // '#1F2D3D' — shadow base for spring configs
```

Never introduce new animation colors outside this palette without a design sign-off.

---

*Leader 02 — Animation. SecondChance hackathon build.*
