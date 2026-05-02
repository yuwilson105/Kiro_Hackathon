# Leader 06 — Color & Theme

> **Audience:** 24 downstream screen-builder agents.
> **Authority:** This doc is the single source of truth for color decisions. Do not invent hex values. Do not reach into the raw tailwind.config.js for colors not listed here. If a color you need isn't listed, use `text-text-muted` as a safe fallback and flag the gap.

---

## 0. Token Quick-Reference

All class names are NativeWind 4. All JS values are from `lib/theme.ts`.

| Role | NativeWind class | JS key | Hex |
|---|---|---|---|
| Page / card background | `bg-bg` | `colors.bg` | `#FFFFFF` |
| Accent surface / headers | `bg-surface` | `colors.surface` | `#EAF2FB` |
| Pressed / nested surface | `bg-surfaceDeep` | `colors.surfaceDeep` | `#DCE8F5` |
| Primary blue | `bg-primary` | `colors.primary` | `#6FA8DC` |
| Primary deeper | `bg-primary-deep` | `colors.primaryDeep` | `#4A7DB0` |
| Primary soft | `bg-primary-soft` | `colors.primarySoft` | `#A6C8E6` |
| Peach accent | `bg-accent` | `colors.accent` | `#F0B27A` |
| Accent deeper | `bg-accent-deep` | `colors.accentDeep` | `#D88947` |
| Accent soft | `bg-accent-soft` | `colors.accentSoft` | `#F8D5B3` |
| Sage success | `bg-success` | `colors.success` | `#88B17A` |
| Success deeper | `bg-success-deep` | `colors.successDeep` | `#5F8A53` |
| Warning amber | `bg-warning` | `colors.warning` | `#E0B341` |
| Muted danger | `bg-danger` | `colors.danger` | `#C77B7B` |
| Danger deeper | `bg-danger-deep` | `colors.dangerDeep` | `#9E5252` |
| Body text | `text-text` | `colors.text` | `#1F2D3D` |
| Secondary text | `text-text-muted` | `colors.textMuted` | `#6E7E8E` |
| Tertiary text | `text-text-subtle` | `colors.textSubtle` | `#A6B0BC` |
| Inverse text (on fill) | `text-text-inverse` | `colors.textInverse` | `#FFFFFF` |
| Card / input border | `border-border` | `colors.border` | `#C9D9EC` |
| Border on surface | `border-border-surface` | `colors.borderSurface` | `#B8CDE5` |
| Dividers / list separators | `border-border-subtle` | `colors.borderSubtle` | `#E5EDF6` |

---

## 1. Surface Hierarchy

Every screen has a maximum of three surface levels. Using four or more creates visual mud.

```
Level 0  bg-bg (#FFFFFF)
  └── Level 1  bg-surface (#EAF2FB)          ← cards that need lift, info callouts
        └── Level 2  bg-surfaceDeep (#DCE8F5) ← pressed states OR nested inside L1 only
```

**Rules:**
- Every screen starts at Level 0. The `<ScrollView>` / root `<View>` is always `bg-bg`.
- Greeting cards, coach-tip callouts, and info panels that need visual lift from the page use `bg-surface`.
- `bg-surfaceDeep` appears in exactly two situations: (a) pressed state of a `bg-surface` element, (b) a nested panel inside a `bg-surface` card. Never use it as a standalone card on a `bg-bg` page — it will feel like a random shade.
- If you find yourself reaching for a fourth shade, the layout needs restructuring, not another color.

---

## 2. Primary (Pastel Blue)

The primary palette signals calm, trust, and progress. It should feel steady — not splashy.

**Use `bg-primary`:**
- Filled CTA buttons (aim for one per screen).
- Tab bar active indicator.
- Progress bar fill.
- Checked toggle track.

**Use `text-primary-deep`:**
- Section headlines on `bg-bg` white, only when the headline must carry extra weight. In most cases `text-text` (navy) is the better choice — reach for `text-primary-deep` sparingly.

**Use `border-primary-soft` / `border-primary`:**
- Selected pill border (outlined pill, selected state).
- Input focus ring (2 px).

**Never:**
- `bg-primary` as a card background — it washes out the entire surface hierarchy.
- `text-primary` on `bg-surface` — contrast ratio fails WCAG AA (~2.8:1). Use `text-primary-deep` or `text-text` instead.
- More than one `bg-primary` filled button per screen.

**Weak vs. strong:**

