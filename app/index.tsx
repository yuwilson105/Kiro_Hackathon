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

const TOTAL_MS = 2900;
const HALO_SIZE = 180;
const HALO_OUTER = 'rgba(216, 137, 71, 0.35)';
const HALO_INNER = 'rgba(248, 213, 179, 0.55)';

export default function Splash() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  const flameScale = useSharedValue(0.7);
  const flameOpacity = useSharedValue(0);

  const haloScale = useSharedValue(0.85);
  const haloOpacity = useSharedValue(0);
  const innerGlowOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(8);

  const finish = () => setDone(true);

  useEffect(() => {
    if (reduced) {
      flameScale.value = withTiming(1, { duration: 600, easing: Easing.linear });
      flameOpacity.value = withSequence(
        withTiming(1, { duration: 600, easing: Easing.linear }),
        withDelay(800, withTiming(0, { duration: 400, easing: Easing.linear })),
      );
      haloOpacity.value = withSequence(
        withTiming(0.6, { duration: 600, easing: Easing.linear }),
        withDelay(800, withTiming(0, { duration: 400, easing: Easing.linear })),
      );
      textOpacity.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.linear }),
          withDelay(
            700,
            withTiming(0, { duration: 500, easing: Easing.linear }, (f) => {
              if (f) runOnJS(finish)();
            }),
          ),
        ),
      );
      textTranslate.value = withDelay(300, withTiming(0, { duration: 500 }));
      return;
    }

    // IGNITE -> BURN PEAK -> DIE DOWN -> FADE
    // Total flame timeline: 0 -> 2600ms (flame fades 2200-2600)
    // Total text timeline:  320 -> 2900ms (text fades 2300-2900, +300ms tail beyond flame)

    flameScale.value = withSequence(
      // Ignite: overshoot to 1.10, settle to 1.00
      withTiming(1.1, { duration: 260, easing: ease.snap }),
      withTiming(1.0, { duration: 140, easing: ease.gentle }),
      // Flicker (irregular durations + amplitudes, no shared common factor)
      withTiming(1.03, { duration: 90, easing: ease.gentle }),
      withTiming(0.985, { duration: 130, easing: ease.gentle }),
      withTiming(1.045, { duration: 70, easing: ease.gentle }),
      withTiming(0.995, { duration: 160, easing: ease.gentle }),
      withTiming(1.025, { duration: 110, easing: ease.gentle }),
      withTiming(0.97, { duration: 80, easing: ease.gentle }),
      withTiming(1.035, { duration: 140, easing: ease.gentle }),
      withTiming(1.005, { duration: 100, easing: ease.gentle }),
      withTiming(1.02, { duration: 90, easing: ease.gentle }),
      // Die down
      withTiming(0.92, { duration: 500, easing: ease.inOut }),
      // Ember + fade (shrink slightly while fading)
      withTiming(0.86, { duration: 400, easing: ease.inOut }),
    );

    flameOpacity.value = withSequence(
      withTiming(1, { duration: 240, easing: ease.out }),
      withDelay(1960, withTiming(0, { duration: 400, easing: ease.inOut })),
    );

    haloOpacity.value = withSequence(
      withTiming(0.95, { duration: 220, easing: ease.out }),
      // Burn peak: non-harmonic pulse
      withTiming(0.7, { duration: 170, easing: ease.gentle }),
      withTiming(0.92, { duration: 210, easing: ease.gentle }),
      withTiming(0.78, { duration: 130, easing: ease.gentle }),
      withTiming(0.88, { duration: 190, easing: ease.gentle }),
      // Die down (faster than flame)
      withDelay(180, withTiming(0.32, { duration: 380, easing: ease.inOut })),
      // Fade
      withTiming(0, { duration: 400, easing: ease.inOut }),
    );

    haloScale.value = withSequence(
      withTiming(1.05, { duration: 220, easing: ease.out }),
      withTiming(0.98, { duration: 280, easing: ease.gentle }),
      withTiming(1.03, { duration: 200, easing: ease.gentle }),
      withTiming(0.96, { duration: 240, easing: ease.gentle }),
      withDelay(60, withTiming(0.82, { duration: 380, easing: ease.inOut })),
      withTiming(0.7, { duration: 400, easing: ease.inOut }),
    );

    // Inner bright glow dies first to fake desaturation of the warm core
    innerGlowOpacity.value = withSequence(
      withDelay(120, withTiming(0.85, { duration: 180, easing: ease.out })),
      withTiming(0.7, { duration: 240 }),
      withTiming(0.78, { duration: 180 }),
      withTiming(0.65, { duration: 220 }),
      withDelay(40, withTiming(0, { duration: 320, easing: ease.inOut })),
    );

    // Text: enters after ignite settles, lingers ~300ms past flame fade.
    // Redirect fires from THIS callback so text fully clears before unmount.
    textTranslate.value = withDelay(320, withTiming(0, { duration: 420, easing: ease.out }));
    textOpacity.value = withDelay(
      320,
      withSequence(
        withTiming(1, { duration: 420, easing: ease.out }),
        withDelay(
          1560,
          withTiming(0, { duration: 600, easing: ease.inOut }, (f) => {
            if (f) runOnJS(finish)();
          }),
        ),
      ),
    );
  }, [reduced]);

  // Failsafe: if a worklet callback misses, redirect anyway.
  useEffect(() => {
    const t = setTimeout(() => setDone(true), TOTAL_MS + 350);
    return () => clearTimeout(t);
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ scale: flameScale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: innerGlowOpacity.value,
    transform: [{ scale: haloScale.value * 0.78 }],
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
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: HALO_SIZE,
              height: HALO_SIZE,
              borderRadius: 999,
              backgroundColor: HALO_OUTER,
            },
            haloStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: HALO_SIZE,
              height: HALO_SIZE,
              borderRadius: 999,
              backgroundColor: HALO_INNER,
            },
            innerGlowStyle,
          ]}
        />
        <Animated.View style={flameStyle}>
          <FlameLogo size={120} />
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
