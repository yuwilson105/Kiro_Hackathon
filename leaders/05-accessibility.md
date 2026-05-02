# Leader 05 — Accessibility Standards

**Audience:** All 24 screen-builder agents.
**Priority:** Non-negotiable. Every screen ships accessible or it does not ship.
**Stack:** Expo SDK 54 · React Native 0.81 · NativeWind 4 · Reanimated 4

SecondChance serves people coming home from incarceration. Many have not touched a smartphone in years. Many have low literacy, aging vision, or cognitive load barriers. Accessibility here is a moral requirement, not a checkbox.

---

## 1. Contrast (WCAG — AA minimum, AAA where possible)

### Approved contrast pairs

| Token / Hex | Background | Contrast ratio | Grade | Verdict |
|---|---|---|---|---|
| `text` `#1F2D3D` | `bg` `#FFFFFF` | 13.4 : 1 | AAA | Body text default |
| `text` `#1F2D3D` | `surface` `#EAF2FB` | 11.2 : 1 | AAA | Cards, sheets |
| `textMuted` `#6E7E8E` | `bg` `#FFFFFF` | 4.7 : 1 | AA | Secondary info only |
| `primaryDeep` `#4A7DB0` | `bg` `#FFFFFF` | 5.6 : 1 | AA | Links/labels on white |
| `textInverse` `#FFFFFF` | `primary` `#6FA8DC` | 2.9 : 1 | FAIL | Never use for body text |
| `textInverse` `#FFFFFF` | `primaryDeep` `#4A7DB0` | 4.5 : 1 | AA | OK for short button labels only |
| `text` `#1F2D3D` | `accentSoft` `#F8D5B3` | 9.1 : 1 | AAA | Tags/pills on peach |
| `success` `#88B17A` | `bg` `#FFFFFF` | 2.6 : 1 | FAIL | Icon only — never body text |
| `successDeep` `#5F8A53` | `bg` `#FFFFFF` | 5.1 : 1 | AA | OK for short status labels |

### Forbidden combinations — never ship these

```
text-primary   on bg-surface  →  FAIL (2.4:1). Use text-text or text-primary-deep.
text-muted     on bg-surface  →  BORDERLINE (3.9:1). Use custom #5C6B7B on surface.
text-accent    on bg-bg       →  FAIL (decorative only — never body text).
text-inverse   on bg-primary  →  FAIL. Never white text on pastel blue.
text-success   on bg-surface  →  FAIL. Use successDeep for any text, icon only for success.
```

### Rules