```tsx
// WEAK — two primary fills fighting each other
<View className="bg-primary rounded-lg p-4">
  <Text className="text-primary">View Tasks</Text>
  <Pressable className="bg-primary rounded-pill px-4 py-2">
    <Text className="text-text-inverse">Add</Text>
  </Pressable>
</View>

// STRONG — primary used once, decisive
<View className="bg-surface rounded-lg p-4">
  <Text className="text-text">Your Tasks</Text>
  <Pressable className="bg-primary rounded-pill px-4 py-2">
    <Text className="text-text-inverse font-semibold">Add Task</Text>
  </Pressable>
</View>
```

---

## 3. Accent (Peach)

The peach accent traces directly to the flame logo gradient. It conveys warmth, progress, and celebration. Because the app serves people rebuilding their lives, peach should feel earned — not wallpaper.

**Use `bg-accent`:**
- Streak badge background (day count pill on the home screen).
- Milestone screen celebration moment.
- "In progress" status dot.

**Use `text-accent`:**
- Uppercase eyebrow labels: `"MORNING"`, `"URGENT"` (when urgency, not warning).
- Category label for finance / money topics in the cultural feed.

**Use `bg-accent-soft`:**
- Very light tint on celebration toasts / milestone banners when the full `bg-accent` is too saturated.

**Never:**
- `bg-accent` as a button background — it competes with `bg-primary` and breaks the visual hierarchy.
- `text-accent` for body copy or long-form text — it is a label / eyebrow color only.
- Accent on neutral content that carries no celebration or urgency meaning.

**Weak vs. strong:**

```tsx
// WEAK — accent used as a generic button
<Pressable className="bg-accent rounded-pill px-6 py-3">
  <Text className="text-text-inverse">Continue</Text>
</Pressable>

// STRONG — accent reserved for its semantic moment
<View className="bg-accent rounded-pill px-3 py-1 self-start">
  <Text className="text-text-inverse text-xs font-semibold">🔥 7-Day Streak</Text>
</View>
```

---

## 4. Success (Sage Green)

Sage is earned. Only apply it when something has genuinely succeeded. Overusing sage causes users to distrust the signal — if everything looks complete, nothing feels meaningful.

**Use `bg-success`:**
- Green check-circle icon backgrounds.
- Completed step indicator fill.

**Use `text-success-deep`:**
- "Day 7 complete" labels.
- "Felon-friendly" employer badge text (badge bg stays `bg-success` at low opacity or `bg-success` chip).

**Use `border-success` (compose with `border-l-4`):**
- Left accent border on completed task cards.

**Never:**
- Sage for decorative purposes (e.g., section backgrounds, headers) — it loses its meaning.
- `bg-success` on incomplete or uncertain states.

---

## 5. Warning (Amber)

Warning is a surface trim color, not a fill color.

**Use `text-warning` / `bg-warning`:**
- "URGENT" task pill label or pill background (small chip only).
- Setback-warning sheet top border / accent line.

**Never:**
- `bg-warning` as the background of a full card — too loud and it overwhelms the screen.
- Warning on anything that is not time-sensitive or requires user action.

---

## 6. Danger (Muted Red)

The users of this app carry significant stress. Our danger color is intentionally muted — it signals gravity without screaming alarm.

**Use `border-danger` (compose with `border-l-4` or `border`):**
- Crisis resource card: a subtle left border or card outline.

**Use `text-danger`:**
- "Struggling" mood status dot label.
- Error messages under form inputs.

**Use `bg-danger` (small surface only):**
- Error state pill or warning chip when warning amber is semantically wrong (i.e., an actual error, not urgency).

**Never:**
- A saturated bright red (`#FF0000` or similar) — always use our muted `#C77B7B`.
- `bg-danger` for an entire card background — subtlety is the intention.
- Danger colors on positive or neutral content.

---

## 7. Borders

**Which border to use:**

| Context | Token | Width |
|---|---|---|
| Cards, inputs on `bg-bg` | `border-border` | 1 px |
| Cards, panels on `bg-surface` | `border-border-surface` | 1 px |
| List dividers, row separators | `border-border-subtle` | `StyleSheet.hairlineWidth` |
| Selected / focused state | `border-border` → `border-primary` | 2 px |

**Rules:**
- Never combine a visible border (`border-border`) and a shadow (`shadow.card`) on the same element. Pick one. White-on-white elements benefit more from `border-border` than shadow.
- Hairline width (`StyleSheet.hairlineWidth`) is correct for dividers — it adapts to device pixel density.
- 2 px border is reserved for selected or focused interactive elements only.

