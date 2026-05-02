# Leader 01 — Formatting & File Structure

Standards for all 24 screen-builder agents. Read this before writing a single line. These rules are non-negotiable.

---

## 1. File & Directory Naming

| Thing | Convention | Example |
|---|---|---|
| Source files | kebab-case | `step-card.tsx`, `use-progress.ts` |
| Route files | lowercase, Expo Router convention | `app/(tabs)/home.tsx`, `app/milestone.tsx` |
| Component exports | PascalCase | `export function StepCard(...)` |
| Utility / hook files | kebab-case | `lib/format-date.ts`, `hooks/use-store-hydrated.ts` |
| Directories | kebab-case | `components/plan/`, `components/home/` |

Route groups use parentheses as Expo Router requires: `app/(onboarding)/`, `app/(tabs)/`.  
Screen-specific components live under `components/<screen-name>/`, e.g. `components/plan/step-card.tsx`.  
Shared primitives live under `components/ui/`.

---

## 2. Import Order

Four groups, one blank line between each. Within a group, order doesn't matter.

```tsx
// Group 1 — React, React Native, Expo
import { useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';

// Group 2 — Third-party libraries
import Animated, { FadeInDown } from 'react-native-reanimated';

// Group 3 — Internal lib (always via @/ alias)
import { colors, radii, shadow } from '@/lib/theme';
import { enter, spring } from '@/lib/motion';
import { tap } from '@/lib/haptics';
import { useStore } from '@/lib/store';

// Group 4 — Internal components (always via @/ alias)
import { ProgressRing } from '@/components/ui/progress-ring';
import { StepCard } from '@/components/plan/step-card';
```

Never use relative `../` imports. The `@/*` alias resolves from the project root — always use it.

---

## 3. Component Shape

```tsx
// DO

type Props = {
  label: string;
  completed: boolean;
  onPress: () => void;
};

export function StepCard({ label, completed, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="rounded-xl bg-surface px-4 py-3">
      <Text className="text-base font-medium text-text">{label}</Text>
    </Pressable>
  );
}
```

```tsx
// DON'T

const StepCard: React.FC<{ label: string }> = ({ label }) => { ... };
// — no React.FC, no arrow-function default export, no inline anonymous export
```

Rules:
- Always `export function`, never `export default function` and never `export default` at the bottom.
- Props type is `type Props = { ... }` defined directly above the component, not imported or in a separate file unless reused across files.
- No `interface Props`. Use `type`.
- Destructure props inline in the function signature.

---

## 4. NativeWind Usage

**Default to `className`.** Use `style` only when the value is dynamic (computed at runtime).

```tsx
// DO — static styles via className
<View className="flex-1 bg-surface px-4 pt-6 rounded-xl" />

// DO — dynamic value that className can't express: use style with tokens
import { colors, radii } from '@/lib/theme';

<View
  className="flex-1 px-4"
  style={{ backgroundColor: isComplete ? colors.success : colors.surface, borderRadius: radii.lg }}
/>

// DON'T — don't reach for style for things className handles
<View style={{ paddingHorizontal: 16, backgroundColor: '#EAF2FB' }} />
```

Available NativeWind color tokens (from `tailwind.config.js`):
- `bg-bg`, `bg-surface`, `bg-surfaceDeep`
- `bg-primary`, `bg-primary-deep`, `bg-primary-soft`
- `bg-accent`, `bg-accent-deep`, `bg-accent-soft`
- `bg-success`, `bg-success-deep`
- `bg-warning`, `bg-danger`, `bg-danger-deep`
- `text-text`, `text-text-muted`, `text-text-subtle`, `text-text-inverse`
- `border-border`, `border-border-surface`, `border-border-subtle`

Font utilities: `font-sans` (regular 400), `font-medium` (500), `font-semibold` (600).

Shadows have no Tailwind utility — always apply via `style={shadow.card}` or `style={shadow.raised}` from `@/lib/theme`.

---

## 5. Conditional className

Use template literals for simple toggling. Never assemble class strings with ad-hoc logic scattered through JSX.

