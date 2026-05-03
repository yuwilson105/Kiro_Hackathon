import { useState, useMemo, useCallback } from 'react';
import { FlatList, Pressable, View, Text } from 'react-native';
import Animated, {
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { differenceInYears } from 'date-fns';
import { useShallow } from 'zustand/shallow';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';

import { FilterPills } from '@/components/catchup/filter-pills';
import { FeedCard } from '@/components/catchup/feed-card';
import { VideoCard } from '@/components/catchup/video-card';
import { PillButton } from '@/components/ui/pill-button';
import { useStore } from '@/lib/store';
import { feedCards } from '@/lib/mock/feed';
import { videos, type Video } from '@/lib/mock/videos';
import { duration, ease } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { FeedCard as FeedCardType } from '@/types/feed';
import type { InterestKey } from '@/types/profile';

// Unified list item — articles and videos render in the same FlatList.
type FeedItem =
  | { kind: 'article'; id: string; data: FeedCardType }
  | { kind: 'video'; id: string; data: Video };

// 1:1 zip — videos and articles alternate so the feed reads as a real mix
// (lead with video so the page isn't a wall of text up top). If one stream
// is longer, leftover items append in order.
function interleave(articles: FeedCardType[], vids: Video[]): FeedItem[] {
  const out: FeedItem[] = [];
  const max = Math.max(articles.length, vids.length);
  for (let i = 0; i < max; i++) {
    if (i < vids.length) {
      out.push({ kind: 'video', id: `v-${vids[i].id}`, data: vids[i] });
    }
    if (i < articles.length) {
      out.push({ kind: 'article', id: `a-${articles[i].id}`, data: articles[i] });
    }
  }
  return out;
}

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
  const [view, setView] = useState<'feed' | 'saved'>('feed');
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

  // Filter + sort cards (articles + videos), then interleave.
  const displayItems = useMemo<FeedItem[]>(() => {
    const interestSet = new Set(profile.interests);

    const baseArticles = activeFilter
      ? feedCards.filter((c) => c.category === activeFilter)
      : feedCards;
    const baseVideos = activeFilter
      ? videos.filter((v) => v.category === activeFilter)
      : videos;

    let articles = baseArticles;
    let vids = baseVideos;
    if (!activeFilter && profile.interests.length > 0) {
      const matchedA = baseArticles.filter((c) => interestSet.has(c.category));
      const restA = baseArticles.filter((c) => !interestSet.has(c.category));
      articles = [...matchedA, ...restA];
      const matchedV = baseVideos.filter((v) => interestSet.has(v.category));
      const restV = baseVideos.filter((v) => !interestSet.has(v.category));
      vids = [...matchedV, ...restV];
    }

    const final = interleave(articles, vids);

    // 'saved' view: keep only articles the user has bookmarked.
    // Videos aren't savable in the current model, so they're dropped here.
    if (view === 'saved') {
      const savedSet = new Set(savedFeedIds);
      return final.filter(
        (item) => item.kind === 'article' && savedSet.has(item.data.id),
      );
    }

    return final;
  }, [activeFilter, profile.interests, view, savedFeedIds]);

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
    ({ item }: { item: FeedItem }) => {
      if (item.kind === 'video') {
        return <VideoCard video={item.data} />;
      }
      return (
        <FeedCard
          card={item.data}
          isSaved={savedFeedIds.includes(item.data.id)}
          isRead={readFeedIds.includes(item.data.id)}
          onToggleSaved={toggleFeedSaved}
          onMarkRead={markFeedRead}
        />
      );
    },
    [savedFeedIds, readFeedIds, toggleFeedSaved, markFeedRead]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View style={{ height: 12 }} />,
    []
  );

  const EmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center pt-20 gap-2 px-8">
        {view === 'saved' ? (
          <>
            <Text className="text-base font-medium text-text-muted">Nothing saved yet.</Text>
            <Text className="text-sm text-text-muted text-center">
              Tap the bookmark on any article to save it here.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-base font-medium text-text-muted">Nothing here yet.</Text>
            <Text className="text-sm text-text-muted">Try a different topic.</Text>
          </>
        )}
      </View>
    ),
    [view]
  );

  return (
    <View className="flex-1 bg-bg">
      {/* PAGE HEADER — Saved moved down so the title can breathe */}
      <View className="px-6 pt-14 pb-1">
        <Text className="text-3xl font-medium text-text">While you were away</Text>
        <Text className="text-sm text-text-muted mt-1">
          {gapLabel
            ? `You were inside for ${gapLabel} ${gapLabel === 1 ? 'year' : 'years'}. Here's what changed.`
            : "Here's what changed."}
        </Text>
      </View>

      {/* FILTER PILLS + SAVED — Saved anchored on the right of the same row */}
      <View className="flex-row items-center">
        <View style={{ flex: 1 }}>
          <FilterPills
            interests={profile.interests}
            selected={activeFilter}
            onSelect={handleFilterChange}
          />
        </View>
        <Pressable
          onPress={() => setView((v) => (v === 'feed' ? 'saved' : 'feed'))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityState={{ selected: view === 'saved' }}
          accessibilityLabel={view === 'saved' ? 'Show all articles' : 'Show saved articles'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            marginLeft: 4,
            // Soft primary chip when active so it reads as "this is on" without
            // a label — outline-only when inactive so it doesn't compete with
            // the filter pills next to it.
            backgroundColor: view === 'saved' ? colors.primarySoft : 'transparent',
          }}
        >
          {view === 'saved' ? (
            <BookmarkCheck
              size={18}
              color={colors.primaryDeep}
              strokeWidth={2}
              fill={colors.primaryDeep}
            />
          ) : (
            <Bookmark size={18} color={colors.primaryDeep} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      {/* FEED LIST */}
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, listStyle]}>
          <FlatList
            data={displayItems}
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
    </View>
  );
}
