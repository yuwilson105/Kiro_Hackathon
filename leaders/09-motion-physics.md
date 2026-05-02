# Leader 09 — Motion Physics

**Audience:** All 24 screen-builder agents.
**Read after 02-animation.md.** That doc covers WHAT to animate. This doc covers HOW it should feel — spring selection, easing selection, duration selection, and per-surface choreography.

**Tone mandate:** Motion must feel inevitable and human. The audience is rebuilding their life. Nothing should bounce or showboat. Every physics decision is a design decision.

---

## 0. Relationship to 02-Animation

| 02-Animation answers | 09-Motion-Physics answers |
|---|---|
| Which elements get animated? | Which spring / easing / duration? |
| How to write entering props? | When does each token apply? |
| Press feedback pattern? | What are the exact physics params and timing? |
| Stagger pattern? | Cap, cadence, when to suppress re-stagger? |
| Confetti pattern? | Exact particle physics, velocity, gravity, lifetime? |

Always consult 02 first for the code patterns. Come here for the specific values.

---

## 1. Spring Selection Decision Tree

When you are choosing a spring config, answer this question: **what is being animated?**

```
I am animating...

├── A BUTTON PRESS / CARD PRESS (scale 1 → 0.96)
│   └── spring.press  { damping: 15, stiffness: 320, mass: 0.6 }
│       Snappy in, snappy return. Feels decisive.
│
├── A PILL / CHIP SELECTION (chip scale 1 → 0.97 → 1)
│   └── spring.snap   { damping: 18, stiffness: 280, mass: 0.7 }
│       More pronounced settle than press. Clear acknowledgment.
│
├── A PAGE TRANSITION or FAB POSITION CHANGE
│   └── spring.gentle { damping: 22, stiffness: 180, mass: 1 }
│       Soft, longer settle. Nothing urgent.
│
├── A LAYOUT TRANSITION (list reorder, item resize)
│   └── LinearTransition.springify().damping(22)
│       Matches spring.gentle damping. Unhurried.
│
├── A BOTTOM SHEET (open / close)
│   └── DO NOT override. gorhom-bottom-sheet manages its own spring internally.
│       Adding your own spring fights theirs. Leave it alone.
│
└── A MILESTONE "YOU DID IT" CELEBRATION
    └── spring.bouncy { damping: 12, stiffness: 200, mass: 0.8 }
        THE ONLY PLACE spring.bouncy is permitted. It signals exceptional.
        Using it anywhere else dilutes the milestone moment.
```

**Hard rule:** `spring.bouncy` appears in exactly one place in the codebase — the milestone celebration screen. If you find yourself reaching for it elsewhere, choose `spring.snap` instead.

---

## 2. Easing Selection Decision Tree

```
I am easing...

├── A PAGE ENTRANCE (entering={...} prop)
│   └── ease.out   Bezier(0.22, 1, 0.36, 1)
│       Decelerates to rest. Feels like it arrived.
│       Already baked into all enter.* helpers — you get this for free.
│
├── A PAGE EXIT (exiting={...} prop)
│   └── ease.inOut   Bezier(0.65, 0, 0.35, 1)
│       Accelerates then decelerates. Leaves with intention.
│
├── A SKIA LOOP ANIMATION (flame breath, streak pulse)
│   └── Easing.inOut(Easing.quad)   — inline, not from ease token
│       Smooth symmetric oscillation. Import Easing from react-native-reanimated.
│
├── A SKIA ONE-SHOT (splash bloom, milestone bloom)
│   └── Easing.out(Easing.cubic)   — inline
│       Strong deceleration. Makes the bloom feel weighty.
│
├── A COLOR or OPACITY TRANSITION (bg swap, tint change)
│   └── ease.snap   Bezier(0.4, 0, 0.2, 1)
│       Precise snap. Color changes shouldn't linger.
│
├── A CONTINUOUS SPINNER / PROGRESS INDICATOR
│   └── Easing.linear   — only acceptable use
│       We currently have no spinners. If one appears, this is correct.
│
└── ANYTHING ELSE
    └── Default to ease.out. If you are unsure, ease.out is right.
```