**Weak vs. strong:**

```tsx
// WEAK — border AND shadow on the same card
<View style={[shadow.card]} className="border border-border rounded-xl p-4">

// STRONG — pick one signal
<View className="border border-border rounded-xl p-4">   // border only
<View style={shadow.card} className="rounded-xl p-4">    // shadow only
```

---

## 8. Shadows

Import from `lib/theme.ts` as inline `style` props (not className — NativeWind does not support shadow utilities reliably on React Native):

```tsx
import { shadow } from '@/lib/theme';

// Correct usage
<View style={shadow.card} className="rounded-xl bg-bg p-4" />
```

| Shadow | Token | When to use |
|---|---|---|
| `shadow.card` | `colors.text` base, 5% opacity | White cards that need a slight lift. |
| `shadow.raised` | `colors.primaryDeep` base, 12% opacity | Elevated modals, bottom sheets. |
| `shadow.fab` | `colors.primaryDeep` base, 18% opacity | "What's next?" floating action button. |

**Rules:**
- Don't apply shadow to elements that already have a visible border.
- Don't stack multiple shadows on one element.
- Most screens need at most one shadow level. If you are using `shadow.raised` on three different elements, the screen needs a layout review.

---

## 9. Category Color Coding (Cultural Feed + Resources)

Each content category maps to exactly one color token. Do not introduce new hues per category.

| Category | Token | Rationale |
|---|---|---|
| Finance / money | `text-accent` | Warmth, growth, dollar associations |
| LGBTQ+ / family | `text-success` | Life, growth, affirmation |
| Law / criminal justice | `text-danger` | Gravity (muted, never screaming) |
| Tech / social media | `text-primary-deep` | Modernity, neutrality |
| Mental health / wellness | `text-primary` | Calm, steadiness |
| Sports / entertainment | `text-text-muted` | Neutral — no semantic meaning assigned |

The category dot and the category label use the same hue. Example:

```tsx
// Finance category chip
<View className="flex-row items-center gap-1.5">
  <View className="w-2 h-2 rounded-full bg-accent" />
  <Text className="text-xs text-accent font-medium">Finance</Text>
</View>
```

---

## 10. Icon Colors

| State | Token |
|---|---|
| Default / inactive icon | `text-text` |
| Active / selected (bottom tab, current step) | `text-primary` |
| Decorative icon inside a card | `text-text-muted` |
| Success status icon | `text-success-deep` |
| Warning status icon | `text-warning` |
| Danger / error status icon | `text-danger` |
| Flame motif | Skia gradient only — `colors.accent` → `colors.accentDeep` |

**Flame motif rule:** Never render the flame logo or flame icon as a flat `text-accent` color. It must always use the Skia canvas with a linear gradient from `colors.accent` (`#F0B27A`) to `colors.accentDeep` (`#D88947`). Using a flat fill loses the warmth signal the logo is built on.

---

## 11. Theme Application Rules

1. **One bg, one text per element.** Most elements should specify exactly one background token and one text token. Do not stack three color utilities on one `<View>`.
2. **Fill over stroke.** Default to a single fill color. Add a stroke only when a fill alone fails to define the element boundary (e.g., white card on white background).
3. **No hover color shifts.** React Native press states are expressed through scale + haptic feedback, not color change. Do not use `active:` or `hover:` Tailwind variants for color transitions.
4. **Selected pills:** `bg-bg` → `bg-primary-soft`, `border-border` → `border-primary`, `text-text` stays `text-text`. Do not invert text color.
5. **One filled primary button per screen.** Secondary actions use outlined or ghost variants.
6. **text-text-subtle is tertiary and rare.** Use it only for placeholder-level content (empty-state captions, form hints). If you find yourself using it for actual UI labels, step up to `text-text-muted`.

---

## 12. Dark Mode

Out of scope for the hackathon build. The app is forced to light mode via `app.json` (`userInterfaceStyle: "light"`).

- Do not write `dark:` variants in any `className`.
- Do not add conditional dark-mode logic in components.
- If you see existing `dark:` classes in a file you are editing, leave them untouched but do not add new ones.

---

## 13. Decision Tree — "Which color token do I need?"

