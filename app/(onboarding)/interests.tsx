import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PillButton } from '@/components/ui/pill-button';
import { enter, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import type { InterestKey } from '@/types/profile';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PILLS: { label: string; key: InterestKey }[] = [
  { label: 'LGBTQ+ rights and culture', key: 'lgbtq' },
  { label: 'Technology and apps', key: 'tech' },
  { label: 'Politics and law', key: 'politics' },
  { label: 'Finance and money', key: 'finance' },
  { label: 'Social media', key: 'social-media' },
  { label: 'Music and entertainment', key: 'music-entertainment' },
  { label: 'Mental health awareness', key: 'mental-health-awareness' },
  { label: 'Criminal justice reform', key: 'criminal-justice' },
  { label: "Women's rights", key: 'womens-rights' },
  { label: 'Immigration', key: 'immigration' },
  { label: 'Climate and environment', key: 'climate' },
  { label: 'Sports', key: 'sports' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function InterestsScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const reduced = useReducedMotion();

  const [interests, setInterests] = useState<InterestKey[]>([]);

  const toggle = useCallback((key: InterestKey) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  function handleContinue() {
    setProfile({ interests });
    router.replace('/(onboarding)/building');
  }

  // Stagger capped at 8 per animation standards
  const pillEntering = (i: number) => {
    const cappedIndex = Math.min(i, 8);
    const delay = reduced ? 0 : stagger(cappedIndex, 30);
    return reduced ? enter.fade(delay) : enter.fadeUp(delay);
  };

  return (
    <OnboardingShell
      step={5}
      header="What do you want to catch up on?"
      subtext="A lot changed while you were away. Pick what you're curious about and we'll bring you up to speed."
      onContinue={handleContinue}
      continueLabel="Take me in"
      continueDisabled={interests.length === 0}
    >
      <View accessible={false}>
        <View className="flex-row flex-wrap gap-2">
          {PILLS.map(({ label, key }, i) => (
            <Animated.View key={key} entering={pillEntering(i)}>
              <PillButton
                label={label}
                selected={interests.includes(key)}
                onPress={() => toggle(key)}
                accessibilityLabel={`${label}${interests.includes(key) ? ', selected' : ''}`}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}