**Forbidden easing, no exceptions:**
- `Easing.elastic(...)` — toy-app feel, disrespectful to the tone
- `Easing.bounce` — same reason
- `Easing.linear` on anything except a true continuous loop

---

## 3. Duration Selection Decision Tree

```
I am timing...

├── A COLOR FLIP / OPACITY FLICKER / PRESSED-STATE ONSET
│   └── duration.micro   160ms
│       Imperceptible delay, instant perception of response.
│
├── A BUTTON PRESS SCALE RETURN / SMALL STATE CHANGE (badge count, icon swap)
│   └── duration.short   240ms
│       Quick, but not jarring.
│
├── A CARD ENTRANCE / LIST ITEM APPEAR / TAB CHANGE VISUAL
│   └── duration.medium   360ms
│       The default. Most content transitions live here.
│
├── A FULL PAGE TRANSITION
│   └── duration.long   520ms
│       Matches native iOS push. Do not go longer on standard nav.
│
├── THE SPLASH FLAME ANIMATION
│   └── duration.splash   1400ms
│       Splash screen only. This is a threshold moment, not a loader.
│
└── THE "BUILDING YOUR PLAN" PROGRESS TRANSITION
    └── duration.building   2400ms
        The plan-generation wait state only.
```

**Upper limit rule:** No UI element that the user interacts with should animate for longer than `duration.long` (520ms). Anything beyond that is either splash-class or building-class — both have named tokens. If you need more than 520ms, question the design, not the token.

---

## 4. Stagger Rules

```ts
stagger(index, base = 60)  // returns index * base in ms
```

**Default cadence (60ms):** Standard list entrance. Smooth wave.

**Slower cadence (80ms):** Home task cards — slightly more deliberate, signals these items matter.

**Faster cadence (40–50ms):** Catch-up feed, Find Help resource cards — lots of items, tighter wave prevents perceived lag.

**Cap rule:** Cap `index` at `Math.min(index, 8)` before passing to `stagger()`. Items 9+ enter at the same delay as item 8. Users never see the tail of a long list stagger — they scroll. Avoid making them wait.

```ts
const cappedIndex = Math.min(index, 8);
const delay = stagger(cappedIndex, 60);
```

**Re-render rule:** When a list re-renders due to a filter change or sort change, do NOT re-apply stagger entrance animations. Use `LinearTransition.springify().damping(22)` on existing items only. The items already exist — they reposition, they don't re-arrive.

**Stagger on static groups:** For a small fixed group of sibling elements (e.g., quick-access tiles), stagger is fine even without a FlatList. Just apply `entering={enter.fadeUp(stagger(i, 50))}` per item directly.

---

## 5. Entrance Animations Per Surface

Each surface below specifies the token, delay, and rationale. Follow these exactly — do not improvise per-screen choreography.

### 5a. Splash Screen

| Element | Token | Delay | Notes |
|---|---|---|---|
| Flame logo | `enter.zoom(80)` | 80ms | Small initial pause before the flame appears — lets the bg settle |
| "Second Chance" wordmark | `enter.fadeUp(420)` | 420ms | After the flame has bloomed and partially settled |

The splash flame animation itself is `duration.splash` (1400ms) internally. After the flame animation completes, the whole screen fades out with `duration.short` and navigation fires.

### 5b. Onboarding

| Element | Token | Delay | Notes |
|---|---|---|---|
| Step header / question title | `enter.fadeUp(0)` | 0ms | Immediate — this is what the user needs to read |
| Question cards | `enter.fadeUp(stagger(i))` | i × 60ms | Each option card staggers in at 60ms cadence |

On step transition (forward / back), the outgoing step exits via native navigation reverse. The new step's elements enter fresh. Do not animate the step header twice on the same mount.

### 5c. Home Screen

Full choreography — this is the reference sequence. Every number is load-bearing.

| Frame | Element | Token | Delay |
|---|---|---|---|
| 0ms | Navigator pushes /tabs | — | — |
| 0–360ms | Greeting card | `enter.fadeUp(0)` | 0ms |
| 80–440ms | Streak badge | `enter.fadeUp(80)` | 80ms |
| 200–560ms | First task card | `enter.fadeUp(200)` | 200ms |
| 280–640ms | Second task card | `enter.fadeUp(280)` | 280ms |
| 360–720ms | Third task card | `enter.fadeUp(360)` | 360ms |
| 560–920ms | Week strip | `enter.fade(560)` | 560ms |
| 720–1080ms | Quick-access tile 0 | `enter.fadeUp(720)` | 720ms |
| 770–1130ms | Quick-access tile 1 | `enter.fadeUp(770)` | 770ms |

