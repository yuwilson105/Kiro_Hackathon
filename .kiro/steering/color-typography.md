---
inclusion: always
---

# Color & Typography

## Color Tokens

All values from `lib/theme.ts`. Never invent hex values.

| Role                     | NativeWind class    | Hex     |
| ------------------------ | ------------------- | ------- |
| Page background          | `bg-bg`             | #FFFFFF |
| Card / lifted surface    | `bg-surface`        | #EAF2FB |
| Pressed / nested surface | `bg-surfaceDeep`    | #DCE8F5 |
| Primary blue             | `bg-primary`        | #6FA8DC |
| Primary deeper           | `bg-primary-deep`   | #4A7DB0 |
| Peach accent             | `bg-accent`         | #F0B27A |
| Sage success             | `bg-success`        | #88B17A |
| Warning amber            | `bg-warning`        | #E0B341 |
| Muted danger             | `bg-danger`         | #C77B7B |
| Body text                | `text-text`         | #1F2D3D |
| Secondary text           | `text-text-muted`   | #6E7E8E |
| Tertiary text            | `text-text-subtle`  | #A6B0BC |
| Inverse text (on fills)  | `text-text-inverse` | #FFFFFF |

## Surface Hierarchy — Max 3 Levels

```
Level 0  bg-bg (#FFFFFF)          ← root/ScrollView
  └── Level 1  bg-surface         ← lifted cards, callouts
        └── Level 2  bg-surfaceDeep ← pressed states or nested inside Level 1 only
```

Never use `bg-surfaceDeep` as a standalone card on `bg-bg`. Never use 4+ surface levels.

## Color Rules

- Body text is always `text-text` — no exceptions
- `text-muted` only on `bg-bg` (white). On `bg-surface` use `#5C6B7B`
- `text-primary` on `bg-surface` FAILS contrast — use `text-primary-deep` or `text-text`
- `text-inverse` on `bg-primary` FAILS — never white body text on pastel blue
- One filled `bg-primary` button per screen maximum
- `bg-primary` is never a card background
- `bg-accent` is for streak badges and milestone moments — never buttons
- `bg-success` means "done" — never use decoratively
- Border OR shadow on a card — never both
- No `dark:` variants — app is forced light mode

## Typography

Font: Inter via `@expo-google-fonts/inter`. Three weights only:

- `font-sans` — 400 (body)
- `font-medium` — 500 (buttons, labels, titles)
- `font-semibold` — 600 (hero numerics, splash, milestone H1 only)

**Never `font-bold` (not loaded). Never italic (not loaded).**

## Size Tokens

| Token          | px  | Use                                     |
| -------------- | --- | --------------------------------------- |
| `text-2xs`     | 10  | Uppercase eyebrows ONLY                 |
| `text-xs`      | 12  | Timestamps, fine print                  |
| `text-sm`      | 14  | Secondary body, descriptions            |
| `text-base`    | 16  | Default body                            |
| `text-lg`      | 18  | Large-context body, crisis card minimum |
| `text-xl`      | 20  | Emphasized stat labels                  |
| `text-2xl`     | 24  | Greeting line                           |
| `text-3xl`     | 28  | Page H1, onboarding header              |
| `text-4xl`     | 32  | Splash hero                             |
| `text-display` | 44  | Streak number, hero numerics            |

Never use arbitrary pixel values. Never manually override `tracking-*` or `leading-*` except `tracking-wider` on eyebrows and `leading-5`/`leading-6` on paragraph blocks.

## Typography Rules

- `font-semibold` only for: hero numerics, splash line, milestone H1
- If unsure between 500 and 600 — choose 500
- Eyebrows: `text-2xs font-medium uppercase tracking-wider`
- All UI labels: sentence case. Eyebrows are the only ALL CAPS exception
- Button labels: no trailing period
- Body copy and descriptions: end with a period
- `text-text-muted` only on `bg-bg`. On `bg-surface` use `text-text`
- `text-text-subtle` is tertiary and rare — placeholder-level content only

## Icon Colors

- Default: `text-text`
- Active/selected: `text-primary`
- Decorative: `text-text-muted`
- Flame motif: Skia gradient only (`colors.accent` → `colors.accentDeep`) — never flat fill
