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
  const offsetsRef = useRef<Record<string, number>>({});

  const handleSelect = (id: CategoryOption) => {
    onSelect(id);
    // Auto-scroll the tapped pill into view. "All" goes to 0; others land with
    // 24px of leading padding so the pill isn't hugging the screen edge.
    const x = id === 'all' ? 0 : Math.max(0, (offsetsRef.current[id] ?? 0) - 24);
    scrollRef.current?.scrollTo({ x, animated: true });
  };

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
          <Animated.View
            key={cat.id}
            onLayout={(e) => {
              offsetsRef.current[cat.id] = e.nativeEvent.layout.x;
            }}
            entering={enter.fadeUp(stagger(cappedIndex, 40))}
          >
            <PillButton
              label={cat.label}
              selected={selected === cat.id}
              onPress={() => handleSelect(cat.id)}
              size="sm"
              accessibilityLabel={`Filter by ${cat.label}`}
            />
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