Total perceived entrance: ~1.1s. Feels orchestrated, not a wall of motion.

The task cards use a slightly slower cadence (80ms between cards) intentionally — they are the most important items on the screen and deserve individual acknowledgment.

### 5d. Plan Screen

| Element | Token | Delay | Notes |
|---|---|---|---|
| Week section headers | `enter.fadeUp(stagger(i))` | i × 60ms | One section = one index |
| Step cards within a week | `enter.fadeUp(stagger(i, 50))` | i × 50ms | Slightly tighter — steps within a week read as a group |

Week sections stagger relative to each other. Step cards stagger within their section. Do not combine the two stagger offsets — week section delay and step card delay are independent.

### 5e. Catch-Up Feed

| Element | Token | Delay | Notes |
|---|---|---|---|
| Feed cards | `enter.fadeUp(stagger(i, 40))` | i × 40ms | Faster cadence — feed items are numerous, 40ms keeps momentum |

Cap at index 8 as always. The fast cadence makes a long feed feel alive without feeling overwhelming.

### 5f. Find Help Screen

| Element | Token | Delay | Notes |
|---|---|---|---|
| Resource cards | `enter.fadeUp(stagger(i, 50))` | i × 50ms | Mid-cadence — these are important, not throwaway |

### 5g. Bottom Sheet Contents

| Element | Token | Delay | Notes |
|---|---|---|---|
| Sheet container | Managed by gorhom | — | Do not add entering to the sheet itself |
| Contents inside sheet | `enter.fade(0)` | 0ms | Sheet handles the slide; contents just fade in immediately |

The sheet already slides up with its own spring. Adding a `fadeUp` inside competes visually. Use `enter.fade(0)` for all direct children of a bottom sheet.

### 5h. Milestone Celebration Screen

Full choreography — load-bearing:

| Frame | Element | Token | Delay |
|---|---|---|---|
| 0ms | Full-screen modal mounts | — | — |
| 0–1600ms | Confetti particles emit | Skia physics (see §9) | — |
| 200–1600ms | Flame bloom | Skia one-shot (see §8c) | 200ms |
| 600–960ms | Title "You got your ID." | `enter.fadeUp(600)` | 600ms |
| 900–1260ms | Companion note | `enter.fadeUp(900)` | 900ms |
| 1200–1560ms | "This unlocks" list items | `enter.fadeUp(stagger(i) + 1200)` | 1200 + i×60ms |
| 1500–1860ms | "Keep going" button | `enter.fadeUp(1500)` | 1500ms |

The flame bloom and confetti run in parallel (both start near frame 0). Text arrives after the visual spectacle has peaked — the user sees the celebration first, then reads the meaning.

---

## 6. Exit Animations

Exit is simpler than entrance. Most exits are handled for you.

**Standard page exit:** Expo Router's native stack handles this. Do not add a custom `exiting` prop to page-level containers. The native reverse animation is correct.

**Sheet dismiss:** gorhom handles the slide-down. Do not override.

**Conditional element removal** (item deleted, state collapses an element):
```tsx
// Preferred — fade out cleanly
<Animated.View exiting={FadeOut.duration(duration.short).easing(ease.inOut)}>

// Acceptable for small focal items
<Animated.View exiting={ZoomOut.duration(duration.short).easing(ease.inOut)}>
```

**Rule:** Do not add exit animations to every entrance. Only add `exiting` when the disappearance would otherwise feel abrupt and confusing to the user. If an element just conditionally unmounts and the context makes removal obvious, no exit animation needed.

---

## 7. Press-State Physics — Reference Implementation

This is the canonical press-state implementation. Screen builders should copy this pattern exactly.