```tsx
// DO — template literal
<View className={`rounded-xl px-4 py-3 ${isActive ? 'bg-primary' : 'bg-surface'}`} />

// DO — multi-condition, kept readable
const containerClass = [
  'rounded-xl px-4 py-3',
  isActive && 'bg-primary',
  hasError && 'border border-danger',
  !isActive && !hasError && 'bg-surface',
]
  .filter(Boolean)
  .join(' ');

<View className={containerClass} />

// DON'T — scattered ternaries in JSX
<View
  className={`${a ? 'bg-primary' : 'bg-surface'} ${b ? 'border' : ''} ${c ? 'opacity-50' : ''} rounded-xl`}
/>
```

---

## 6. When to Extract a Component

Extract into its own file when **either** condition is true:

1. The JSX subtree is **reused in 2 or more places**.
2. The component definition (type + function body) **exceeds 80 lines**.

Keep it inline only when it's a one-off, ≤80 lines, and has no independent state or animation.

```tsx
// inline is fine — small, single-use
function SectionHeader({ title }: { title: string }) {
  return <Text className="text-lg font-semibold text-text mb-2">{title}</Text>;
}

// must be extracted — reused, or will grow
// components/plan/step-card.tsx
export function StepCard(...) { ... }
```

Private sub-components used only within one file can live in the same file *above* the main export, but count toward the file's line budget.

---

## 7. File Length Cap

**~250 lines per file.** When a file approaches that, split it:

- Move large sub-components to their own files in the same directory.
- Move utility functions to `lib/` or a colocated `utils.ts`.
- Move complex hooks to `hooks/use-<name>.ts`.

No exceptions for "it's almost done" — split early.

---

## 8. TypeScript

```tsx
// No any — ever
const value: any = ...; // banned

// prefer type over interface
type CheckInStatus = 'idle' | 'loading' | 'done' | 'error'; // good
interface CheckInStatus { ... } // avoid

// Discriminated unions for state shapes
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: T }
  | { status: 'error'; message: string };

// Use typeof for token-derived types
import { colors } from '@/lib/theme';
type ColorToken = keyof typeof colors; // 'bg' | 'surface' | 'primary' | ...

// Prefer explicit return types on exported functions
export function formatStreak(days: number): string { ... }
// Inline inference is fine for local variables and callbacks
```

Strict mode is on (`"strict": true` in tsconfig). The compiler is not a suggestion.

---

## 9. Comments

Write almost none. Names are documentation.

```tsx
// DON'T — noise
// Check if user has completed onboarding
const isOnboarded = user.onboardingComplete;

// DO — say nothing, the name says it
const isOnboarded = user.onboardingComplete;
```

The only comments worth writing explain **why** something non-obvious exists:

```tsx
// Reanimated shared values must not be read on the JS thread during layout;
// derive a display string in useDerivedValue instead.
const displayDays = useDerivedValue(() => `${streak.value}d`);
```

No TODO comments. No commented-out code. No JSDoc on internal helpers.

---

## 10. No Barrel Exports

Never create `index.ts` files. Keep imports explicit and traceable.

```tsx
// DON'T
// components/ui/index.ts
export { ProgressRing } from './progress-ring';
export { StepCard } from './step-card';

// DON'T (at import site)
import { ProgressRing, StepCard } from '@/components/ui';

// DO
import { ProgressRing } from '@/components/ui/progress-ring';
import { StepCard } from '@/components/plan/step-card';
```

Explicit imports make refactors safe and codesearch reliable.

---

## Quick Reference — Real Paths

| Token file | What's in it |
|---|---|
| `@/lib/theme` | `colors`, `radii`, `spacing`, `type`, `shadow` |
| `@/lib/motion` | `ease`, `duration`, `spring`, `enter`, `stagger` |
| `@/lib/haptics` | `tap`, `select`, `success`, `warn` |
| `@/lib/store` | Zustand store — hydration gated in `app/_layout.tsx` |

Animation entry presets live in `enter.*` (`enter.fadeUp(delay)`, `enter.fade(delay)`, etc.).  
Spring configs live in `spring.*` (`spring.snap`, `spring.gentle`, `spring.press`, `spring.bouncy`).  
Always import Skia primitives from `@shopify/react-native-skia`, Reanimated from `react-native-reanimated`.
