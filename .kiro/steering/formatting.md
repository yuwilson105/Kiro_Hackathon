---
inclusion: always
---

# Formatting & Code Standards

## File & Directory Naming

| Thing              | Convention             | Example                            |
| ------------------ | ---------------------- | ---------------------------------- |
| Source files       | kebab-case             | `step-card.tsx`, `use-progress.ts` |
| Route files        | Expo Router convention | `app/(tabs)/home.tsx`              |
| Component exports  | PascalCase             | `export function StepCard(...)`    |
| Utility/hook files | kebab-case             | `lib/format-date.ts`               |
| Directories        | kebab-case             | `components/plan/`                 |

## Import Order

Four groups, one blank line between each:

```tsx
// Group 1 — React, React Native, Expo
import { useEffect } from "react";
import { View, Pressable } from "react-native";

// Group 2 — Third-party libraries
import Animated from "react-native-reanimated";

// Group 3 — Internal lib (always @/ alias)
import { colors } from "@/lib/theme";
import { useStore } from "@/lib/store";

// Group 4 — Internal components (always @/ alias)
import { StepCard } from "@/components/plan/step-card";
```

Never use relative `../` imports. Always use the `@/` alias.

## Component Shape

```tsx
type Props = {
  label: string;
  onPress: () => void;
};

export function StepCard({ label, onPress }: Props) {
  return (...)
}
```

- Always `export function` — never `export default function`, never `export default` at bottom
- Props type is `type Props = { ... }` directly above the component
- No `interface Props` — use `type`
- No `React.FC`
- Destructure props inline in the function signature

## NativeWind

- Default to `className` for static styles
- Use `style` only for dynamic values computed at runtime
- Never use `style` for things `className` handles (padding, bg color, border radius)
- Shadows have no Tailwind utility — always `style={shadow.card}` from `@/lib/theme`

## Conditional className

```tsx
// Simple toggle
<View
  className={`rounded-xl px-4 ${isActive ? "bg-primary" : "bg-surface"}`}
/>;

// Multi-condition
const cls = [
  "rounded-xl px-4",
  isActive && "bg-primary",
  hasError && "border-danger",
]
  .filter(Boolean)
  .join(" ");
```

## TypeScript

- No `any` — ever
- `type` over `interface`
- Discriminated unions for state shapes
- Explicit return types on exported functions
- Strict mode is on — the compiler is not a suggestion

## Component Extraction

Extract to its own file when either:

1. Reused in 2+ places
2. Component definition exceeds 80 lines

## File Length

~250 lines per file maximum. Split early — move sub-components, utilities, or hooks to separate files.

## No Barrel Exports

Never create `index.ts` files. Keep imports explicit.

```tsx
// WRONG
import { StepCard } from "@/components/ui";

// CORRECT
import { StepCard } from "@/components/plan/step-card";
```

## Comments

Write almost none. Names are documentation. Only comment to explain **why** something non-obvious exists. No TODO comments, no commented-out code, no JSDoc on internal helpers.

## Screen-Specific Component Location

- Screen-specific components: `components/<screen-name>/`
- Shared primitives: `components/ui/`
- Animated primitives: `components/animations/`
- Hooks: `hooks/use-<name>.ts`
- Utilities: `lib/` or colocated `utils.ts`
