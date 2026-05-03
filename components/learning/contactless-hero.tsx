// Loop structure (~3.6s/cycle, infinite):
//  1. Phone hovers via continuous sinusoidal Y drift (withRepeat reverse).
//  2. Three contactless arcs cascade phone -> terminal at +0/+220/+440ms,
//     each fading in/out across a 1.6s span (bell-curve opacity).
//  3. Terminal acknowledgement: scale pulse + accent ring fires at 1500ms
//     to land just after the leading arc reaches the terminal.
// Reduced motion: every shared value parks at a static mid-state.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme';

type Props = { height?: number };

const CYCLE = 3600;

function arcPath(cx: number, cy: number, r: number, sweepDeg = 70) {
  const p = Skia.Path.Make();
  p.addArc(
    { x: cx - r, y: cy - r, width: r * 2, height: r * 2 },
    -sweepDeg,
    sweepDeg * 2,
  );
  return p;
}

function useArcOpacity(v: { value: number }) {
  return useDerivedValue(() => Math.max(0, Math.sin(v.value * Math.PI)) * 0.85);
}

function useArcScale(v: { value: number }) {
  return useDerivedValue(() => 0.7 + v.value * 0.5);
}

export default function ContactlessHero({ height = 260 }: Props) {
  const reduced = useReducedMotion();

  const W = 320;
  const H = height;
  const phoneCx = W * 0.34;
  const phoneCy = H * 0.5;
  const termCx = W * 0.72;
  const termCy = H * 0.56;
  const waveOriginX = phoneCx + 46;
  const waveOriginY = phoneCy;

  const hover = useSharedValue(0);
  const a1 = useSharedValue(0);
  const a2 = useSharedValue(0);
  const a3 = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      hover.value = 0.5;
      a1.value = 0.5;
      a2.value = 0.5;
      a3.value = 0.5;
      pulse.value = 0.4;
      return;
    }
    const ease = Easing.inOut(Easing.cubic);
    hover.value = withRepeat(
      withTiming(1, { duration: CYCLE / 2, easing: ease }),
      -1,
      true,
    );
    const arcSeq = (delay: number) =>
      withRepeat(
        withDelay(
          delay,
          withSequence(
            withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 0 }),
            withTiming(0, { duration: CYCLE - 1600 - delay }),
          ),
        ),
        -1,
        false,
      );
    a1.value = arcSeq(0);
    a2.value = arcSeq(220);
    a3.value = arcSeq(440);
    pulse.value = withRepeat(
      withDelay(
        1500,
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: CYCLE - 1500 - 420 - 900 }),
        ),
      ),
      -1,
      false,
    );
  }, [reduced, hover, a1, a2, a3, pulse]);

  const phoneTransform = useDerivedValue(() => [
    { translateY: -4 + hover.value * 8 },
  ]);

  const o1 = useArcOpacity(a1);
  const o2 = useArcOpacity(a2);
  const o3 = useArcOpacity(a3);
  const s1 = useArcScale(a1);
  const s2 = useArcScale(a2);
  const s3 = useArcScale(a3);

  const pulseScale = useDerivedValue(() => 1 + pulse.value * 0.06);
  const pulseRingR = useDerivedValue(() => 26 + pulse.value * 22);
  const pulseRingOpacity = useDerivedValue(() => (1 - pulse.value) * 0.35);

  const path1 = arcPath(waveOriginX, waveOriginY, 18);
  const path2 = arcPath(waveOriginX, waveOriginY, 30);
  const path3 = arcPath(waveOriginX, waveOriginY, 42);

  const t1 = useDerivedValue(() => [
    { translateX: waveOriginX },
    { translateY: waveOriginY },
    { scale: s1.value },
    { translateX: -waveOriginX },
    { translateY: -waveOriginY },
  ]);
  const t2 = useDerivedValue(() => [
    { translateX: waveOriginX },
    { translateY: waveOriginY },
    { scale: s2.value },
    { translateX: -waveOriginX },
    { translateY: -waveOriginY },
  ]);
  const t3 = useDerivedValue(() => [
    { translateX: waveOriginX },
    { translateY: waveOriginY },
    { scale: s3.value },
    { translateX: -waveOriginX },
    { translateY: -waveOriginY },
  ]);

  const termTransform = useDerivedValue(() => [
    { translateX: termCx },
    { translateY: termCy },
    { scale: pulseScale.value },
    { translateX: -termCx },
    { translateY: -termCy },
  ]);

  return (
    <View style={[styles.wrap, { height: H }]} pointerEvents="none">
      <Canvas style={{ width: '100%', height: H }}>
        <Group opacity={0.55}>
          <Circle cx={W * 0.2} cy={H * 0.25} r={70} color={colors.surfaceDeep}>
            <BlurMask blur={28} style="normal" />
          </Circle>
          <Circle cx={W * 0.85} cy={H * 0.78} r={60} color={colors.surfaceDeep}>
            <BlurMask blur={24} style="normal" />
          </Circle>
        </Group>

        <Group opacity={0.18}>
          <RoundedRect
            x={termCx - 38}
            y={termCy + 46}
            width={76}
            height={10}
            r={5}
            color={colors.primaryDeep}
          >
            <BlurMask blur={6} style="normal" />
          </RoundedRect>
        </Group>

        <Group opacity={0.16} transform={phoneTransform}>
          <RoundedRect
            x={phoneCx - 26}
            y={phoneCy + 64}
            width={52}
            height={8}
            r={4}
            color={colors.primaryDeep}
          >
            <BlurMask blur={5} style="normal" />
          </RoundedRect>
        </Group>

        <Group transform={phoneTransform}>
          <RoundedRect
            x={phoneCx - 28}
            y={phoneCy - 56}
            width={56}
            height={108}
            r={14}
            color={colors.primaryDeep}
          />
          <RoundedRect
            x={phoneCx - 24}
            y={phoneCy - 52}
            width={48}
            height={100}
            r={11}
            color={colors.surface}
          />
          <RoundedRect
            x={phoneCx - 18}
            y={phoneCy - 30}
            width={36}
            height={22}
            r={4}
            color={colors.primarySoft}
          />
          <RoundedRect
            x={phoneCx - 14}
            y={phoneCy - 24}
            width={14}
            height={3}
            r={1.5}
            color={colors.primaryDeep}
          />
          <RoundedRect
            x={phoneCx - 14}
            y={phoneCy - 17}
            width={22}
            height={2}
            r={1}
            color={colors.primary}
          />
          <RoundedRect
            x={phoneCx - 6}
            y={phoneCy - 49}
            width={12}
            height={2}
            r={1}
            color={colors.border}
          />
        </Group>

        <Group transform={t1}>
          <Path
            path={path1}
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            color={colors.primary}
            opacity={o1}
          />
        </Group>
        <Group transform={t2}>
          <Path
            path={path2}
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            color={colors.primary}
            opacity={o2}
          />
        </Group>
        <Group transform={t3}>
          <Path
            path={path3}
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            color={colors.primary}
            opacity={o3}
          />
        </Group>

        <Circle
          cx={termCx}
          cy={termCy}
          r={pulseRingR}
          color={colors.accent}
          opacity={pulseRingOpacity}
          style="stroke"
          strokeWidth={2}
        />

        <Group transform={termTransform}>
          <RoundedRect
            x={termCx - 32}
            y={termCy - 30}
            width={64}
            height={72}
            r={10}
            color={colors.primaryDeep}
          />
          <RoundedRect
            x={termCx - 28}
            y={termCy - 26}
            width={56}
            height={30}
            r={6}
            color={colors.surface}
          />
          <RoundedRect
            x={termCx - 22}
            y={termCy - 20}
            width={28}
            height={2.5}
            r={1}
            color={colors.primary}
          />
          <RoundedRect
            x={termCx - 22}
            y={termCy - 14}
            width={18}
            height={2.5}
            r={1}
            color={colors.primarySoft}
          />
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => (
              <Circle
                key={`${col}-${row}`}
                cx={termCx - 16 + col * 16}
                cy={termCy + 16 + row * 12}
                r={3}
                color={colors.primarySoft}
              />
            )),
          )}
          <RoundedRect
            x={termCx - 26}
            y={termCy + 38}
            width={52}
            height={3}
            r={1.5}
            color={colors.accent}
          />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
