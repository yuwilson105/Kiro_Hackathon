# Leader 04 — Interactions

Standards for all 24 screen-builder agents. Read this in full before writing any interactive element. These rules are non-negotiable.

The audience of this app is people returning home from incarceration. Touch must feel **soft and reassuring**, never jarring. Every decision in this doc flows from that principle.

---

## 1. Primary Interactions

### Tappable Buttons

Use `Pressable` from `react-native`. Never `TouchableOpacity` — it's legacy and we don't use `activeOpacity`.

On `pressIn`: animate scale `1 → 0.96` using `spring.press` from `@/lib/motion`, fire `haptics.tap()`.  
On `pressOut`: animate scale back to `1` using the same spring.

```tsx
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { spring } from '@/lib/motion';
import * as haptics from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withSpring(0.96, spring.press);
        haptics.tap();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.press);
      }}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center justify-center rounded-xl bg-primary px-6 py-4"
    >
      <Animated.Text className="text-base font-semibold text-text-inverse">{label}</Animated.Text>
    </AnimatedPressable>
  );
}
```

### Pill / Chip Selection (Onboarding, Filter Pills)

On press: scale `1 → 0.97 → 1` with `spring.press`, fire `haptics.select()`.  
Selected background color transition: `withTiming` at `220ms`.

```tsx
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { spring, duration } from '@/lib/motion';
import { colors, radii } from '@/lib/theme';
import * as haptics from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; selected: boolean; onPress: () => void };

export function FilterPill({ label, selected, onPress }: Props) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(selected ? 1 : 0);

  // Keep progress in sync when parent toggles `selected`
  // (use useEffect in the screen, not here — see § Scroll / state rules)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surface, colors.primary],
    ),
  }));

  function handlePress() {
    scale.value = withSpring(0.97, spring.press, () => {
      scale.value = withSpring(1, spring.press);
    });
    progress.value = withTiming(selected ? 0 : 1, { duration: 220 });
    haptics.select();
    onPress();
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, { borderRadius: radii.pill }]}
      onPress={handlePress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className="px-4 py-2"
    >
      <Animated.Text
        className={`text-sm font-medium ${selected ? 'text-text-inverse' : 'text-text-muted'}`}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}
```

### Tab Bar

`HapticTab` at `@/components/haptic-tab` is already wired into the bottom tab navigator. It fires a Light impact on iOS on every tab press. **Do not modify it. Do not add additional haptics around tab presses.**

### Toggle Switches

Use React Native's native `Switch` component for iOS-style snap toggles. Fire `haptics.select()` in `onValueChange`. Do not build a custom animated toggle unless the design explicitly calls for one.

```tsx
import { Switch } from 'react-native';
import * as haptics from '@/lib/haptics';

<Switch
  value={isEnabled}
  onValueChange={(next) => {
    haptics.select();
    setIsEnabled(next);
  }}
  trackColor={{ false: colors.border, true: colors.primary }}
  thumbColor={colors.bg}
  accessibilityRole="switch"
  accessibilityLabel="Enable notifications"
  accessibilityState={{ checked: isEnabled }}
/>
```

---

## 2. Press States

- **Every interactive element must have a visible press state.** Scale or tint — something must move. A button that gives no feedback feels broken to every user, and especially so to this audience.
- **Minimum touch target: 44 × 44 pt.** When the visual element is smaller (icon buttons, small chips), expand with `hitSlop`.
- **Never use `activeOpacity`.** That belongs to `TouchableOpacity`. We use animated scale instead.
- **Never rely solely on color change** for press feedback — scale change is required on every tappable.

```tsx
// hitSlop shorthand (equal on all sides)
hitSlop={8}

// hitSlop per-side
hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
```

---

## 3. Gestures

### Bottom Sheet Drag

Handled entirely by `@gorhom/bottom-sheet`. Use it as-is. Do not reinvent with raw gesture handlers.

### Horizontal Swipe — My Plan Week Strip

