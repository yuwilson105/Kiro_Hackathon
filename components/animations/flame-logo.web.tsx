import { useEffect } from 'react';
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

import { colors } from '@/lib/theme';

type Props = {
  size?: number;
  loop?: boolean;
};

export function FlameLogo({ size = 100, loop = true }: Props) {
  const breath = useSharedValue(1);
  const sway = useSharedValue(0);
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
    } else {
      breath.value = withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [breath, sway, loop, reduced]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: breath.value },
      { scaleX: 2 - breath.value },
      { rotateZ: `${sway.value}rad` },
    ],
  }));

  return (
    <View style={{ width: size, height: size * 1.05, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ width: size, height: size }, animStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <SvgRadialGradient id="flameOuter" cx="50" cy="70" r="56" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={colors.accent} />
              <Stop offset="0.62" stopColor={colors.accentDeep} />
              <Stop offset="1" stopColor={colors.danger} />
            </SvgRadialGradient>
            <SvgRadialGradient id="flameInner" cx="50" cy="76" r="32" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFE6C4" />
              <Stop offset="1" stopColor={colors.accent} />
            </SvgRadialGradient>
          </Defs>
          <Path
            d="M50 6 C56 22, 78 30, 78 56 C78 80, 62 96, 50 96 C38 96, 22 80, 22 56 C22 36, 36 28, 38 16 C44 24, 46 20, 50 6 Z"
            fill="url(#flameOuter)"
          />
          <Path
            d="M50 38 C53 48, 66 52, 66 68 C66 80, 58 88, 50 88 C42 88, 34 80, 34 68 C34 56, 44 54, 46 46 C48 50, 49 48, 50 38 Z"
            fill="url(#flameInner)"
            opacity={0.85}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