```
I need a color for...

├── A full-screen or root background
│     └── bg-bg

├── A card that lifts from the page
│     ├── On bg-bg → bg-surface
│     └── Nested inside bg-surface → bg-surfaceDeep (pressed or nested only)

├── A button
│     ├── Primary CTA (one per screen) → bg-primary + text-text-inverse
│     ├── Secondary / outlined → border-border + text-text (no fill)
│     └── Ghost / link → text-primary-deep (no fill, no border)

├── A status or semantic color
│     ├── Completed / success → bg-success or text-success-deep
│     ├── In progress / streak → bg-accent
│     ├── Urgent (time-sensitive) → bg-warning or text-warning
│     └── Crisis / error / struggling → border-danger or text-danger

├── A text label
│     ├── Body copy → text-text
│     ├── Secondary (metadata, captions) → text-text-muted
│     ├── Placeholder / hints → text-text-subtle
│     ├── On a filled primary button → text-text-inverse
│     └── Eyebrow / category label → text-accent (finance), text-success (LGBTQ+), etc.

├── A border
│     ├── Card / input on white → border-border (1 px)
│     ├── Card on bg-surface → border-border-surface (1 px)
│     ├── Row divider → border-border-subtle (hairline)
│     └── Selected / focused → border-primary (2 px)

└── An icon
      ├── Default → text-text
      ├── Active → text-primary
      ├── Decorative → text-text-muted
      └── Semantic status → its semantic token (success-deep, warning, danger)
```

---

## 14. Reference Example — Task Card

A single Task Card demonstrating five simultaneous color roles without conflict:

```tsx
import { shadow } from '@/lib/theme';

// Task Card: incomplete urgent task
<View
  className="bg-bg border border-border rounded-xl p-4 border-l-4 border-l-warning"
  // border-border: 1px card outline on white
  // border-l-warning: urgency left accent (no fill, keeps card light)
  // NO shadow — border is already the boundary signal
>
  {/* Status dot: in-progress */}
  <View className="w-2.5 h-2.5 rounded-full bg-accent mb-2" />
  {/*   bg-accent: peach "in progress" dot */}

  {/* Task title */}
  <Text className="text-base font-semibold text-text">
    Submit housing application
  </Text>
  {/*   text-text: navy body — default for all card titles */}

  {/* Metadata row */}
  <Text className="text-sm text-text-muted mt-1">
    Due today · Housing
  </Text>
  {/*   text-text-muted: secondary metadata */}

  {/* Urgency eyebrow */}
  <Text className="text-2xs font-semibold text-warning uppercase tracking-wide mt-2">
    URGENT
  </Text>
  {/*   text-warning: amber, small eyebrow label only */}

  {/* CTA button */}
  <Pressable className="mt-3 bg-primary rounded-pill px-4 py-2 self-start">
    <Text className="text-sm font-semibold text-text-inverse">Mark done</Text>
  </Pressable>
  {/*   bg-primary: single filled button
        text-text-inverse: white on primary fill */}
</View>
```

**Five color roles in one card — no conflicts:**
1. `bg-bg` — Level 0 card surface.
2. `border-warning` — urgency left accent, no fill needed.
3. `bg-accent` — status dot (in progress).
4. `text-text` / `text-text-muted` / `text-warning` — three text tiers.
5. `bg-primary` + `text-text-inverse` — single CTA button.

---

## 15. What Not to Do — A Cheat Sheet

| Anti-pattern | Why it breaks | Correct approach |
|---|---|---|
| `bg-primary` card background | Washes out hierarchy; makes all content feel like a button | `bg-surface` for lifted cards |
| `text-primary` on `bg-surface` | ~2.8:1 contrast — fails WCAG AA | `text-primary-deep` or `text-text` |
| `bg-accent` on a button | Competes with primary; dilutes celebration signal | `bg-primary` for buttons; `bg-accent` for badges only |
| `dark:` class variants | App is forced light; dark variants add dead code | Remove any `dark:` utilities |
| Four surface levels on one screen | Visual mud — users lose depth sense | Max three levels (bg / surface / surfaceDeep) |
| Border + shadow on same element | Redundant boundary signals, heavy feel | Pick one: border OR shadow |
| Bright saturated red (`#FF0000`) | Alarms users who already carry stress | Always `bg-danger` (#C77B7B) or `text-danger` |
| Inventing a hex value | Breaks token consistency, can't be globally updated | Only use tokens from this doc or tailwind.config.js |
| Sage on decorative elements | Sage means "done" — using it decoratively breaks the earned signal | `bg-surface` or `bg-primary-soft` for decoration |
| Multiple `bg-primary` buttons | Removes the visual anchor; users can't find the primary action | One filled primary button per screen max |