```tsx
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { spring, duration, ease } from '@/lib/motion';
import { haptics } from '@/lib/haptics';

type PressableCardProps = {
  onPress: () => void;
  isFAB?: boolean;      // FAB uses 0.94 target instead of 0.96
  isPill?: boolean;     // Pill/chip uses spring.snap instead of spring.press
  children: React.ReactNode;
};

export function PressableCard({
  onPress,
  isFAB = false,
  isPill = false,
  children,
}: PressableCardProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Pill selection also animates bg color — done via withTiming in the parent
  // component using: withTiming(1, { duration: duration.micro, easing: ease.snap })

  const scaleTarget = isFAB ? 0.94 : isPill ? 0.97 : 0.96;
  const springConfig = isPill ? spring.snap : spring.press;

  const animStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: opacity.value };
    }
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    // Haptic fires BEFORE visual scale — feels maximally reactive
    haptics.tap();
    if (reduced) {
      opacity.value = withTiming(0.75, { duration: duration.micro, easing: ease.snap });
    } else {
      scale.value = withSpring(scaleTarget, springConfig);
    }
  };

  const handlePressOut = () => {
    if (reduced) {
      opacity.value = withTiming(1, { duration: duration.short, easing: ease.snap });
    } else {
      scale.value = withSpring(1, springConfig);
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

**Scale targets summary:**
- Standard card / button: `0.96` (4% shrink)
- Pill / chip: `0.97` (3% shrink — chip is smaller, percentage feels equivalent)
- FAB: `0.94` (6% shrink — FAB is a more significant action)
- Do not use `0.95` (too much for a card), do not use `0.98` (imperceptible)

**Pill bg color transition** (in addition to scale):
```ts
// Fires on chip press alongside scale
bgProgress.value = withTiming(1, { duration: duration.micro, easing: ease.snap });
// On release (if not selecting):
bgProgress.value = withTiming(0, { duration: duration.short, easing: ease.snap });
```

---

## 8. Skia Flame Physics

Three distinct flame behaviors. Each has its own physics. Do not mix them.

### 8a. Streak Flame — Gentle Breath Loop

Used on the Home screen header and check-in sheet header. The only sanctioned loop on those screens.

```ts
// Period: 2200ms. Sway period: 2600ms. Loop: indefinitely.
// scaleY: 1 → 1.06 → 1 (inOut quad)
// sway: ±0.04 rad rotation (inOut quad, different period to avoid sync)

const breathScale = withRepeat(
  withSequence(
    withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
    withTiming(1.0,  { duration: 1100, easing: Easing.inOut(Easing.quad) }),
  ),
  -1, // infinite
  false,
);

const swayAngle = withRepeat(
  withSequence(
    withTiming(0.04,  { duration: 1300, easing: Easing.inOut(Easing.quad) }),
    withTiming(-0.04, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
  ),
  -1,
  false,
);
```

### 8b. Splash Flame — One-Shot Bloom

Plays once on the splash screen. Total duration: 1200ms within the 1400ms window.

```ts
// scaleY: 1 → 1.12 (out cubic, 600ms) → 1 (inOut quad, 600ms)

const splashBloom = withSequence(
  withTiming(1.12, { duration: 600, easing: Easing.out(Easing.cubic) }),
  withTiming(1.0,  { duration: 600, easing: Easing.inOut(Easing.quad) }),
);
```

### 8c. Milestone Flame Bloom — Celebration One-Shot

Plays once on the milestone screen, starting at 200ms offset.

```ts
// scaleY: 1 → 1.18 (out cubic, 800ms) → 1 (inOut quad, 800ms). Total: 1600ms.
// Simultaneously: opacity 1 → 0.6 (400ms) → 1 (400ms) — flicker effect.

const milestoneBloom = withSequence(
  withTiming(1.18, { duration: 800, easing: Easing.out(Easing.cubic) }),
  withTiming(1.0,  { duration: 800, easing: Easing.inOut(Easing.quad) }),
);

const milestoneFlicker = withSequence(
  withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.quad) }),
  withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.quad) }),
);
```

Both `milestoneBloom` and `milestoneFlicker` start simultaneously (both fire in `useEffect` on mount, delayed 200ms).

---

## 9. Confetti Physics — Reference Implementation

```tsx
import { Canvas, RRect, Group, rect, rrect } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// ─── Physics constants ───────────────────────────────────────────────────────
const COUNT = 80;
const GRAVITY = 600;          // px/s² downward
const LIFETIME = 2200;        // ms total lifetime per particle
const FADE_START = 1600;      // ms — opacity begins fading at this point
const FADE_DURATION = 600;    // ms — fades from 1 → 0 over last 600ms

