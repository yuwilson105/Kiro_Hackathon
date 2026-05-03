import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { PillButton } from '@/components/ui/pill-button';
import { enter, stagger } from '@/lib/motion';
import type { InterestKey } from '@/types/profile';

export const ALL_INTERESTS: InterestKey[] = [
  'tech',
  'finance',
  'politics',
  'social-media',
  'music-entertainment',
  'mental-health-awareness',
  'criminal-justice',
  'lgbtq',
  'womens-rights',
  'immigration',
  'climate',
  'sports',
];

const INTEREST_LABEL: Record<InterestKey, string> = {
  tech: 'Tech',
  ai: 'AI',
  phones: 'Phones',
  finance: 'Money',
  politics: 'Politics',
  voting: 'Voting',
  'social-media': 'Social',
  'music-entertainment': 'Culture',
  'mental-health-awareness': 'Health',
  healthcare: 'Healthcare',
  'criminal-justice': 'Law',
  lgbtq: 'LGBTQ+',
  'womens-rights': "Women's",
  immigration: 'Immigration',
  housing: 'Housing',
  jobs: 'Jobs',
  climate: 'Climate',
  sports: 'Sports',
};

type Props = {
  interests: InterestKey[];
  selected: InterestKey | null;
  onSelect: (key: InterestKey | null) => void;
};

export function FilterPills({ interests, selected, onSelect }: Props) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);

  const pills: Array<{ key: InterestKey | null; label: string }> = [
    { key: null, label: 'All' },
    ...(interests.length > 0 ? interests : ALL_INTERESTS).map((k) => ({
      key: k as InterestKey,
      label: INTEREST_LABEL[k],
    })),
  ];

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, gap: 8 }}
      accessibilityRole="tablist"
    >
      {pills.map(({ key, label }, i) => {
        const cappedIndex = Math.min(i, 8);
        const delay = reduced ? 0 : stagger(cappedIndex, 40);
        const entering = reduced ? enter.fade(delay) : enter.fadeUp(delay);
        return (
          <Animated.View key={key ?? 'all'} entering={entering}>
            <PillButton
              label={label}
              selected={selected === key}
              onPress={() => onSelect(key)}
              accessibilityLabel={key === null ? 'Show all topics' : `Filter by ${label}`}
            />
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
