# Leader 03: Anti-AI-Slop Standards

**Read this before writing a single line of UI.** These rules apply to every screen you build for SecondChance. If you ship a pattern listed here, it will be rejected. No exceptions.

---

## Why This Matters

SecondChance serves people rebuilding their lives after incarceration. The UI needs to feel like it was made by a human who gives a damn — not assembled from a Tailwind starter kit at 2am. Generic AI-generated UIs read as disrespect to people who already navigate a world full of systems that treat them as afterthoughts.

The user has Awwwards-level design sensitivity. He will catch template energy immediately. This is the most-failed quality bar on past projects. Do not underestimate it.

---

## The 20 Forbidden Patterns

### 1. Generic gradient hero blobs

**Why it fails:** Every SaaS landing page, every onboarding flow from a Tailwind template, every AI-generated Figma mockup uses these. They signal "I used a template" before the user reads a word.

**Reject:**
```tsx
<View className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20 rounded-full blur-3xl" />
```

**Reach for:** A single intentional Skia element — the flame motif, a wash of `surface` with a subtle peach border at the bottom edge. One deliberate move, not ambient blob soup.

---

### 2. Card grids that look like dashboard widgets

**Why it fails:** Four equal-size cards in a 2x2 grid is a Notion clone. It reads as "I thought about information architecture for zero seconds."

**Reject:**
```tsx
<View className="grid grid-cols-2 gap-4">
  <Card title="Tasks" icon={<CheckIcon />} count={3} />
  <Card title="Documents" icon={<FileIcon />} count={7} />
  ...
</View>
```

**Reach for:** Asymmetric hierarchy. One large primary item, supporting items below at different scales. Let content weight determine layout.

---

### 3. Setup copy that sounds like a product tour

**Why it fails:** "Welcome to SecondChance", "Get started in seconds", "Your journey begins here" — this is what every app says. It's noise. People skip it.

**Reject:**
- "Welcome to SecondChance"
- "Get started in seconds"
- "Your journey begins"
- "Begin your transformation"
- "We're here to help you succeed"

**Reach for:** Specific, direct, grounded copy. If it's a first-open screen, try something like: "Here's what matters most this week." No greeting ceremony.

---

### 4. Shadow-lg on rounded-xl cards

**Why it fails:** `shadow-lg shadow-black/10` on a `rounded-xl` card is the universal Tailwind UI tell. Every tutorial, every starter kit, every AI code output does this. It screams "component library, untouched."

**Reject:**
```tsx
<View className="rounded-xl bg-white shadow-lg shadow-black/10 p-4" />
```

**Reach for:**
```tsx
<View className="rounded-xl bg-surface border border-border-subtle p-4" />
```

Surface elevation via border, not shadow. The `border-border-subtle` at 1px reads as crafted. The shadow reads as default.

---

### 5. `via-white/20` diagonal sheen on buttons

**Why it fails:** This specific treatment — a `bg-gradient-to-br from-primary via-white/20 to-primary` on buttons — is the AI template button. It appears in thousands of generated UIs. It reads as unexamined.

**Reject:**
```tsx
<Pressable className="bg-gradient-to-br from-primary via-white/20 to-primary rounded-full px-6 py-3">
```

**Reach for:** Flat primary color with deliberate pressed state via Reanimated. The button's quality comes from its motion, not a sheen.

```tsx
// Pressed state darkens by 10%, no gradient
const animatedStyle = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(pressed.value, [0, 1], ['#6FA8DC', '#5A90C4']),
}));
```

---

### 6. "All systems operational" status pills

**Why it fails:** The green pulsing dot + "All systems operational" pill is a direct Vercel/Linear UI pattern. When used in a non-infrastructure app it reads as cargo-culted. In a reentry app it reads as completely out of place.

**Reject:**
```tsx
<View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-success/10">
  <View className="w-2 h-2 rounded-full bg-success animate-ping" />
  <Text className="text-success text-xs">All systems operational</Text>
</View>
```

**Reach for:** If you need a status indicator, make it contextual: "Check-in synced 2 min ago." Text only, muted, no animation.

---

### 7. "RECOMMENDED" pill with green dot

**Why it fails:** The bordered rounded-full pill containing "RECOMMENDED" + a green dot is a pricing page component. It looks imported from a SaaS upsell flow and has no warmth.

**Reject:**
```tsx
<View className="border border-success rounded-full px-3 py-1 flex-row items-center gap-1">
  <View className="w-2 h-2 rounded-full bg-success" />
  <Text className="text-xs text-success uppercase tracking-widest">Recommended</Text>
</View>
```

