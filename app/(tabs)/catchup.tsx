import { FlashList } from '@shopify/flash-list';
import { differenceInYears } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';

import { FeedCard } from '@/components/catchup/feed-card';
import { FilterPills } from '@/components/catchup/filter-pills';
import { generateFeedFromAPI } from '@/lib/api';
import { feedCards } from '@/lib/mock/feed';
import { duration, ease } from '@/lib/motion';
import { useStore } from '@/lib/store';
import type { FeedCard as FeedCardType } from '@/types/feed';
import type { InterestKey } from '@/types/profile';

// ---------------------------------------------------------------------------
// Unread count helper — TODO: wire to tabBarBadge in (tabs)/_layout.tsx
// Usage: const unread = useUnreadCount();
// In _layout: <Tabs.Screen name="catchup" options={{ tabBarBadge: unread || undefined }} />
// ---------------------------------------------------------------------------
export function useUnreadCount(): number {
  const readFeedIds = useStore((s) => s.readFeedIds);
  return feedCards.length - readFeedIds.length;
}

// ---------------------------------------------------------------------------
// Skeleton card — shown while feed is loading
// ---------------------------------------------------------------------------
function SkeletonCard() {
  const reduced = useReducedMotion();
  const shimmer = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700, easing: ease.snap }),
        withTiming(1, { duration: 700, easing: ease.snap }),
      ),
      -1,
      false,
    );
  }, [reduced, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <View className="bg-surface rounded-xl p-4 gap-3">
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-4 w-3/4" />
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-3 w-full" />
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-3 w-5/6" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function CatchUpScreen() {
  const reduced = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<InterestKey | null>(null);
  const [cards, setCards] = useState<FeedCardType[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    generateFeedFromAPI(profile).then((result) => {
      setCards(result.length > 0 ? result : feedCards);
      setLoading(false);
    });
  }, []); // only on mount

  // Compute gap label
  const gapLabel = useMemo(() => {
    if (!profile.gapStart || !profile.gapEnd) return null;
    const years = differenceInYears(new Date(profile.gapEnd), new Date(profile.gapStart));
    return years > 0 ? years : null;
  }, [profile.gapStart, profile.gapEnd]);

  // Filter + sort cards
  const displayCards = useMemo<FeedCardType[]>(() => {
    const base = activeFilter
      ? cards.filter((c) => c.category === activeFilter)
      : cards;

    if (!activeFilter && profile.interests.length > 0) {
      const interestSet = new Set(profile.interests);
      const matched = base.filter((c) => interestSet.has(c.category));
      const rest = base.filter((c) => !interestSet.has(c.category));
      return [...matched, ...rest];
    }

    return base;
  }, [activeFilter, profile.interests, cards]);

  // Fade list on filter change
  const handleFilterChange = useCallback(
    (key: InterestKey | null) => {
      if (reduced) {
        setActiveFilter(key);
        return;
      }
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

      {/* SKELETON LOADING */}
      {loading && (
        <View className="flex-1 px-6 pt-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}

      {/* FEED LIST */}
      {!loading && (
        <Animated.View style={[{ flex: 1 }, listStyle]}>
          <FlashList
            data={displayCards}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={120}
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
      )}
    </View>
  );
}
