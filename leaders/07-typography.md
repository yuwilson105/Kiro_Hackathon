# Leader 07 — Typography

**Audience:** 24 downstream screen-builder agents.
**Purpose:** Prescriptive rules for every typographic decision in the SecondChance mobile app. Follow these exactly. Do not invent font sizes, weights, or letter-spacing values.

---

## 0. Foundation

**Font family:** Inter via `@expo-google-fonts/inter`. Three weights only:

| Token | Weight | Loaded as |
|---|---|---|
| `font-sans` | 400 | Inter_400Regular |
| `font-medium` | 500 | Inter_500Medium |
| `font-semibold` | 600 | Inter_600SemiBold |

**Never use `font-bold` (700).** Inter Bold is not loaded — it will silently fall back to system bold and break visual consistency. Never use italic — no italic variant is loaded.

---

## 1. Size Tokens — Full Reference

Do not use arbitrary pixel values. Use only these tokens:

| Token | px | Line-height | Letter-spacing | Notes |
|---|---|---|---|---|
| `text-2xs` | 10 | 14 | +0.6 | Uppercase eyebrows ONLY |
| `text-xs` | 12 | — | — | Timestamps, fine print |
| `text-sm` | 14 | 1.4–1.5 (leading-5) | — | Secondary body, card descriptions |
| `text-base` | 16 | 1.4–1.5 (leading-6) | — | Default body |
| `text-lg` | 18 | — | — | Large-context body |
| `text-xl` | 20 | — | — | Emphasized stat labels |
| `text-2xl` | 24 | ~1.2 | −0.5 (token) | Greeting line |
| `text-3xl` | 28 | ~1.15 | −0.5 (token) | Page H1, onboarding header |
| `text-4xl` | 32 | ~1.15 | −0.6 (token) | Splash hero |
| `text-display` | 44 | ~1.1 | −1 (token) | Streak number, hero numerics |

The tokens already encode line-height and letter-spacing. **Do not manually override** `tracking-*` or `leading-*` unless you are applying `tracking-wider` on an eyebrow (which the `text-2xs` token does not handle on its own) or `leading-5` / `leading-6` on body copy explicitly for paragraph blocks.

---

## 2. Weight Rules

### 400 — `font-sans`
Use for: all body copy, paragraph text, card descriptions, hints, help text, subheaders, muted labels.

### 500 — `font-medium`
Use for: button labels, navigation tab labels, section headers, task titles, day-of-week labels, greeting names, wellness section labels, outlined button labels.

### 600 — `font-semibold`
Use **sparingly** and **only** for: hero numerics (streak count, "Day 47", "Week 3", milestone numbers), splash hero display text, milestone H1 ("You got your ID."), and section H1s when the screen warrants an anchor moment.

**If you are unsure between 500 and 600 — choose 500.**

---

## 3. Size Hierarchy by Surface

### Splash screen
```
"Second Chance"  → text-4xl font-semibold tracking-tight
"Your next chapter, step by step."  → text-base font-sans text-text-muted
```

### Onboarding
```
Header "Let's start with…"  → text-3xl font-medium
Subheader body              → text-base font-sans text-text-muted leading-6
```

### Interior page
```
Page H1 "Your roadmap"  → text-3xl font-medium text-text
Page subtitle           → text-sm font-sans text-text-muted
```

### Card (task / step / resource)
```
Eyebrow     → text-2xs font-medium uppercase tracking-wider text-text-muted
Card title  → text-base font-medium text-text
Description → text-sm font-sans text-text-muted leading-5
```

### Buttons
```
Primary CTA (filled)    → text-base font-medium text-text-inverse
Outlined / pill button  → text-sm font-medium text-text (or semantic color)
```

### Hero numerics
```
Streak / milestone number  → text-display font-semibold
Supporting label           → text-2xs font-medium uppercase tracking-wider text-text-muted
```

### Greeting
```
"Good morning, Marcus."  → text-2xl font-medium text-text
```

### Navigation tabs
```
Tab label  → text-2xs font-medium text-text-muted (active: text-primary or text-text)
```

---

## 4. Decision Tree — "What classes do I use?"

```
I am writing a…

├── Hero number (streak, day count, milestone)
│   └── text-display font-semibold

├── Splash or celebration H1
│   ├── Splash logo line       → text-4xl font-semibold
│   └── Milestone declaration  → text-3xl font-semibold

├── Page H1 / onboarding header
│   └── text-3xl font-medium

├── Greeting line ("Good morning, …")
│   └── text-2xl font-medium

├── Section header (interior page)
│   └── text-xl font-medium  (or text-lg font-medium if space is tight)

├── Card or list-item title
│   └── text-base font-medium

├── Body / description / help text
│   └── text-sm font-sans text-text-muted  (or text-base font-sans for long-form)

├── Eyebrow / category label
│   └── text-2xs font-medium uppercase tracking-wider text-text-muted
│       (use semantic color only when category is visually colored)

├── Button label — primary filled
│   └── text-base font-medium text-text-inverse

├── Button label — outlined / pill
│   └── text-sm font-medium

├── Tab label
│   └── text-2xs font-medium

├── Timestamp / fine print
│   └── text-xs font-sans text-text-muted

└── Wellness section label
    └── text-sm font-medium uppercase tracking-wider text-text-muted
```

---

## 5. Spacing and Line Height

- **Body paragraphs** (`text-sm`, `text-base`): use `leading-5` or `leading-6` on block-level text elements. The size tokens set a base, but explicitly declaring leading on paragraph-heavy screens prevents platform inconsistency.
- **Display sizes (≥ text-2xl)**: leave line-height to the token (~1.15–1.2). Do not add extra leading.
- **Paragraph spacing**: add `mt-3` (12pt) or `mt-4` (16pt) between consecutive paragraphs. Use `gap-3` or `gap-4` on a flex/VStack parent when building a text block stack.
- **Letter-spacing**: do not touch it manually. Tokens encode the right values. The only manual exception is `tracking-wider` on eyebrow labels because `text-2xs` does not automatically apply it.