**Reach for:** If something needs to be called out, use weight and position — put it first in the list, make its text larger. Let hierarchy speak, not a badge.

---

### 8. Glassmorphism everywhere

**Why it fails:** When every card uses `bg-white/10 backdrop-blur-md border border-white/20`, it reads as a 2022 trend that has been fully mined. It also harms legibility on a reentry app where content clarity is critical.

**Rule:** One glassmorphism element per screen, maximum. Use it for a floating action element or a modal overlay — never for content cards.

**Reject:** Three cards with `backdrop-blur` on the same screen.

**Reach for:** `bg-surface border border-border-subtle` for content cards. Reserve blur for a single overlay or ambient element that needs to feel lifted.

---

### 9. Lottie confetti from the marketplace

**Why it fails:** Marketplace Lottie files are instantly recognizable. The particle physics, the colors, the looping — they read as stock. They feel like a birthday app, not a reentry companion.

**Rule:** All particle effects use Skia. If a milestone or streak needs a celebration moment, build it with `@shopify/react-native-skia` particles using our palette colors: peach, sage, muted navy.

---

### 10. Storyset / unDraw illustrations

**Why it fails:** These illustration libraries are used in millions of apps. SecondChance users may have seen the same figure on a government benefits website, a job board, and a debt collection notice. Do not use them.

**Rule:** Zero stock illustrations. If visuals are needed beyond typography and the flame motif, use geometric Skia shapes or real photography (cleared for use). Abstract > stock.

---

### 11. Centered hero + subtitle + CTA with a twee subhead

**Why it fails:** The pattern of `[Bold centered headline] / [Muted subtitle] / [Primary CTA button]` stacked vertically in the center of a screen is the default mobile onboarding template. It requires zero thought and communicates zero personality.

**Reject:**
```
Built differently. On purpose.
SecondChance helps you navigate life after incarceration with tools that actually work.

[Get Started]
```

**Reach for:** Lead with a specific, useful action or piece of information. Skip the mission statement. The app's purpose should be obvious from what it shows, not what it claims about itself.

---

### 12. Em-dash used to introduce examples in body copy

**Why it fails:** The pattern "Real, working tools — like checklists, document reminders, and check-in tracking" is a trained AI writing tell. It appears constantly in AI-generated copy.

**Rule:** Use a colon to introduce examples. Em-dash is for parenthetical asides only, used sparingly.

**Reject:** "We built something real — tools for IDs, housing, and check-ins."
**Accept:** "We built something real: tools for IDs, housing, and check-ins."

---

### 13. Two-clause "X. Then Y." motivational headlines

**Why it fails:** "Stop wishing. Start doing." / "Less stress. More progress." / "One day at a time. Every time." — this cadence is corny, overused, and condescending to an audience that has been through significant hardship.

**Reject:**
- "Stop waiting. Start building."
- "One step. Every day."
- "Your past is done. Your future starts now."

**Reach for:** A single declarative statement that is specific and honest. "Week 3 of 8." "You've got 2 documents left to file." No rhythm games.

---

### 14. Personification of the app

**Why it fails:** "Your app remembers," "We listen," "The tool that gets you" — this reads as manipulative when aimed at a population that has been failed by institutions. The app doesn't listen. It stores data. Say what it does.

**Reject:**
- "SecondChance remembers what matters to you"
- "We're in your corner"
- "The app that understands your journey"

**Reach for:** Functional specificity. "Your documents are saved locally and backed up when you connect to wifi." Trust is built by clarity, not warmth theater.

---

### 15. Gym-poster motivation copy

**Why it fails:** "Start your journey," "Crush your goals," "Unlock your potential," "You've got this" — this language pattern is used in fitness apps, productivity apps, and life-coach Instagram accounts. It is not appropriate for people navigating parole requirements, housing instability, and family reunification.

**Reject:**
- "Start your journey"
- "Crush your goals"
- "Unlock your potential"
- "You've got this, champion"
- "Level up your life"

**Reach for:** Specific, grounded, human. "You have a check-in on Thursday at 9am. Here's what to bring." Usefulness over motivation.

---

### 16. Bold + italic mixed in headlines / tracked-out decorative caps

**Why it fails:** Mixing `font-bold italic` in a headline is a design cliche. Tiny `text-xs uppercase tracking-widest` used as a section label everywhere is a Tailwind UI tell.

**Reject:**
```tsx
<Text className="text-2xl font-bold italic text-navy">Your Progress</Text>
<Text className="text-xs uppercase tracking-widest text-muted mb-4">Overview</Text>
```

**Reach for:** Weight hierarchy without style mixing. One typeface, varied weight and size. If a label needs distinction, use color (`text-muted`) not tracking.

