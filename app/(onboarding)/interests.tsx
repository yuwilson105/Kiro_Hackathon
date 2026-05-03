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

// Mix of single-word pills (preferred, pill grid reads cleanest tight) and
// the few descriptive labels that earn their length ("Justice reform",
// "Mental health", "Civil rights").
const PILLS: { label: string; key: InterestKey }[] = [
  { label: 'Tech', key: 'tech' },
  { label: 'AI', key: 'ai' },
  { label: 'Phones', key: 'phones' },
  { label: 'Jobs', key: 'jobs' },
  { label: 'Housing', key: 'housing' },
  { label: 'Healthcare', key: 'healthcare' },
  { label: 'Finance', key: 'finance' },
  { label: 'Politics', key: 'politics' },
  { label: 'Voting', key: 'voting' },
  { label: 'Justice reform', key: 'criminal-justice' },
  { label: 'Mental health', key: 'mental-health-awareness' },
  { label: 'Civil rights', key: 'civil-rights' },
  { label: 'Immigration', key: 'immigration' },
  { label: 'Climate', key: 'climate' },
  { label: 'Social media', key: 'social-media' },
  { label: 'Music & TV', key: 'music-entertainment' },
  { label: 'Sports', key: 'sports' },
];

const PILL_BY_KEY: Record<InterestKey, { label: string; key: InterestKey }> =
  Object.fromEntries(PILLS.map((p) => [p.key, p])) as Record<
    InterestKey,
    { label: string; key: InterestKey }
  >;

// Hand-tuned row buckets so widths balance and no pill orphans on its own
// row. Each row renders with justifyContent: 'space-between' so spacing
// reads as intentional asymmetry instead of ragged-right. Rows of 1 pill
// fall back to flex-start so the lone pill doesn't stretch.
const ROWS: InterestKey[][] = [
  ['tech', 'ai', 'jobs', 'healthcare'],
  ['phones', 'voting', 'climate', 'immigration'],
  ['housing', 'finance', 'politics', 'sports'],
  [
    'civil-rights',
    'mental-health-awareness',
    'criminal-justice',
    'music-entertainment',
    'social-media',
  ],
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
      continueLabel="Build my plan"
      continueDisabled={interests.length === 0}
      featuredCta
    >
      <View accessible={false}>
        <View style={{ rowGap: 12 }}>
          {ROWS.map((row, r) => {
            const startIdx = ROWS.slice(0, r).reduce(
              (sum, prev) => sum + prev.length,
              0,
            );
            return (
              <View
                key={r}
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  columnGap: 10,
                  rowGap: 12,
                  justifyContent: row.length > 1 ? 'space-between' : 'flex-start',
                }}
              >
                {row.map((key, i) => {
                  const { label } = PILL_BY_KEY[key];
                  return (
                    <Animated.View key={key} entering={pillEntering(startIdx + i)}>
                      <PillButton
                        label={label}
                        size="lg"
                        selected={interests.includes(key)}
                        onPress={() => toggle(key)}
                        accessibilityLabel={`${label}${interests.includes(key) ? ', selected' : ''}`}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </OnboardingShell>
  );
}
