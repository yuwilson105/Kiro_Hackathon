import { Canvas, Group, Path, RadialGradient, Skia, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme';

const flamePath = Skia.Path.MakeFromSVGString(
  'M50 6 C56 22, 78 30, 78 56 C78 80, 62 96, 50 96 C38 96, 22 80, 22 56 C22 36, 36 28, 38 16 C44 24, 46 20, 50 6 Z'
)!;

const innerPath = Skia.Path.MakeFromSVGString(
  'M50 38 C53 48, 66 52, 66 68 C66 80, 58 88, 50 88 C42 88, 34 80, 34 68 C34 56, 44 54, 46 46 C48 50, 49 48, 50 38 Z'
)!;

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

  const transform = useDerivedValue(() => [
    { translateY: 50 },
    { scaleY: breath.value },
    { scaleX: 2 - breath.value },
    { rotateZ: sway.value },
    { translateY: -50 },
  ]);

  return (
    <Canvas style={{ width: size, height: size * 1.05 }}>
      <Group transform={transform} origin={vec(50, 60)}>
        <Path path={flamePath} style="fill">
          <RadialGradient
            c={vec(50, 70)}
            r={56}
            colors={[colors.accent, colors.accentDeep, colors.danger]}
            positions={[0, 0.62, 1]}
          />
        </Path>
        <Path path={innerPath} style="fill" opacity={0.85}>
          <RadialGradient
            c={vec(50, 76)}
            r={32}
            colors={['#FFE6C4', colors.accent]}
            positions={[0, 1]}
          />
        </Path>
      </Group>
    </Canvas>
  );
}
