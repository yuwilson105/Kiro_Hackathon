import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BubbleBurst } from '@/components/animations/bubble-burst';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PillButton } from '@/components/ui/pill-button';
import { duration as motionDuration, ease, spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { InterestKey } from '@/types/profile';

type Phase = 'interests' | 'greeting' | 'burst' | 'done';

const INTERESTS: { key: InterestKey; label: string }[] = [
  { key: 'lgbtq', label: 'LGBTQ+ rights and culture' },
  { key: 'tech', label: 'Technology and apps' },
  { key: 'politics', label: 'Politics and law' },
  { key: 'finance', label: 'Finance and money' },
  { key: 'social-media', label: 'Social media' },
  { key: 'music-entertainment', label: 'Music and entertainment' },
  { key: 'mental-health-awareness', label: 'Mental health awareness' },
  { key: 'criminal-justice', label: 'Criminal justice reform' },
  { key: 'womens-rights', label: "Women's rights" },
  { key: 'immigration', label: 'Immigration' },
  { key: 'climate', label: 'Climate and environment' },
  { key: 'sports', label: 'Sports' },
];

const GREETING_HOLD_MS = 2400;
const BURST_DURATION_MS = 900;

export default function DemoDashboardScreen() {
  const [phase, setPhase] = useState<Phase>('interests');
  const [burstKey, setBurstKey] = useState(0);
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (phase === 'greeting') {
      const t = setTimeout(() => setPhase('burst'), reduced ? 400 : GREETING_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'burst') {
      setBurstKey((k) => k + 1);
      const t = setTimeout(() => {
        setPhase('done');
        router.replace('/(tabs)');
      }, reduced ? 200 : BURST_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [phase, reduced]);

  if (phase === 'interests') {
    return (
      <View className="flex-1 bg-bg">
        <OnboardingShell
          step={5}
          header="What do you want to catch up on?"
          subtext="A lot changed while you were away. Pick what you're curious about and we'll bring you up to speed."
          onContinue={() => setPhase('greeting')}
          continueLabel="Take me in"
        >
          <View className="flex-row flex-wrap gap-2">
            {INTERESTS.map(({ key, label }) => (
              <PillButton key={key} label={label} selected={true} onPress={() => {}} />
            ))}
          </View>
        </OnboardingShell>
      </View>
    );
  }

  // Greeting / burst / done - full-screen auto-played layer
  return (
    <View className="flex-1 bg-bg">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <BubbleBurst
          width={width}
          height={height}
          originX={width / 2}
          originY={height / 2}
          trigger={burstKey}
        />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <AutoChatbox text={'Welcome, Mike.'} dissolving={phase !== 'greeting'} />
      </View>

      <ExitLink />
    </View>
  );
}

// ─── AutoChatbox: appears on mount, dissolves when `dissolving` flips true ──

type AutoChatboxProps = {
  text: string;
  dissolving: boolean;
};

function AutoChatbox({ text, dissolving }: AutoChatboxProps) {
  const reduced = useReducedMotion();
  const translateY = useSharedValue(reduced ? 0 : 60);
  const scale = useSharedValue(reduced ? 1 : 0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: reduced ? 200 : motionDuration.medium,
      easing: ease.out,
    });
    if (!reduced) {
      translateY.value = withSpring(0, spring.snap);
      scale.value = withSpring(1, spring.snap);
    }
  }, [opacity, translateY, scale, reduced]);

  useEffect(() => {
    if (dissolving) {
      opacity.value = withTiming(0, { duration: 320, easing: ease.snap });
      scale.value = withTiming(0.62, { duration: 320, easing: ease.out });
    }
  }, [dissolving, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.borderSurface,
          borderWidth: 1,
          borderRadius: 28,
          paddingVertical: 22,
          paddingHorizontal: 28,
          minWidth: 220,
          shadowColor: colors.text,
          shadowOpacity: 0.06,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text
          className="font-medium text-text text-center"
          style={{ fontSize: 26, lineHeight: 32 }}
        >
          {text}
        </Text>
      </View>
      <View
        style={{ flexDirection: 'row', gap: 4, marginTop: 10, marginLeft: 24 }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 6 - i,
              height: 6 - i,
              borderRadius: 999,
              backgroundColor: colors.borderSurface,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── ExitLink: tiny safety hatch during recording ────────────────────────────

function ExitLink() {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={() => router.back()}
      style={{ position: 'absolute', top: insets.top + 8, left: 12, padding: 8, zIndex: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Exit demo"
      hitSlop={12}
    >
      <Text className="font-sans text-sm text-text-muted">Exit</Text>
    </Pressable>
  );
}
