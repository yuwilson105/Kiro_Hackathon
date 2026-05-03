import { useState, useMemo, useCallback } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { differenceInYears } from 'date-fns';
import { useShallow } from 'zustand/shallow';

import { FilterPills } from '@/components/catchup/filter-pills';
import { FeedCard } from '@/components/catchup/feed-card';
import { useStore } from '@/lib/store';
import { feedCards } from '@/lib/mock/feed';
import { duration, ease } from '@/lib/motion';
import type { FeedCard as FeedCardType } from '@/types/feed';
import type { InterestKey } from '@/types/profile';

// ---------------------------------------------------------------------------
// Unread count helper - TODO: wire to tabBarBadge in (tabs)/_layout.tsx
// Usage: const unread = useUnreadCount();
// In _layout: <Tabs.Screen name="catchup" options={{ tabBarBadge: unread || undefined }} />
// ---------------------------------------------------------------------------
export function useUnreadCount(): number {
  const readFeedIds = useStore((s) => s.readFeedIds);
  return feedCards.length - readFeedIds.length;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function CatchUpScreen() {
  const reduced = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<InterestKey | null>(null);
  const listOpacity = useSharedValue(1);

  const { profile, savedFeedIds, readFeedIds, toggleFeedSaved, markFeedRead } = useStore(
    useShallow((s) => ({
      profile: s.profile,
      savedFeedIds: s.savedFeedIds,
      readFeedIds: s.readFeedIds,
      toggleFeedSaved: s.toggleFeedSaved,
      markFeedRead: s.markFeedRead,
    }))
  );

  // Compute gap label
  const gapLabel = useMemo(() => {
    if (!profile.gapStart || !profile.gapEnd) return null;
    const years = differenceInYears(new Date(profile.gapEnd), new Date(profile.gapStart));
    return years > 0 ? years : null;
  }, [profile.gapStart, profile.gapEnd]);

  // Filter + sort cards
  const displayCards = useMemo<FeedCardType[]>(() => {
    const base = activeFilter
      ? feedCards.filter((c) => c.category === activeFilter)
      : feedCards;

    if (!activeFilter && profile.interests.length > 0) {
      const interestSet = new Set(profile.interests);
      const matched = base.filter((c) => interestSet.has(c.category));
      const rest = base.filter((c) => !interestSet.has(c.category));
      return [...matched, ...rest];
    }

    return base;
  }, [activeFilter, profile.interests]);

  // Fade list on filter change
  const handleFilterChange = useCallback(
    (key: InterestKey | null) => {
      if (reduced) {
        setActiveFilter(key);
        return;
      }
      listOpacity.value = withTiming(0, { duration: duration.micro, easing: ease.snap }, () => {
        'worklet';
      });
      // JS side: update filter then fade back in
      listOpacity.value = withTiming(0, { duration: duration.micro, easing: ease.snap });
      setTimeout(() => {
        setActiveFilter(key);
        listOpacity.value = withTiming(1, { duration: duration.short, easing: ease.out });
      }, duration.micro);
    },
    [reduced, listOpacity]
  );

  const listStyle = useAnimatedStyle(() => ({ opacity: listOpacity.value }));

  const renderItem = useCallback(
    ({ item }: { item: FeedCardType }) => (
      <FeedCard
        card={item}
        isSaved={savedFeedIds.includes(item.id)}
        isRead={readFeedIds.includes(item.id)}
        onToggleSaved={toggleFeedSaved}
        onMarkRead={markFeedRead}
      />
    ),
    [savedFeedIds, readFeedIds, toggleFeedSaved, markFeedRead]
  );

  const keyExtractor = useCallback((item: FeedCardType) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View style={{ height: 12 }} />,
    []
  );

  const EmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center pt-20 gap-2">
        <Text className="text-base font-medium text-text-muted">Nothing here yet.</Text>
        <Text className="text-sm text-text-muted">Try a different topic.</Text>
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-bg">
      {/* PAGE HEADER */}
      <View className="px-6 pt-14 pb-1">
        <Text className="text-3xl font-medium text-text">While you were away</Text>
        <Text className="text-sm text-text-muted mt-1">
          {gapLabel
            ? `You were inside for ${gapLabel} ${gapLabel === 1 ? 'year' : 'years'}. Here's what changed.`
            : "Here's what changed."}
        </Text>
      </View>

      {/* FILTER PILLS */}
      <FilterPills
        interests={profile.interests}
        selected={activeFilter}
        onSelect={handleFilterChange}
      />

      {/* FEED LIST */}
      <Animated.View style={[{ flex: 1 }, listStyle]}>
        <FlashList
          data={displayCards}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}