// Particle colors: peach and sage only
const COLORS = ['#F0B27A', '#88B17A', '#F8D5B3', '#5F8A53'];

// Particle shape: 6×10 rounded rect, small randomized variation
// width: 5–7px, height: 9–11px, borderRadius: 1.5px

// ─── Pre-computed particle data (module scope, not inside component) ─────────
type Particle = {
  color: string;
  w: number;
  h: number;
  // Emission: from top center, random angle ±60° from straight up
  angleDeg: number;     // degrees from vertical, range -60 to +60
  speed: number;        // initial speed px/s, range 200–450
  delay: number;        // stagger delay in ms, range 0–400
  startX: number;       // horizontal start position (near center ± spread)
};

const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => ({
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  w: 5 + Math.random() * 2,
  h: 9 + Math.random() * 2,
  angleDeg: (Math.random() - 0.5) * 120,   // ±60° from upward
  speed: 200 + Math.random() * 250,         // 200–450 px/s
  delay: Math.random() * 400,              // staggered emit over 400ms window
  startX: 195 + (Math.random() - 0.5) * 60, // center ± 30px on 390 canvas
}));

// ─── Component ───────────────────────────────────────────────────────────────
export function Confetti({ visible }: { visible: boolean }) {
  // One progress value per particle (0 → 1 over LIFETIME ms)
  const progresses = particles.map(() => useSharedValue(0));
  const opacities  = particles.map(() => useSharedValue(0));

  useEffect(() => {
    if (!visible) return;
    particles.forEach((p, i) => {
      progresses[i].value = withDelay(
        p.delay,
        withTiming(1, {
          duration: LIFETIME,
          easing: Easing.linear,  // linear progress; gravity applied in derivation
        }),
      );
      opacities[i].value = withDelay(
        p.delay,
        withTiming(1, { duration: 60, easing: Easing.out(Easing.quad) }),
      );
    });
  }, [visible]);

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: 390, height: 844 }}
      pointerEvents="none"
    >
      {particles.map((p, i) => {
        // Convert angle to velocity components (upward = negative Y in RN coords)
        const angleRad = (p.angleDeg * Math.PI) / 180;
        const vx = p.speed * Math.sin(angleRad);   // horizontal component
        const vy = -p.speed * Math.cos(angleRad);  // vertical component (negative = up)

        // Derived position via kinematic equations:
        // x(t) = startX + vx * t
        // y(t) = startY + vy * t + 0.5 * GRAVITY * t²
        // where t is time in seconds = (progress * LIFETIME) / 1000
        const startY = 80; // near top of screen

        const cx = useDerivedValue(() => {
          const t = (progresses[i].value * LIFETIME) / 1000;
          return p.startX + vx * t;
        });

        const cy = useDerivedValue(() => {
          const t = (progresses[i].value * LIFETIME) / 1000;
          return startY + vy * t + 0.5 * GRAVITY * t * t;
        });

        // Rotation: 360°–720° over lifetime
        const rotationDeg = 360 + Math.random() * 360;
        const rotation = useDerivedValue(() =>
          progresses[i].value * rotationDeg,
        );

        // Opacity: full until FADE_START, then fade to 0
        const opacity = useDerivedValue(() => {
          const elapsed = progresses[i].value * LIFETIME;
          if (elapsed < FADE_START) return opacities[i].value;
          const fadeProgress = (elapsed - FADE_START) / FADE_DURATION;
          return Math.max(0, opacities[i].value * (1 - fadeProgress));
        });

        const particleRect = rrect(
          rect(-p.w / 2, -p.h / 2, p.w, p.h),
          1.5,
          1.5,
        );

        return (
          <Group
            key={i}
            opacity={opacity}
            transform={useDerivedValue(() => [
              { translateX: cx.value },
              { translateY: cy.value },
              { rotate: (rotation.value * Math.PI) / 180 },
            ])}
          >
            <RRect rect={particleRect} color={p.color} />
          </Group>
        );
      })}
    </Canvas>
  );
}
```

**Physics summary (plain language):**
- 80 particles, peach and sage palette only
- Emit from top center (~y=80), spread horizontally ±30px at origin
- Launch angle: ±60° from straight up, randomized per particle
- Initial velocity: 200–450 px/s, randomized
- Gravity: 600 px/s² (pulls down)
- Rotation: 360°–720° per particle over its 2200ms lifetime
- Opacity: holds at 1 for 1600ms, then fades to 0 over 600ms
- Particle shape: 6×10 rounded rect (±1px variation)
- Staggered emission: particles start within a 400ms window, not all at once

---

## 10. Haptic Timing

Haptics are part of the motion choreography. Get the timing wrong and the feedback feels lagged or disconnected.

**Press haptic:** Fires on `onPressIn` — before the visual scale animation begins. The user's finger is still going down when the haptic fires. This is correct. It makes the UI feel like it has physical weight.

**Never fire on `onPressOut`.** That is after the interaction peak, not at it.

**Completion haptic** (completing a step, checking off a task): Fires simultaneously with the success animation trigger — in the same `onPress` handler, on the same frame. Not before (anticipatory haptic is jarring), not after (delayed feedback breaks the connection).

```ts
// DO — simultaneous with animation
const handleComplete = () => {
  haptics.success();          // fires now
  triggerSuccessAnimation();  // fires now
  onComplete();
};

