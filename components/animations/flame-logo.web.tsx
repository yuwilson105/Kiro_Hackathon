import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

export type FlameTier = 'spark' | 'ember' | 'candle' | 'magma' | 'plasma';

type GradientStop = { offset: number; color: string };

type Palette = {
  outer: GradientStop[];
  inner: GradientStop[];
  glow: string;
};

const PALETTES: Record<FlameTier, Palette> = {
  spark: {
    outer: [
      { offset: 0, color: '#FFD89A' },
      { offset: 0.2, color: '#F2A24C' },
      { offset: 0.55, color: '#C25A2A' },
      { offset: 0.85, color: '#6E2410' },
      { offset: 1, color: '#2A0E05' },
    ],
    inner: [
      { offset: 0, color: '#FFE9B8' },
      { offset: 1, color: '#F2A24C' },
    ],
    glow: '#C25A2A',
  },
  ember: {
    outer: [
      { offset: 0, color: '#FFC97A' },
      { offset: 0.12, color: '#FF8A3D' },
      { offset: 0.55, color: '#F0461A' },
      { offset: 0.85, color: '#A11506' },
      { offset: 1, color: '#4D0A03' },
    ],
    inner: [
      { offset: 0, color: '#FFE8A8' },
      { offset: 1, color: '#FF8A3D' },
    ],
    glow: '#F0461A',
  },
  candle: {
    outer: [
      { offset: 0, color: '#FFF4D6' },
      { offset: 0.18, color: '#FFD86B' },
      { offset: 0.45, color: '#FF8A1F' },
      { offset: 0.75, color: '#E5421A' },
      { offset: 1, color: '#8C1A0A' },
    ],
    inner: [
      { offset: 0, color: '#FFFDE8' },
      { offset: 1, color: '#FFD86B' },
    ],
    glow: '#FF8A1F',
  },
  magma: {
    outer: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.08, color: '#FFE39A' },
      { offset: 0.28, color: '#FF9A2C' },
      { offset: 0.6, color: '#D8341A' },
      { offset: 0.88, color: '#6E1208' },
      { offset: 1, color: '#2A0604' },
    ],
    inner: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 1, color: '#FFD86B' },
    ],
    glow: '#FF9A2C',
  },
  plasma: {
    outer: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.1, color: '#D6E9FF' },
      { offset: 0.3, color: '#7AB8FF' },
      { offset: 0.6, color: '#3D6AFF' },
      { offset: 0.85, color: '#2A1A8C' },
      { offset: 1, color: '#0A0428' },
    ],
    inner: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 1, color: '#7AB8FF' },
    ],
    glow: '#3D6AFF',
  },
};

export function tierFromStreak(streak: number): FlameTier {
  if (streak >= 100) return 'plasma';
  if (streak >= 30) return 'magma';
  if (streak >= 7) return 'candle';
  if (streak >= 3) return 'ember';
  return 'spark';
}

// Asymmetric tip (52,4 not 50,6), narrower waist, smooth left side without the lower-left notch
const OUTER_PATH =
  'M52 4 C58 18, 76 30, 76 58 C76 80, 64 96, 50 96 C36 96, 24 80, 24 58 C24 30, 38 14, 52 4 Z';
const INNER_PATH =
  'M52 36 C55 46, 64 52, 64 66 C64 78, 58 86, 50 86 C42 86, 36 78, 36 66 C36 54, 44 50, 52 36 Z';

let idCounter = 0;

type Props = {
  size?: number;
  loop?: boolean;
  tier?: FlameTier;
  streak?: number;
};

export function FlameLogo({ size = 100, loop = true, tier, streak }: Props) {
  const resolvedTier: FlameTier =
    tier ?? (streak !== undefined ? tierFromStreak(streak) : 'ember');
  const palette = PALETTES[resolvedTier];

  const breath = useSharedValue(1);
  const sway = useSharedValue(0);
  const haloPulse = useSharedValue(0.22);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (loop) {
      breath.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      sway.value = withRepeat(
        withSequence(
          withTiming(0.04, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
          withTiming(-0.04, { duration: 1300, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      haloPulse.value = withRepeat(
        withSequence(
          withTiming(0.34, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.16, { duration: 1100, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      breath.value = withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      );
      haloPulse.value = withSequence(
        withTiming(0.4, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(0.22, { duration: 600, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [breath, sway, haloPulse, loop, reduced]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: breath.value },
      { scaleX: 2 - breath.value },
      { rotateZ: `${sway.value}rad` },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({ opacity: haloPulse.value }));

  // Stable per-instance IDs so multiple FlameLogos on a screen don't collide on gradient defs
  const ids = useMemo(() => {
    const n = ++idCounter;
    return {
      outer: `flameOuter-${n}`,
      inner: `flameInner-${n}`,
      halo: `flameHalo-${n}`,
    };
  }, []);

  return (
    <View
      style={{
        width: size,
        height: size * 1.05,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size * 1.05,
            alignItems: 'center',
            justifyContent: 'center',
          },
          haloStyle,
        ]}
      >
        <Svg width={size} height={size * 1.05} viewBox="0 0 100 105">
          <Defs>
            <SvgRadialGradient
              id={ids.halo}
              cx="50"
              cy="56"
              r="50"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={palette.glow} stopOpacity="0.85" />
              <Stop offset="0.45" stopColor={palette.glow} stopOpacity="0.4" />
              <Stop offset="1" stopColor={palette.glow} stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Path d="M0 0 H100 V105 H0 Z" fill={`url(#${ids.halo})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ width: size, height: size }, flameStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <SvgRadialGradient
              id={ids.outer}
              cx="50"
              cy="72"
              r="58"
              gradientUnits="userSpaceOnUse"
            >
              {palette.outer.map((s, i) => (
                <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
              ))}
            </SvgRadialGradient>
            <SvgRadialGradient
              id={ids.inner}
              cx="50"
              cy="74"
              r="32"
              gradientUnits="userSpaceOnUse"
            >
              {palette.inner.map((s, i) => (
                <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
              ))}
            </SvgRadialGradient>
          </Defs>
          <Path d={OUTER_PATH} fill={`url(#${ids.outer})`} />
          <Path d={INNER_PATH} fill={`url(#${ids.inner})`} opacity={0.78} />
        </Svg>
      </Animated.View>
    </View>
  );
}