---

## 6. Text Color Defaults

| Context | Token |
|---|---|
| Primary body text | `text-text` (navy) |
| Secondary / muted | `text-text-muted` (on white background only) |
| On `bg-surface` | use `text-text`, not `text-text-muted` |
| On primary-filled button | `text-text-inverse` (white) |
| Decorative hero numerics | `text-text` (preferred); `text-primary-deep` occasionally |
| Eyebrow — neutral | `text-text-muted` |
| Eyebrow — categorized | semantic color (`text-accent` for finance, `text-success` for LGBTQ+, etc.) |

---

## 7. Case and Punctuation

- **Sentence case everywhere** except eyebrow labels.
  - Correct: "Get your state ID"
  - Wrong: "Get Your State ID"
- **Eyebrow labels**: ALL CAPS, always.
- **Periods**: end of sentences in descriptions and body copy. No period on buttons or labels.
- **Em-dash** (—) for asides in conversational copy: "That's okay — we'll figure this out."
- **Colon** for leading into a list or explanation: "You'll need: ID, proof of address, …"
- **Numbers**: spell out under 10 in body copy ("two weeks"), digits for stats and counters ("Day 47", "3 min read", "62%").
- **Percentages**: no space — "62%" not "62 %".
- **Counts in copy**: "2 of 3 done" — not "2/3 done".
- **Quotation marks**: curly " " in prose. Straight " " inside code strings only.

---

## 8. Content-Specific Patterns

### Greeting line
```jsx
<Text className="text-2xl font-medium text-text">
  Good morning, Marcus.
</Text>
```
Comma after name, period at end.

### Streak badge (inside a card or widget)
```jsx
<View className="items-center gap-1">
  <Text className="text-display font-semibold text-text">47</Text>
  <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted">
    day streak
  </Text>
</View>
```

### Milestone declaration
```jsx
<Text className="text-3xl font-semibold text-text">
  You got your ID.
</Text>
```

### "Why now?" explanatory text
Do not use italic (not loaded). Use:
```jsx
<Text className="text-sm font-sans text-text-muted leading-5">
  Getting your ID now means you can open a bank account, apply for jobs, and
  access benefits faster.
</Text>
```

### Wellness / section divider label
```jsx
<Text className="text-sm font-medium uppercase tracking-wider text-text-muted">
  Mental health
</Text>
```

---

## 9. Full Task Card Example

This is the canonical pattern. All class names are spelled out.

```jsx
<View className="bg-white rounded-2xl p-4 gap-2">

  {/* Eyebrow */}
  <Text className="text-2xs font-medium uppercase tracking-wider text-accent">
    Morning
  </Text>

  {/* Card title */}
  <Text className="text-base font-medium text-text">
    Call the housing office
  </Text>

  {/* Card description */}
  <Text className="text-sm font-sans text-text-muted leading-5">
    Confirm your case worker appointment for Thursday. Ask about the rental
    assistance program if you have time.
  </Text>

  {/* Primary CTA button */}
  <TouchableOpacity className="bg-primary rounded-xl px-4 py-3 mt-2 items-center">
    <Text className="text-base font-medium text-text-inverse">
      Mark as done
    </Text>
  </TouchableOpacity>

</View>
```

---

## 10. Icon + Text Pairing

Match icon visual weight to text weight:

| Text weight | Icon stroke-width |
|---|---|
| 400 `font-sans` | 1.5px |
| 500 `font-medium` | 2px (Lucide default — fine here) |
| 600 `font-semibold` | 2.5px |

Match icon size to text size: a `text-base` (16px) label gets a 16pt icon. Use `gap-2` between icon and label in a row.

```jsx
<View className="flex-row items-center gap-2">
  <Icon size={16} strokeWidth={2} color={colors.textMuted} />
  <Text className="text-base font-medium text-text">Step title</Text>
</View>
```

---

## 11. Number Formatting

| Type | Format |
|---|---|
| Phone | (415) 555-0123 |
| Date — short | Tuesday · May 2 |
| Date — long | May 2, 2026 |
| Time | 8:00 am (lowercase, no period) |
| Percentage | 62% |
| Fraction in copy | "2 of 3 done" |

---

## 12. When to Break the Rules

The **flame logo** and **milestone celebration screens** are graphic moments. Typography may scale beyond `text-display` using Skia or a custom animated text layer. These are the only exceptions. All other surfaces must use the token system.

---

## 13. QA Checklist for Builders

Before submitting any screen:

- [ ] Every text size comes from a token (`text-sm`, `text-base`, `text-2xl`, …) — no arbitrary pixel values.
- [ ] Body text uses `font-sans` (400). No body text has `font-semibold`.
- [ ] The only `font-semibold` elements are hero numerics, the splash line, or milestone H1s.
- [ ] No `font-bold` anywhere — it is not loaded.
- [ ] No `italic` anywhere — it is not loaded.
- [ ] All eyebrows are `text-2xs font-medium uppercase tracking-wider`.
- [ ] All UI labels are sentence case. Eyebrows are the only ALL CAPS exception.
- [ ] Button labels have no trailing period.
- [ ] Body copy and descriptions end with a period.
- [ ] Letter-spacing is not manually overridden (except `tracking-wider` on eyebrows).
- [ ] `text-text-muted` is only used on white (`bg-white`) backgrounds. On `bg-surface` use `text-text`.
- [ ] Icon size matches text size in pt. Icon stroke-width matches text weight per the table above.
