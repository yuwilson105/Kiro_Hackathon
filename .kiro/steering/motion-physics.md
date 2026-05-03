---
inclusion: always
---

# Motion Physics

Motion must feel inevitable and human. Nothing should bounce or showboat.

## Spring Selection

| Situation                             | Spring                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| Button/card press (scale 1→0.96)      | `spring.press` { damping: 15, stiffness: 320, mass: 0.6 }  |
| Pill/chip selection (scale 1→0.97→1)  | `spring.snap` { damping: 18, stiffness: 280, mass: 0.7 }   |
| Page transition / FAB position change | `spring.gentle` { damping: 22, stiffness: 180, mass: 1 }   |
| Layout transition (list reorder)      | `LinearTransition.springify().damping(22)`                 |
| Bottom sheet                          | Do NOT override — gorhom manages its own spring            |
| Milestone celebration only            | `spring.bouncy` { damping: 12, stiffness: 200, mass: 0.8 } |

`spring.bouncy` appears in exactly one place: the milestone celebration screen. Using it anywhere else dilutes that moment.

## Easing Selection

| Situation                              | Easing                                            |
| -------------------------------------- | ------------------------------------------------- |
| Page entrance                          | `ease.out` — already baked into `enter.*` helpers |
| Page exit                              | `ease.inOut`                                      |
| Skia loop (flame breath)               | `Easing.inOut(Easing.quad)` inline                |
| Skia one-shot (splash/milestone bloom) | `Easing.out(Easing.cubic)` inline                 |
| Color/opacity transition               | `ease.snap`                                       |
| True continuous loop only              | `Easing.linear`                                   |

Forbidden: `Easing.elastic(...)`, `Easing.bounce`, `Easing.linear` on anything except a true loop.

## Duration Selection

| Situation                                          | Token               | ms   |
| -------------------------------------------------- | ------------------- | ---- |
| Color flip / opacity flicker / pressed-state onset | `duration.micro`    | 160  |
| Button press return / small state change           | `duration.short`    | 240  |
| Card entrance / list item / tab change             | `duration.medium`   | 360  |
| Full page transition                               | `duration.long`     | 520  |
| Splash flame                                       | `duration.splash`   | 1400 |
| "Building your plan"                               | `duration.building` | 2400 |

No interactive element animates longer than `duration.long` (520ms).

## Stagger

- Default cadence: 60ms
- Home task cards: 80ms (more deliberate — these matter)
- Feed/resource cards: 40–50ms (tighter wave for long lists)
- Always cap: `Math.min(index, 8)` before passing to `stagger()`
- On filter/sort re-renders: do NOT re-apply stagger — use `LinearTransition` only

## Press Scale Targets

- Standard card/button: `0.96`
- Pill/chip: `0.97`
- FAB: `0.94`
- Never `0.95` (too much for a card) or `0.98` (imperceptible)

## Haptic Timing

- Fire `haptics.tap()` on `pressIn` — before the visual scale begins
- Completion haptic fires simultaneously with the success animation — same handler, same frame
- Never fire haptics on `pressOut`, entrance animations, or layout transitions

## Forbidden

- `spring.bouncy` anywhere except milestone celebration
- Durations > 700ms on interactive UI elements
- Two animations competing on one property of one element
- More than 2 looping animations simultaneously visible
- Re-staggering on filter/sort re-renders
- Overriding gorhom bottom sheet's spring
- Haptic on `pressOut`