- **Body text is always `text-text` (#1F2D3D).** No exceptions on any background.
- `text-muted` is only for secondary, non-critical metadata (timestamps, footnotes). On `bg-surface`, switch to `#5C6B7B` (a custom class or inline style).
- `text-primary` (#6FA8DC) is for icons, progress dots, decorative numerals, and accents. Never body copy.
- Pressed/disabled states: apply `opacity-70` to the container. Do **not** change the text color token. The text must remain readable even at 70% opacity — verify the dimmed combo still passes AA before shipping.
- When uncertain: use `text-text`. Always.

```tsx
// Correct — body text on any card background
<Text className="text-text font-inter-regular text-base leading-relaxed">
  Your next step is getting a state ID.
</Text>

// Correct — muted secondary on white
<Text className="text-muted text-sm">
  Updated 2 days ago
</Text>

// Correct — muted secondary on surface: use darker shade
<Text style={{ color: '#5C6B7B' }} className="text-sm">
  Updated 2 days ago
</Text>

// WRONG — primary as body text
<Text className="text-primary text-base">
  Your next step...  {/* ← FAIL — do not do this */}
</Text>
```

---

## 2. Touch Targets

- **Minimum 44 × 44 pt** for every interactive element (Apple HIG and WCAG 2.5.5).
- Pills and tags may render visually smaller (32 pt height is fine) but must expand the hit zone with `hitSlop`.

```tsx
// Small pill with expanded hit zone
<Pressable
  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
  className="h-8 px-4 rounded-full bg-surface border border-border"
  accessibilityRole="button"
  accessibilityLabel="Select non-violent conviction"
  onPress={onPress}
>
  <Text className="text-text text-sm font-inter-medium">Non-violent</Text>
</Pressable>
```

- Tap zones never overlap. Leave a minimum of `spacing-2` (8 pt) between any two adjacent interactive elements.
- Tab bar buttons span the full width of their tab slot. Apply `py-3` minimum as padding.
- Do not place two tappable elements closer than 8 pt measured edge-to-edge.
- If you cannot fit the layout without overlapping targets, reduce the number of elements per row — not the target size.

---

## 3. Screen Reader (VoiceOver / TalkBack)

Every interactive element needs all three: `accessibilityRole`, `accessibilityLabel`, and (when stateful) `accessibilityState`.

### Role reference

| Element type | `accessibilityRole` |
|---|---|
| Pressable button | `"button"` |
| Toggle / checkbox | `"checkbox"` |
| Navigation tab | `"tab"` |
| Link | `"link"` |
| Text input | `"none"` (use `TextInput`, not Pressable) |
| Image | `"image"` |
| Header / section title | `"header"` |

### Code examples

```tsx
// Step card toggle
<Pressable
  accessibilityRole="checkbox"
  accessibilityLabel="Mark 'Get your state ID' as done"
  accessibilityState={{ checked: isComplete }}
  onPress={toggleComplete}
>
  <StepIcon complete={isComplete} />
  <Text className="text-text font-inter-medium text-base">Get your state ID</Text>
</Pressable>

// FAB
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Scroll to next incomplete step"
  accessibilityHint="Jumps to the next task that isn't finished yet"
  onPress={scrollToNext}
>
  <WhatNextIcon />
</Pressable>

// Navigation tab
<Pressable
  accessibilityRole="tab"
  accessibilityLabel="Home"
  accessibilityState={{ selected: isActive }}
  onPress={onPress}
>
  <HomeIcon />
  <Text className="text-xs">Home</Text>
</Pressable>
```

### Hiding decorative elements

```tsx
// Decorative icon — VoiceOver skips it
<View accessibilityElementsHidden importantForAccessibility="no">
  <SparkleIcon />
</View>
```

### Skia canvases

Skia canvases (flame, confetti, background art) are invisible to screen readers by default, but they must not cause VoiceOver to stumble. Wrap and annotate the parent.

```tsx
// Flame animation canvas
<View
  accessible={true}
  accessibilityLabel="Animated flame representing your 7-day streak"
>
  <Canvas style={styles.canvas} accessible={false}>
    <FlameGroup progress={progress} />
  </Canvas>
</View>
```

### Grouping related text

Never let VoiceOver read five separate Text nodes on one card when a single combined announcement is clearer.

```tsx
// Bad — VoiceOver reads "Job search" then "In progress" then "Step 2 of 5" separately
<View>
  <Text className="text-text font-inter-semibold">Job search</Text>
  <Text className="text-muted text-sm">In progress</Text>
  <Text className="text-muted text-sm">Step 2 of 5</Text>
</View>

// Good — one announcement
<View
  accessible={true}
  accessibilityLabel="Job search. In progress. Step 2 of 5."
>
  <Text className="text-text font-inter-semibold" importantForAccessibility="no">
    Job search
  </Text>
  <Text className="text-muted text-sm" importantForAccessibility="no">In progress</Text>
  <Text className="text-muted text-sm" importantForAccessibility="no">Step 2 of 5</Text>
</View>
```

---

## 4. Reduced Motion

Use `useReducedMotion()` from `react-native-reanimated`. Check at the top of every screen/component that uses animation.

```tsx
import { useReducedMotion } from 'react-native-reanimated';

function StreakFlame({ streakDays }: { streakDays: number }) {
  const reduceMotion = useReducedMotion();

  // Loop animation — disable entirely when reduced motion is on
  const breatheStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ scale: 1 }] };
    return {
      opacity: withRepeat(withTiming(0.7, { duration: 1200 }), -1, true),
      transform: [{ scale: withRepeat(withTiming(1.08, { duration: 1200 }), -1, true) }],
    };
  });

  return (
    <Animated.View style={breatheStyle}>
      <FlameIcon size={48} />
    </Animated.View>
  );
}
```

### Reduced-motion rules by animation type

| Animation | Normal | Reduced motion |
|---|---|---|
| Entrance slide + fade | `translateY` + `opacity` | Opacity-only fade, no translate |
| Entrance scale | Scale 0.9 → 1 | No scale, opacity only |
| Skia flame breath | Looping scale + opacity | Freeze at static state |
| Streak pulse | Looping shadow pulse | Remove entirely |
| Confetti burst | Particle rain | Replace with static milestone card (no emoji substitution, just the card) |
| Splash screen | Full animation sequence | Skip to 200 ms |
| "Building your plan" loader | Animated sequence | Skip to 600 ms |

- Never block content waiting for an animation when reduced motion is on. Show content immediately.
- If an animation is the primary vehicle for conveying information (e.g. a progress arc), ensure the final state is always visible — do not hide info behind an animation that never plays.

---

## 5. Dynamic Type / Font Scaling

- React Native `Text` components respect iOS Dynamic Type by default. Do not override this.
- Do not hard-code font sizes on Skia text for body copy — Skia canvas text does not scale with system font size. Use Skia text only for decorative numerals, labels on charts, or art.
- Inter weights (400/500/600) scale freely. Do not `allowFontScaling={false}` unless the element is purely decorative and never conveys information.
- Test every screen at **1.5× and 2× system font scale** before marking it done. Layouts must wrap, not clip. Use `flexWrap: 'wrap'` and `flexShrink: 1` on text containers.

```tsx
// Correct — text wraps, never clips
<View className="flex-row items-center gap-3 flex-1">
  <StepIcon />
  <Text className="text-text font-inter-medium text-base flex-1 flex-shrink">
    Apply for Social Security benefits
  </Text>
</View>
```

---

## 6. Color-Independent Meaning

Status must never depend on color alone. Use shape + color together.

| State | Shape indicator | Color indicator |
|---|---|---|
| Not started | Hollow circle outline | Border in `#C9D9EC` |
| In progress | Filled dot, amber | `warning` `#E0B341` |
| Complete | Checkmark glyph | `success` `#88B17A` |
| Crisis | Explicit "Crisis Support" label | `danger` `#C77B7B` border |

- Streak day pills (M/T/W) on the Home screen: use color + a dot indicator + day letter. Day letter alone suffices for sighted users; the dot adds a second signal.
- Error states: use a warning icon (triangle with exclamation) in addition to any red color.
- Never communicate state through color alone in any map, chart, or badge.

---

## 7. Error, Empty, and Loading States

### Empty states

Every empty state must have: icon + headline + warm body copy + a suggested action. Never show a blank screen.

```
Icon:     [Compass illustration]
Headline: No resources found nearby
Body:     We couldn't find anything in your area right now. That can change — try calling 211. They can connect you to almost anything.
Action:   [Call 211]  [Search a different city]
```

### Error messages

Write in plain language. Never show raw error codes or stack trace snippets.

```
We're having trouble finding resources right now.
Try calling 211 — they can connect you to anything in your area.
```

### Loading states

- Use skeleton shimmer (NativeWind `animate-pulse` on placeholder rects) so the layout is visible immediately.
- For screen readers: announce `"Loading"` once when the skeleton mounts. Do not repeat it on every tick.

```tsx
<View
  accessible={true}
  accessibilityLiveRegion="polite"
  accessibilityLabel="Loading your resources"
>
  <SkeletonCard />
  <SkeletonCard />
</View>
```

---

## 8. Keyboard and Focus Order

- All `TextInput` elements carry an `accessibilityLabel` that matches (or is more descriptive than) the visible label above the field.
- Focus order is natural: top-to-bottom, left-to-right. Do not reorder focus with `accessibilityViewIsModal` unless showing a modal.
- Bottom sheet text input (`"Talk about it"` journal entry): auto-focus the input **only** when the user taps the "Talk about it" button — not when the sheet first opens. The sheet may open for navigation; auto-focus would hijack keyboard unexpectedly.

```tsx
<TextInput
  ref={inputRef}
  accessibilityLabel="Write about how you're feeling today"
  accessibilityHint="Your entry is private and saved only on this device"
  onFocus={...}
  placeholder="What's on your mind?"
  multiline
/>

// Auto-focus only when the user explicitly taps "Talk about it"
const handleTalkAboutItPress = () => {
  openBottomSheet();
  // Small delay to let the sheet animate open first
  setTimeout(() => inputRef.current?.focus(), 300);
};
```

---

## 9. Copy Accessibility

- **7th-grade reading level.** Run copy through a readability check if unsure.
- Short sentences. Active voice. One idea per sentence.
- No idioms: avoid "hit the ground running," "chip away at it," "burning bridges," "at the end of the day."
- Explain acronyms on first use: `"your government ID — sometimes called a state ID or DMV ID"`.
- Button labels are imperative and specific:

| Instead of | Write |
|---|---|
| Submit | Save my answers |
| Continue | Go to housing options |
| OK | Got it |
| Next | See my full plan |
| Done | Mark as complete |

- Avoid wall-of-text. Break body copy into sentences of 12 words or fewer where possible.
- Avoid double negatives: "You don't need to check in" → "You can skip check-in today."

---

## 10. Crisis-Specific Accessibility

The 988 Suicide & Crisis Lifeline card is the highest-priority accessibility surface in the app.

### Placement rules

- The 988 card is **pinned** in the Wellness tab. It is never buried below the fold on first load.
- It must be reachable in **2 taps or fewer from anywhere** in the app. A persistent soft link in the tab bar ("Wellness") counts as tap 1. The card itself is tap 2 to call.

### Visual standards for the crisis card

- Body text: `text-text` (#1F2D3D) on white (#FFFFFF) — 13.4:1 AAA.
- Call button background: `accent` (#F0B27A). Text: `text-text`. Contrast: 5.8:1 AA.
- Font size: 18 pt minimum for all body copy on this card (`text-lg`).
- No animations. Static, calm, present.
- No skeleton shimmer. The card is rendered from local constants — it must never wait on a network call.

### Full crisis card reference implementation

```tsx
import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';

const CRISIS_NUMBER = '988';

export function CrisisCard() {
  const handleCall = () => {
    Linking.openURL(`tel:${CRISIS_NUMBER}`);
  };

  return (
    <View
      className="bg-white rounded-2xl p-6 border border-danger"
      accessible={true}
      accessibilityLabel="Crisis Support card. You can call or text 988 for free, confidential support."
    >
      {/* Header — grouped, no separate VoiceOver focus */}
      <View importantForAccessibility="no">
        <Text className="text-text font-inter-semibold text-lg leading-snug">
          Crisis Support
        </Text>
        <Text className="text-text font-inter-regular text-lg leading-relaxed mt-2">
          You can call or text 988 any time, day or night. It's free and completely confidential.
        </Text>
        <Text className="text-text font-inter-regular text-lg leading-relaxed mt-1">
          You don't have to be in a crisis to reach out.
        </Text>
      </View>

      {/* Call button */}
      <Pressable
        className="mt-5 bg-accent rounded-xl py-4 px-6 items-center"
        accessibilityRole="button"
        accessibilityLabel="Call 988"
        accessibilityHint="Calls 988 directly to speak with a crisis counselor. Free and confidential."
        onPress={handleCall}
      >
        <Text className="text-text font-inter-semibold text-lg">
          Call 988
        </Text>
      </Pressable>

      {/* Text option */}
      <Pressable
        className="mt-3 items-center py-3"
        accessibilityRole="button"
        accessibilityLabel="Text 988 instead"
        accessibilityHint="Opens a text message to 988. For when you can't speak out loud."
        onPress={() => Linking.openURL('sms:988')}
      >
        <Text style={{ color: '#4A7DB0' }} className="font-inter-medium text-base">
          Prefer to text? Send a message to 988
        </Text>
      </Pressable>
    </View>
  );
}
```

### Crisis card checklist

- [ ] No animation of any kind
- [ ] Loads from local constants — no network dependency
- [ ] Body text at least 18 pt (`text-lg`)
- [ ] Call button touch target: full width, `py-4` minimum
- [ ] `accessibilityHint` on the call button mentions "free and confidential"
- [ ] Reachable in 2 taps from any tab
- [ ] Passes 13.4:1 (body text) and 5.6:1 (button label) contrast in Xcode Accessibility Inspector

---

## Quick-Reference Checklist (per screen)

Before marking any screen done, verify:

- [ ] All body text is `text-text` (#1F2D3D)
- [ ] `text-primary` appears only on icons, dots, or decorative elements
- [ ] `text-muted` on `bg-surface` is replaced with `#5C6B7B`
- [ ] Every `Pressable` has `accessibilityRole` + `accessibilityLabel`
- [ ] Stateful elements have `accessibilityState`
- [ ] Decorative elements have `accessibilityElementsHidden` or `importantForAccessibility="no"`
- [ ] Skia canvases have `accessible={false}` and a labeled parent View
- [ ] Related text nodes are grouped under one `accessible={true}` parent
- [ ] All touch targets are 44 × 44 pt (or hitSlop-expanded to 44 pt)
- [ ] Adjacent interactive elements have ≥ 8 pt separation
- [ ] `useReducedMotion()` is imported and respected in every animated component
- [ ] Loop animations are disabled when reduced motion is on
- [ ] Entrance animations fall back to opacity-only fades
- [ ] Font sizes are not locked against scaling (no `allowFontScaling={false}` on content text)
- [ ] Layout tested at 1.5× and 2× font scale — no clipping
- [ ] Status indicators use shape + color (never color alone)
- [ ] Empty states have icon + headline + copy + action
- [ ] Error messages are in plain language, no technical codes
- [ ] Loading states announce "Loading" once to screen reader
- [ ] Copy is ≤ 7th-grade level, no idioms, acronyms explained
- [ ] Button labels are imperative and specific