---

### 17. Border AND shadow on the same element

**Why it fails:** Applying both `border border-border-subtle` and `shadow-sm` to the same card is visual redundancy. It reads as indecision. Pick one elevation signal.

**Rule:** Border OR shadow. Never both.

**Reject:**
```tsx
<View className="border border-border-subtle shadow-sm rounded-xl bg-surface" />
```

**Accept:**
```tsx
<View className="border border-border-subtle rounded-xl bg-surface" />
// or
<View className="shadow-sm rounded-xl bg-surface" />
```

Prefer border. Reserve shadow for elements that need perceived physical lift (bottom sheets, floating actions).

---

### 18. Rainbow-saturated color icons

**Why it fails:** A row of icons where each one is a different fully-saturated hue (blue calendar, green check, red alert, yellow star, purple user) looks like a children's app or a 2019 iOS icon pack.

**Rule:** Icons use only: `#F0B27A` (peach), `#88B17A` (sage), `#1F2D3D` (navy), `#6FA8DC` (primary), or a muted gray. One icon, one color. Never full RGB spectrum across a single screen.

---

### 19. `<View className="h-20" />` spacers

**Why it fails:** Hardcoded spacer views are a spacing anti-pattern. They don't respond to dynamic content and they signal that spacing was an afterthought.

**Rule:** Use `paddingBottom`, `marginTop`, `gap`, or `space-y-*` on the parent. Spacer views are not permitted.

**Reject:**
```tsx
<View className="h-20" />
```

**Accept:**
```tsx
<View className="pb-20">
  {/* content */}
</View>
```

---

### 20. Visible Tailwind UI starter kit DNA

**Why it fails:** Tailwind UI components are recognizable: the specific border radiuses, the exact color steps, the button sizing, the card padding, the nav structure. When a screen looks like it was assembled from Tailwind UI's component library, it reads as zero design investment.

**Rule:** Before submitting, ask: "Could someone find this exact layout in a Tailwind UI, shadcn, or NativeWind starter kit?" If yes, rework it.

---

## Patterns to Reach For

These are the moves that make a screen feel crafted.

**Surface elevation via border, not shadow.** `border border-border-subtle bg-surface` reads as precise. `shadow-lg` reads as default.

**Typography doing the heavy lifting.** Let weight, size, and spacing carry hierarchy. Resist the urge to add a box around everything that needs to stand out.

**One bold visual move per screen.** A Skia flame at the top of the streak screen. A single large peach number. Not five competing visual elements.

**Off-grid asymmetry.** Slightly asymmetric layouts — a card that doesn't fill the full width, a number that hangs into the margin — feel hand-tuned. Perfect symmetry reads as template.

**Number-as-display type.** The streak count, the milestone day, "Week 3 of 8" — at 64–80px semibold weight, numbers carry emotional weight without being decorative. This is heroic.

**1px borders that catch light.** `border border-surfaceDeep` at 1px — never thicker. Heavier borders read as UI kit components.

**Microcopy written like a person.** "Hey — I noticed you haven't marked anything done in a few days. That's okay." This is hard to write and impossible to fake. Write it and rewrite it until it sounds human.

**Specific over abstract copy.** "Get your state ID at the DMV on 4th & Mission" beats "Take care of your documents." "Your PO appointment is Thursday" beats "Stay on top of your obligations."

**Generous negative space.** Padding that feels almost too much. Cramped screens scream budget constraint and rushed design.

**The flame motif, used with restraint.** The streak badge, the milestone splash screen, the achievement moment. Three touchpoints max across the whole app. Overuse kills the symbol.

---

## Voice Patterns That Expose AI

Do not use these words or phrases in any copy, label, placeholder, or microcopy:

| Banned phrase | Why |
|---|---|
| "Empower yourself" | Consulting deck language |
| "Take control of your future" | Life coach spam |
| "Your transformation starts here" | Fitness app cliche |
| "Designed with care" | Says nothing |
| "Crafted to perfection" | Says nothing |
| "Powered by AI" | Never claim this |
| "Smart [noun]" | Meaningless modifier |
| "Intelligent [noun]" | Meaningless modifier |
| "Cutting-edge" | 2012 called |
| "Seamless" | Every UX person's crutch word |
| "Intuitive" | Claims the user will find it easy — show, don't tell |
| "Robust" | Enterprise brochure |
| "Comprehensive" | Dashboard widget label |
| "Holistic" | Wellness app |
| "Game-changing" | Press release |
| "Next-level" | Gym poster |

**Instead:** Use specific verbs and concrete nouns. Not "smart document management" — "stores your ID, parole papers, and housing docs in one place."