Use `react-native-gesture-handler`'s `Gesture.Pan()` combined with a Reanimated `useSharedValue` for the translate offset. The swipe threshold to commit to the next/prev week is **60 px**.

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { spring } from '@/lib/motion';
import * as haptics from '@/lib/haptics';

const SWIPE_THRESHOLD = 60;

export function WeekStrip({ onWeekChange }: { onWeekChange: (delta: -1 | 1) => void }) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(haptics.select)();
        runOnJS(onWeekChange)(1);
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(haptics.select)();
        runOnJS(onWeekChange)(-1);
      }
      translateX.value = withSpring(0, spring.gentle);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {/* week content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Long-Press — Mark Step In-Progress

Use a 350 ms long-press delay. Fire `haptics.tap()` when the long-press activates (not on release). The `onLongPress` callback on `Pressable` handles this natively with `delayLongPress`.

```tsx
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { spring } from '@/lib/motion';
import * as haptics from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onTap: () => void;
  onMarkInProgress: () => void;
};

export function StepRow({ label, onTap, onMarkInProgress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withSpring(0.97, spring.press);
        haptics.tap();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.press);
      }}
      onPress={onTap}
      onLongPress={() => {
        haptics.tap();
        onMarkInProgress();
      }}
      delayLongPress={350}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Double-tap to view. Hold to mark in progress."
      className="rounded-xl bg-surface px-4 py-3"
    >
      <Animated.Text className="text-base font-medium text-text">{label}</Animated.Text>
    </AnimatedPressable>
  );
}
```

### Pull-to-Refresh

Not needed. There is no real backend. Do not implement it.

### Multi-Touch (Zoom / Rotate)

Not built. Out of scope entirely.

---

## 4. Haptic Rhythm

This app uses only **Light** impact and the three notification types. Heavy and Medium impact are banned. The softness is intentional — it matches the emotional register of the product.

### Decision Tree

```
User does something →
  ├─ Taps any button, row, or card?          → haptics.tap()
  ├─ Selects from a list, grid, or pill?     → haptics.select()
  ├─ Marks a step complete?                  → haptics.success()   ← the celebratory one
  ├─ Encounters a setback / overdue alert?   → haptics.warn()      ← use sparingly
  └─ Crisis card surfaces?                   → NO HAPTIC
```

### Rules

| Situation | Haptic | Notes |
|---|---|---|
| Button / row tap | `tap()` | Light impact. Fire on `pressIn`, not `onPress`. |
| Pill / chip selection | `select()` | Selection feedback. Fire on `onPress`. |
| Week strip swipe commits | `select()` | Fire in `runOnJS` from the worklet. |
| Toggle switch change | `select()` | Fire in `onValueChange`. |
| Long-press activates | `tap()` | Fire when long-press threshold is crossed, not on release. |
| Step marked complete | `success()` | The one celebratory haptic in the whole app. |
| Milestone reached | `success()` | Same. Do not add confetti to every micro-task completion. |
| Setback / overdue warning | `warn()` | Once per event, not repeated. |
| Crisis card surfaces | **none** | The user is already in distress. No additional stimulus. |
| Screen render / animation | **none** | Haptics are for user-initiated actions only. |
| Heavy or Medium impact | **banned** | Do not import or call these. |

---

## 5. Loading and Waiting

- **First launch splash:** 1 400 ms (`duration.splash`) flame animation. No spinner. No progress bar.
- **"Building your plan" transition:** 2 400 ms (`duration.building`) flame bloom. Intentional warmth, not a loading state. Do not rush it or replace it.
- **In-page loading skeleton:** shimmer in `colors.surface` / `colors.surfaceDeep`. Never a spinner. This audience has waited on bureaucracy; spinners carry that weight.
- **Mocked network errors (e.g., Find Help "couldn't load"):** show warm, human copy. No technical error messages. No retry spinners.

---

## 6. Keyboard

- **KeyboardAvoidingView is replaced.** Use `react-native-keyboard-controller`'s `KeyboardAvoidingView` or `KeyboardAwareScrollView` everywhere. Never the RN built-in `KeyboardAvoidingView`.

```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

<KeyboardAwareScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  keyboardShouldPersistTaps="handled"
>
  {/* screen content with inputs */}
