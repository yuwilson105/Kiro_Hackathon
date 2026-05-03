---
inclusion: always
---

# Interactions

Touch must feel soft and reassuring. Every decision flows from that principle.

## Buttons

Use `Pressable` from `react-native`. Never `TouchableOpacity`.

- pressIn: scale `1 → 0.96` with `spring.press`, fire `haptics.tap()`
- pressOut: scale back to `1` with `spring.press`
- Minimum touch target: 44×44pt. Use `hitSlop` when visual element is smaller.

## Pill/Chip Selection

- pressIn: scale `1 → 0.97 → 1` with `spring.snap`, fire `haptics.select()`
- Background color transition: `withTiming` at 220ms

## Haptic Rules

| Action                  | Haptic                           |
| ----------------------- | -------------------------------- |
| Button/row/card tap     | `haptics.tap()` on pressIn       |
| Pill/chip selection     | `haptics.select()` on press      |
| Step marked complete    | `haptics.success()`              |
| Setback/overdue warning | `haptics.warn()` — use sparingly |
| Crisis card             | **none**                         |
| Heavy/Medium impact     | **banned**                       |

Fire haptics on `pressIn`, not `onPress`. Never on screen render or animations.

## Gestures

- Bottom sheet drag: handled by `@gorhom/bottom-sheet` — do not reinvent
- Horizontal swipe (week strip): `Gesture.Pan()` + Reanimated, commit threshold 60px
- Long-press (mark in-progress): 350ms delay via `delayLongPress={350}`
- Pull-to-refresh: not implemented — no backend
- Multi-touch zoom/rotate: out of scope

## Keyboard

Use `react-native-keyboard-controller`'s `KeyboardAwareScrollView` everywhere. Never the RN built-in `KeyboardAvoidingView`.

## Scroll

- Lists > 10 items: `FlashList` from `@shopify/flash-list`
- Everything else: `ScrollView`
- Always `keyboardShouldPersistTaps="handled"` on ScrollViews with inputs

## Navigation

- Stack push: Expo Router default
- Modal sheet: `presentation: 'modal'`
- Full-screen modal: `presentation: 'fullScreenModal'`, `animation: 'fade'`
- Always use `router.push()` / `router.replace()` from `expo-router` — never `navigation.navigate()`
- Never intercept or override the native back swipe gesture

## Loading States

- Skeleton shimmer in `colors.surface` / `colors.surfaceDeep` — never spinners
- "Building your plan": 2400ms flame bloom — do not rush or replace it

## Forbidden

- `TouchableOpacity` anywhere
- `activeOpacity` prop
- Medium or Heavy haptic impact
- Confetti on every step completion — milestone-level only
- Drag-and-drop reordering
- Custom animated toggle switch (use native `Switch`)
