import { Easing, FadeIn, FadeInDown, FadeInUp, SlideInDown, SlideInUp, ZoomIn } from 'react-native-reanimated';

export const ease = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  gentle: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  snap: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const duration = {
  micro: 160,
  short: 240,
  medium: 360,
  long: 520,
  splash: 1400,
  building: 2400,
} as const;

export const spring = {
  snap: { damping: 18, stiffness: 280, mass: 0.7 },
  gentle: { damping: 22, stiffness: 180, mass: 1 },
  press: { damping: 15, stiffness: 320, mass: 0.6 },
  bouncy: { damping: 12, stiffness: 200, mass: 0.8 },
} as const;

export const enter = {
  fadeUp: (delay = 0) => FadeInDown.delay(delay).duration(duration.medium).easing(ease.out),
  fadeDown: (delay = 0) => FadeInUp.delay(delay).duration(duration.medium).easing(ease.out),
  fade: (delay = 0) => FadeIn.delay(delay).duration(duration.short).easing(ease.out),
  zoom: (delay = 0) => ZoomIn.delay(delay).duration(duration.medium).easing(ease.out),
  sheetUp: (delay = 0) => SlideInDown.delay(delay).duration(duration.long).easing(ease.out),
  sheetDown: (delay = 0) => SlideInUp.delay(delay).duration(duration.long).easing(ease.out),
} as const;

export const stagger = (index: number, base = 60) => index * base;
