import { Canvas, Group, Path, RadialGradient, Skia, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_OUTER_COLORS = ['#FFFAEB', '#FFE08A', '#FFAA48', '#FF6B2C', '#D44A1F'] as const;
const OUTER_POSITIONS = [0, 0.2, 0.5, 0.8, 1];

const DEFAULT_INNER_COLORS = ['#FFFEF0', '#FFE08A'] as const;
const INNER_POSITIONS = [0, 1];

const DEFAULT_GLOW_HUE = '#FFA64A';

const flamePath = Skia.Path.MakeFromSVGString(
  'M52 4 C58 18, 76 30, 76 58 C76 80, 64 96, 50 96 C36 96, 24 80, 24 58 C24 30, 38 14, 52 4 Z'
)!;

const innerPath = Skia.Path.MakeFromSVGString(
  'M52 36 C55 46, 64 52, 64 66 C64 78, 58 86, 50 86 C42 86, 36 78, 36 66 C36 54, 44 50, 52 36 Z'
)!;

const haloPath = Skia.Path.MakeFromSVGString('M0 0 L100 0 L100 100 L0 100 Z')!;

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type Props = {
  size?: number;
  loop?: boolean;
  outerColors?: readonly string[];
  innerColors?: readonly string[];
  haloHue?: string;
};

export function FlameLogo({
  size = 100,
  loop = true,
  outerColors = DEFAULT_OUTER_COLORS,
  innerColors = DEFAULT_INNER_COLORS,
  haloHue = DEFAULT_GLOW_HUE,
}: Props) {
  const haloColors = useMemo(
    () => [hexToRgba(haloHue, 0.5), hexToRgba(haloHue, 0.22), hexToRgba(haloHue, 0)],
    [haloHue],
  );
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

  const scale = size / 100;

  const transform = useDerivedValue(() => [
    { translateY: 50 },
    { scaleY: breath.value },
    { scaleX: 2 - breath.value },
    { rotateZ: sway.value },
    { translateY: -50 },
  ]);

  const haloOpacity = useDerivedValue(() => haloPulse.value);

  return (
    <Canvas style={{ width: size, height: size * 1.05 }}>
      <Group transform={[{ scale }]}>
        <Group opacity={haloOpacity}>
          <Path path={haloPath} style="fill">
            <RadialGradient
              c={vec(50, 50)}
              r={50}
              colors={haloColors}
              positions={[0, 0.45, 1]}
            />
          </Path>
        </Group>
        <Group transform={transform} origin={vec(50, 60)}>
          <Path path={flamePath} style="fill">
            <RadialGradient
              c={vec(50, 50)}
              r={56}
              colors={outerColors as string[]}
              positions={OUTER_POSITIONS}
            />
          </Path>
          <Path path={innerPath} style="fill" opacity={0.65}>
            <RadialGradient
              c={vec(50, 58)}
              r={34}
              colors={innerColors as string[]}
              positions={INNER_POSITIONS}
            />
          </Path>
        </Group>
      </Group>
    </Canvas>
  );
}
