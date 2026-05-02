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

const OUTER_STOPS = [
  { offset: '0', color: '#FFF4D6' },
  { offset: '0.18', color: '#FFD86B' },
  { offset: '0.45', color: '#FF8A1F' },
  { offset: '0.75', color: '#E5421A' },
  { offset: '1', color: '#8C1A0A' },
];

const INNER_STOPS = [
  { offset: '0', color: '#FFFDE8' },
  { offset: '1', color: '#FFD86B' },
];

const GLOW_HUE = '#FF8A1F';

const OUTER_PATH =
  'M52 4 C58 18, 76 30, 76 58 C76 80, 64 96, 50 96 C36 96, 24 80, 24 58 C24 30, 38 14, 52 4 Z';
const INNER_PATH =
  'M52 36 C55 46, 64 52, 64 66 C64 78, 58 86, 50 86 C42 86, 36 78, 36 66 C36 54, 44 50, 52 36 Z';

let idCounter = 0;

type Props = {
  size?: number;
  loop?: boolean;
};

export function FlameLogo({ size = 100, loop = true }: Props) {
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
              <Stop offset="0" stopColor={GLOW_HUE} stopOpacity="0.85" />
              <Stop offset="0.45" stopColor={GLOW_HUE} stopOpacity="0.4" />
              <Stop offset="1" stopColor={GLOW_HUE} stopOpacity="0" />
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
              {OUTER_STOPS.map((s, i) => (
                <Stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </SvgRadialGradient>
            <SvgRadialGradient
              id={ids.inner}
              cx="50"
              cy="74"
              r="32"
              gradientUnits="userSpaceOnUse"
            >
              {INNER_STOPS.map((s, i) => (
                <Stop key={i} offset={s.offset} stopColor={s.color} />
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