// DON'T — haptic before animation
const handleComplete = () => {
  haptics.success();
  setTimeout(triggerSuccessAnimation, 50); // WRONG — creates a disconnect
};
```

**Entrance animations:** No haptic. The user didn't do anything — the content appeared. Haptics are for user-initiated actions only.

**Layout transitions:** No haptic. Reordering items in response to data changes is not a user action in the haptic sense.

---

## 11. What to Avoid

These are not preferences. They are bans.

| Forbidden | Why |
|---|---|
| `spring.bouncy` anywhere except the milestone celebration | Dilutes the one moment it should feel exceptional |
| Durations > 700ms on interactive UI elements | Makes the app feel sluggish; users are waiting on their own action |
| Two animations competing on one property of one element | They fight and produce jitter or undefined behavior |
| Looping animations on more than 2 elements simultaneously visible | Visual noise, drains battery, feels restless |
| `Easing.elastic(...)` or `Easing.bounce` | Read as toy/playful — wrong tone for this audience |
| Re-staggering on filter/sort re-renders | Items are repositioning, not arriving |
| Adding `exiting` to every element that has `entering` | Exit animations are for meaningful disappearances only |
| Overriding gorhom bottom sheet's spring | Creates competing springs and jitter |
| Haptic on `onPressOut` | Haptic should precede or match the visual, never follow |
| Haptic on entrance animations or layout shifts | Haptics are for user-initiated interactions only |
| `Easing.linear` on anything except a true continuous loop | Everything else has better-feeling alternatives |

---

## 12. Quick Decision Checklist

Before writing any animated value, answer these four questions:

**1. Spring or timing?**
- If the value overshoots and settles: spring
- If it needs to arrive at an exact time: `withTiming`
- Entrances that use `enter.*` helpers use timing internally — don't add a spring on top

**2. Which spring? (if spring)**
- Press → `spring.press`
- Chip select → `spring.snap`
- Layout / page / FAB → `spring.gentle`
- Sheet → gorhom's (don't touch)
- Milestone celebration → `spring.bouncy` (only here)

**3. Which duration? (if timing)**
- Color / opacity flicker → `duration.micro` (160)
- Button return / small state → `duration.short` (240)
- Card / list / tab → `duration.medium` (360)
- Page transition → `duration.long` (520)
- Splash flame → `duration.splash` (1400)
- Building plan → `duration.building` (2400)

**4. Which easing? (if timing)**
- Anything entering → `ease.out`
- Anything exiting → `ease.inOut`
- Color / opacity → `ease.snap`
- Skia loop → `Easing.inOut(Easing.quad)` inline
- Skia one-shot → `Easing.out(Easing.cubic)` inline

All tokens live in `@/lib/motion`. No inline magic numbers.

---

*Leader 09 — Motion Physics. SecondChance hackathon build.*
