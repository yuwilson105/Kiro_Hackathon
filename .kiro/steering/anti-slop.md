---
inclusion: always
---

# Anti-Slop Standards

SecondChance serves people rebuilding their lives after incarceration. The UI must feel made by a human who gives a damn — not assembled from a Tailwind starter kit. Generic AI-generated UIs read as disrespect to this audience.

## 20 Forbidden Patterns

1. **Generic gradient hero blobs** — `bg-gradient-to-br from-primary/30 via-transparent to-accent/20 rounded-full blur-3xl`. Use one deliberate Skia element instead.
2. **2×2 card grids** — equal-size dashboard widgets. Use asymmetric hierarchy instead.
3. **Setup copy that sounds like a product tour** — "Welcome to SecondChance", "Your journey begins here", "Get started in seconds". Lead with specific, useful information.
4. **`shadow-lg` on `rounded-xl` cards** — the universal Tailwind UI tell. Use `border border-border-subtle` instead.
5. **`via-white/20` diagonal sheen on buttons** — flat primary color + Reanimated press state instead.
6. **"All systems operational" status pills** — pulsing green dot + status text. Use contextual text only.
7. **"RECOMMENDED" pill with green dot** — pricing page component. Use position and weight instead.
8. **Glassmorphism on more than one element per screen** — `bg-white/10 backdrop-blur-md`. One max, for floating/overlay elements only.
9. **Lottie confetti from the marketplace** — instantly recognizable stock. Use Skia particles with palette colors only.
10. **Storyset / unDraw illustrations** — zero stock illustrations. Geometric Skia shapes or nothing.
11. **Centered hero + subtitle + CTA stacked vertically** — the default mobile onboarding template. Lead with a specific action or piece of information.
12. **Em-dash to introduce examples** — "Real tools — like checklists…". Use a colon instead.
13. **Two-clause "X. Then Y." motivational headlines** — "Stop waiting. Start building." Flatten to one direct statement.
14. **Personification of the app** — "SecondChance remembers what matters to you", "We're in your corner". Say what the feature actually does.
15. **Gym-poster motivation copy** — "Start your journey", "Crush your goals", "Unlock your potential". Use specific, grounded language.
16. **Bold + italic mixed in headlines / tracked-out decorative caps** — `font-bold italic` headlines, `text-xs uppercase tracking-widest` section labels everywhere.
17. **Border AND shadow on the same element** — pick one elevation signal.
18. **Rainbow-saturated color icons** — each icon a different fully-saturated hue. Use only: peach `#F0B27A`, sage `#88B17A`, navy `#1F2D3D`, primary `#6FA8DC`, or muted gray.
19. **`<View className="h-[n]" />` spacers** — use `paddingBottom`, `marginTop`, `gap`, or `space-y-*` on the parent.
20. **Visible Tailwind UI / shadcn starter kit DNA** — before submitting, ask: "Could someone find this exact layout in a Tailwind UI or NativeWind starter kit?" If yes, rework it.

## Banned Copy Words

"Empower" / "seamless" / "intuitive" / "robust" / "comprehensive" / "holistic" / "game-changing" / "next-level" / "cutting-edge" / "smart [noun]" / "intelligent [noun]" / "journey" / "transformation" / "unlock your potential" / "crush your goals" / "powered by AI"

## Patterns to Reach For

- Surface elevation via border, not shadow
- Typography doing the heavy lifting — weight, size, spacing carry hierarchy
- One bold visual move per screen
- Off-grid asymmetry — slightly asymmetric layouts feel hand-tuned
- Number-as-display type — streak count, milestone day at 64–80px semibold
- 1px borders that catch light — `border border-surfaceDeep`, never thicker
- Generous negative space
- The flame motif used with restraint — three touchpoints max across the whole app

## Self-Review Checklist

Before submitting any screen:

- [ ] None of the 20 forbidden patterns present
- [ ] Could NOT be found verbatim in a Tailwind UI / NativeWind starter kit
- [ ] No banned copy words
- [ ] No motivational copy — specific and functional instead
- [ ] No personification of the app
- [ ] No "X. Then Y." headline pairs
- [ ] No `<View className="h-[n]" />` spacers
- [ ] No rainbow icons — palette colors only
- [ ] No sheen button (`via-white/20`)
- [ ] No border + shadow combo on same element
- [ ] Copy test: would a trusted friend who's been through the system say this?
