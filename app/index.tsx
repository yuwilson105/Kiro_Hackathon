import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlameLogo } from '@/components/animations/flame-logo';
import { enter } from '@/lib/motion';
import { useStore } from '@/lib/store';

const SPLASH_MS = 1600;

export default function Splash() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const insets = useSafeAreaInsets();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (done) {
    return <Redirect href={hasOnboarded ? '/(tabs)' : '/(onboarding)/dates'} />;
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-surface"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Animated.View entering={enter.zoom(80)} className="items-center">
        <FlameLogo size={120} />
      </Animated.View>

      <Animated.View entering={enter.fadeUp(420)} className="mt-8 items-center">
        <Text className="font-semibold text-text text-4xl tracking-tight">Second Chance</Text>
        <Text className="font-sans text-text-muted text-base mt-3 px-12 text-center leading-6">
          Your next chapter, step by step.
        </Text>
      </Animated.View>
    </View>
  );
}
