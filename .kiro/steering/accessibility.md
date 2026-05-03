---
inclusion: always
---

# Accessibility

Every screen ships accessible or it does not ship. This app serves people who may not have touched a smartphone in years, have low literacy, aging vision, or cognitive load barriers.

## Contrast (WCAG AA minimum)

- Body text: always `text-text` (#1F2D3D) on any background — 13.4:1 AAA on white
- `text-muted` only on white (`bg-bg`). On `bg-surface`, use `#5C6B7B` instead
- `text-primary` (#6FA8DC) on `bg-surface` FAILS — use `text-primary-deep` or `text-text`
- `text-inverse` on `bg-primary` FAILS — never white text on pastel blue for body copy
- `text-success` (#88B17A) on white FAILS — icon only, never body text

## Touch Targets

- Minimum 44×44pt for every interactive element
- Use `hitSlop` to expand small visual elements
- Adjacent interactive elements: minimum 8pt separation edge-to-edge

## Screen Reader

Every `Pressable` needs all three:

```tsx
accessibilityRole="button"
accessibilityLabel="Human-readable description"
accessibilityState={{ ... }} // when stateful
```

Hide decorative elements:

```tsx
<View accessibilityElementsHidden importantForAccessibility="no">
```

Group related text nodes under one `accessible={true}` parent so VoiceOver reads them as one announcement.

Skia canvases: `accessible={false}` on the Canvas, labeled parent View wrapping it.

## Reduced Motion

Check `useReducedMotion()` in every animated component. If true:

- Entrance animations: opacity-only, no translate/scale
- Loop animations: disabled entirely
- Confetti: replace with static milestone card

## Dynamic Type

- Never `allowFontScaling={false}` on content text
- Test at 1.5× and 2× system font scale — layouts must wrap, not clip
- Use `flexShrink: 1` on text containers in rows

## Color-Independent Status

Never communicate state through color alone. Always pair color with shape:

- Not started: hollow circle + border color
- In progress: filled dot + amber color
- Complete: checkmark glyph + sage color
- Crisis: "Crisis Support" label + danger border

## Crisis Card — Highest Priority

- Pinned in Wellness tab, never below the fold on first load
- Reachable in 2 taps or fewer from anywhere in the app
- No animations whatsoever
- Body text minimum 18pt (`text-lg`)
- `accessibilityHint` on call button must mention "free and confidential"
- Loads from local constants — never waits on a network call

## Copy Accessibility

- 7th-grade reading level
- Short sentences, active voice, one idea per sentence
- No idioms, no double negatives
- Button labels are imperative and specific: "Mark as complete" not "Done", "Go to housing options" not "Continue"
- Explain acronyms on first use