---

## Code Patterns: Good vs. Bad

### Card component

**Bad — Tailwind UI clone:**
```tsx
<View className="bg-white rounded-xl shadow-lg shadow-black/10 p-4 mx-4 mb-3">
  <View className="flex-row items-center justify-between mb-2">
    <Text className="text-xs uppercase tracking-widest text-gray-400">Next Step</Text>
    <View className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
  </View>
  <Text className="text-lg font-bold text-gray-900">Get your ID</Text>
  <Text className="text-sm text-gray-500 mt-1">Visit the DMV to get started on your journey.</Text>
</View>
```

**Good — SecondChance native:**
```tsx
<View className="bg-surface rounded-2xl border border-border-subtle px-5 py-4 mx-4 mb-3">
  <Text className="text-xs text-muted mb-1">Next</Text>
  <Text className="text-base font-semibold text-navy leading-snug">
    State ID — DMV on 4th & Mission
  </Text>
  <Text className="text-sm text-muted mt-2">
    Bring your release papers and proof of address. Takes about 45 minutes.
  </Text>
</View>
```

### Primary button

**Bad — AI sheen template:**
```tsx
<Pressable className="bg-gradient-to-br from-primary via-white/20 to-primary rounded-full px-8 py-4 shadow-lg shadow-primary/30">
  <Text className="text-white font-bold tracking-wide">Start Your Journey</Text>
</Pressable>
```

**Good — SecondChance:**
```tsx
<AnimatedPressable style={animatedButtonStyle} className="rounded-2xl px-8 py-4">
  <Text className="text-white font-semibold text-base">Mark as done</Text>
</AnimatedPressable>
```

### Section header

**Bad — tracked-out caps decoration:**
```tsx
<Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
  YOUR PROGRESS OVERVIEW
</Text>
```

**Good — weight carries it:**
```tsx
<Text className="text-xl font-semibold text-navy mb-4">This week</Text>
```

### Milestone / streak display

**Bad — widget card:**
```tsx
<View className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 shadow-md flex-row items-center gap-3">
  <LottieView source={confettiLottie} autoPlay loop={false} className="w-12 h-12" />
  <View>
    <Text className="text-white text-xs uppercase tracking-widest">Streak</Text>
    <Text className="text-white text-2xl font-bold">12 Days 🔥</Text>
  </View>
</View>
```

**Good — number as hero, Skia flame:**
```tsx
<View className="items-start px-6 pt-8 pb-6">
  <SkiaFlame width={32} height={40} color="#F0B27A" />
  <Text className="text-7xl font-semibold text-navy leading-none mt-3">12</Text>
  <Text className="text-base text-muted mt-1">days in a row</Text>
</View>
```

---

## Self-Review Checklist

Run this before submitting any screen. A "yes" on any question means revise before submitting.

1. **Forbidden patterns present?** Does this screen contain any of the 20 patterns listed above? (Gradient blobs, shadow+border, glassmorph > 1 per screen, Lottie confetti, stock illustrations, status pills, etc.)

2. **Template DNA?** Could this layout appear verbatim in a Tailwind UI, NativeWind, or shadcn starter kit? If a non-designer could have assembled this by copying components from a library, rework it.

3. **Motivational copy?** Does any string contain "journey", "empower", "transform", "potential", "crush", "unlock", "seamless", "smart", or "next-level"? Replace with specific, functional language.

4. **Personification?** Does the copy claim the app "listens", "understands", "remembers what matters to you", or "is in your corner"? Cut it. Say what the feature actually does.

5. **X. Then Y. pattern?** Are there any two-clause punchy headline pairs? ("Stop waiting. Start building.") Flatten to a single direct statement.

6. **Spacer views?** Is there a `<View className="h-[n]" />` anywhere in the component? Remove it and use padding/gap on the parent.

7. **Rainbow icons?** Do any icons use fully saturated colors outside the palette (peach, sage, navy, primary)? Remap to palette.

8. **Sheen button?** Does any button use `via-white/20` or a diagonal gradient? Strip it. Flat color + Reanimated press state.

9. **Border + shadow combo?** Does any element have both a border and a box shadow? Pick one.

10. **Copy test: would a parole officer write this?** Read all microcopy out loud. If it sounds like a wellness influencer, a productivity SaaS, or a government brochure — rewrite it. Target register: a trusted friend who has been through the system and knows how it works.

---

*These standards are non-negotiable. When in doubt, do less. A screen with generous spacing, honest typography, and zero forbidden patterns will always ship. A screen with five clever UI moves and one gradient blob will not.*
