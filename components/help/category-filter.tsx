'use client';

import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PillButton } from '@/components/ui/pill-button';
import { enter, stagger } from '@/lib/motion';
import type { ResourceCategory } from '@/types/resource';

export type CategoryOption = ResourceCategory | 'all';

type Category = { id: CategoryOption; label: string };

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'housing', label: 'Housing' },
  { id: 'food', label: 'Food' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'legal', label: 'Legal aid' },
  { id: 'mental-health', label: 'Mental health' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'documents', label: 'Documents' },
  { id: 'financial', label: 'Financial' },
];

type Props = {
  selected: CategoryOption;
  onSelect: (cat: CategoryOption) => void;
};

export function CategoryFilter({ selected, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 4, gap: 8 }}
      keyboardShouldPersistTaps="handled"
    >
      {CATEGORIES.map((cat, i) => {
        const cappedIndex = Math.min(i, 8);
        return (
          <Animated.View key={cat.id} entering={enter.fadeUp(stagger(cappedIndex, 40))}>
            <PillButton
              label={cat.label}
              selected={selected === cat.id}
              onPress={() => onSelect(cat.id)}
              size="sm"
              accessibilityLabel={`Filter by ${cat.label}`}
            />
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
