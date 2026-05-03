import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlameLogo } from '@/components/animations/flame-logo';
import { ease } from '@/lib/motion';
import { useStore } from '@/lib/store';

// Total budget ~1500ms. Daily-launch splash — feels considered, never makes
// the user wait. Flame timeline: ignite → flicker → death-rattle → collapse.
// Wordmark fades out ~120ms before the flame to give the flame the final frame.
const TOTAL_MS = 1500;

export default function Splash() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  const flameScale = useSharedValue(0.7);
  const flameOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(8);

  const finish = () => setDone(true);

  useEffect(() => {
    if (reduced) {
      flameOpacity.value = withSequence(
        withTiming(1, { duration: 320 }),
        withDelay(700, withTiming(0, { duration: 220 })),
      );
      flameScale.value = withTiming(1, { duration: 320 });
      textOpacity.value = withDelay(
        260,
        withSequence(
          withTiming(1, { duration: 360 }),
          withDelay(
            560,
            withTiming(0, { duration: 280 }, (f) => {
              if (f) runOnJS(finish)();
            }),
          ),
        ),
      );
      textTranslate.value = withDelay(260, withTiming(0, { duration: 360 }));
      return;
    }

    // SCALE — ignite, irregular flicker, death-rattle, collapse.
    // Durations are mutually prime (no shared factor) so the rhythm doesn't
    // metronome. Flicker amplitudes ±5–9% match real candle physics.
    flameScale.value = withSequence(
      // Ignite (320ms): overshoot then settle
      withTiming(1.1, { duration: 220, easing: ease.snap }),
      withTiming(1.0, { duration: 100, easing: ease.gentle }),
      // Flicker (660ms): irregular durations, no common factor
      withTiming(1.06, { duration: 83, easing: ease.gentle }),
      withTiming(0.95, { duration: 147, easing: ease.gentle }),
      withTiming(1.04, { duration: 61, easing: ease.gentle }),
      withTiming(1.08, { duration: 119, easing: ease.gentle }),
      withTiming(0.96, { duration: 173, easing: ease.gentle }),
      withTiming(1.01, { duration: 77, easing: ease.gentle }),
      // Death-rattle (140ms): brief flare-up — the cinematic "blown-out" cue
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(1.22, { duration: 40, easing: Easing.linear }),
      // Collapse (250ms): sharp accelerating shrink
      withTiming(0.85, { duration: 80, easing: Easing.in(Easing.cubic) }),
      withTiming(0.2, { duration: 100, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 70, easing: Easing.linear }),
    );

    // OPACITY — independent rhythm. Light dim during burn (decoupled cadence),
    // hold full alpha during the death-rattle so the flare-up reads, then
    // collapse alongside scale.
    flameOpacity.value = withSequence(
      // Fade in (220ms)
      withTiming(1.0, { duration: 220, easing: ease.out }),
      // Burn flicker (560ms) — different cadence from scale
      withTiming(0.92, { duration: 113 }),
      withTiming(1.0, { duration: 67 }),
      withTiming(0.88, { duration: 191 }),
      withTiming(0.97, { duration: 103 }),
      withTiming(1.0, { duration: 86 }),
      // Hold during death-rattle (140ms) — flare-up should be at full alpha
      withTiming(1.0, { duration: 140 }),
      // Collapse with scale (250ms)
      withTiming(0.55, { duration: 80, easing: Easing.in(Easing.cubic) }),
      withTiming(0.18, { duration: 100, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 70, easing: Easing.linear }),
    );

    // WORDMARK — fades in after ignite, leads flame OUT by ~120ms so the
    // flame owns the final frame. finish() fires from text's last callback.
    textTranslate.value = withDelay(260, withTiming(0, { duration: 360, easing: ease.out }));
    textOpacity.value = withDelay(
      260,
      withSequence(
        withTiming(1, { duration: 360, easing: ease.out }),
        withDelay(
          540, // hold
          withTiming(0, { duration: 240, easing: ease.inOut }, (f) => {
            if (f) runOnJS(finish)();
          }),
        ),
      ),
    );
  }, [reduced]);

  // Failsafe: if a worklet callback misses, redirect anyway.
  useEffect(() => {
    const t = setTimeout(() => setDone(true), TOTAL_MS + 250);
    return () => clearTimeout(t);
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ scale: flameScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  if (done) {
    return <Redirect href={hasOnboarded ? '/(tabs)' : '/(onboarding)/name'} />;
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-surface"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="items-center justify-center" style={{ width: 220, height: 220 }}>
        <Animated.View style={flameStyle}>
          <FlameLogo size={120} loop={false} />
        </Animated.View>
      </View>

      <Animated.View className="mt-8 items-center" style={textStyle}>
        <Text className="font-semibold text-text text-4xl tracking-tight">Second Chance</Text>
        <Text className="font-sans text-text-muted text-base mt-3 px-12 text-center leading-6">
          For the days after.
        </Text>
      </Animated.View>
    </View>
  );
}