</KeyboardAwareScrollView>
```

- **Auto-focus:** only when the screen's entire purpose is text entry (e.g., the "Tell me more" input on the check-in sheet). Never auto-focus on screens where the input is incidental.
- **Return key behavior:** submit on return for single-field flows (city search). For multi-line inputs, return inserts a newline — do not intercept it.

---

## 7. Scroll

| Situation | Component |
|---|---|
| List with more than 10 items | `FlashList` from `@shopify/flash-list` |
| Everything else (Home, Plan week, sheet contents) | `ScrollView` |

```tsx
// When a ScrollView contains any text input
<ScrollView keyboardShouldPersistTaps="handled">

// Horizontal small scrollers (filter pills, week strip)
<ScrollView horizontal showsHorizontalScrollIndicator={false}>

// Bounces
// iOS: enabled by default — leave it alone
// Android: default behavior — leave it alone
```

FlashList requires an `estimatedItemSize` prop. Measure a representative item and set it. Do not guess 100 — it affects scroll performance.

---

## 8. Navigation

| Pattern | How |
|---|---|
| Stack push | Expo Router default — native iOS push slide |
| Modal sheet | `presentation: 'modal'` on the route |
| Full-screen modal (Milestone) | `presentation: 'fullScreenModal'`, `animation: 'fade'` |
| Back gesture | Standard native — do not override |
| Programmatic push | `router.push(href)` from `expo-router` |
| Replace (no back) | `router.replace(href)` from `expo-router` |

Never intercept or override the native back swipe gesture. Never use `navigation.navigate()` — always use the `router` object from `expo-router`.

---

## 9. Accessibility

Every `Pressable` must carry:

```tsx
accessibilityRole="button"
accessibilityLabel="Human-readable description of what this does"
```

Additional requirements:

- **Toggle / Switch:** `accessibilityRole="switch"` + `accessibilityState={{ checked: value }}`. The state change is announced automatically by the native `Switch` component.
- **Sliders:** `accessibilityRole="adjustable"` + `accessibilityValue={{ min, max, now }}`.
- **Crisis Card:** `accessibilityHint="Calls 988 Suicide and Crisis Lifeline"` on the call-to-action. This is load-bearing — do not omit it.
- **Selected state on pills:** `accessibilityState={{ selected: isSelected }}`.
- **Disabled state:** `accessibilityState={{ disabled: true }}` when a button is disabled. Also set `disabled={true}` on the `Pressable` so the press handler never fires.

---

## 10. What Not to Build

These are explicitly out of scope. Do not implement them, do not stub them, do not leave TODOs for them.

- Multi-touch zoom or rotate on any element.
- Drag-and-drop reordering of plan steps.
- Confetti on every step completion. Confetti (or equivalent celebration) is reserved for milestone-level achievements only.
- Pull-to-refresh on any screen.
- Custom animated toggle switch (use native `Switch`).
- Any Medium or Heavy haptic impact.

---

## Quick Reference

| What | Rule |
|---|---|
| Button component | `Pressable` + `Animated.createAnimatedComponent` |
| Press scale | `1 → 0.96` with `spring.press` |
| Press haptic | `haptics.tap()` on `pressIn` |
| Chip selection haptic | `haptics.select()` on press |
| Completion haptic | `haptics.success()` on step complete |
| Warning haptic | `haptics.warn()` — use rarely |
| Crisis card haptic | none |
| Heavy / Medium impact | banned |
| Min touch target | 44 × 44 pt, use `hitSlop` to expand |
| Long-press threshold | 350 ms, `delayLongPress={350}` |
| Swipe commit threshold | 60 px |
| Keyboard wrapper | `react-native-keyboard-controller` only |
| List > 10 items | `FlashList` |
| List ≤ 10 items | `ScrollView` |
| Loading state | skeleton shimmer — no spinners |
| Navigation | `router.push` / `router.replace` from `expo-router` |
