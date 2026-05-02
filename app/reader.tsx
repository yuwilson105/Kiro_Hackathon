import { useLocalSearchParams, router } from 'expo-router';
import { Bookmark, BookmarkCheck, Clock, X } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import * as haptics from '@/lib/haptics';
import { feedCards } from '@/lib/mock/feed';
import { enter, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { useStore } from '@/lib/store';
import type { InterestKey } from '@/types/profile';

// Category → color token mapping per Leader 06 §9
const categoryColor: Record<InterestKey, string> = {
  finance: colors.accent,
  lgbtq: colors.success,
  'criminal-justice': colors.danger,
  tech: colors.primaryDeep,
  'social-media': colors.primaryDeep,
  'mental-health-awareness': colors.primary,
  politics: colors.textMuted,
  'music-entertainment': colors.textMuted,
  'womens-rights': colors.textMuted,
  immigration: colors.textMuted,
  climate: colors.textMuted,
  sports: colors.textMuted,
};

const categoryLabel: Record<InterestKey, string> = {
  finance: 'FINANCE',
  lgbtq: 'LGBTQ+',
  'criminal-justice': 'LAW',
  tech: 'TECH',
  'social-media': 'SOCIAL MEDIA',
  'mental-health-awareness': 'MENTAL HEALTH',
  politics: 'POLITICS',
  'music-entertainment': 'ENTERTAINMENT',
  'womens-rights': "WOMEN'S RIGHTS",
  immigration: 'IMMIGRATION',
  climate: 'CLIMATE',
  sports: 'SPORTS',
};

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reduced = useReducedMotion();

  const savedFeedIds = useStore((s) => s.savedFeedIds);
  const toggleFeedSaved = useStore((s) => s.toggleFeedSaved);
  const markFeedRead = useStore((s) => s.markFeedRead);

  const card = id ? feedCards.find((c) => c.id === id) : undefined;
  const isSaved = id ? savedFeedIds.includes(id) : false;

  // Mark read on mount
  useEffect(() => {
    if (id && card) markFeedRead(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookmark = () => {
    if (!id) return;
    haptics.select();
    toggleFeedSaved(id);
  };

  // ── Not-found state ──────────────────────────────────────────────────────────
  if (!card) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-8 gap-4">
        <Text className="font-sans text-base text-text-muted text-center">
          Couldn't find this article.
        </Text>
        <Button
          label="Go back"
          variant="outline"
          size="md"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const paragraphs = card.body.split('\n\n').filter(Boolean);
  const eyebrowColor = categoryColor[card.category];

  return (
    <View className="flex-1 bg-bg">
      {/* ── Sticky top bar ──────────────────────────────────────────────────── */}
      <View
        className="flex-row items-center justify-between px-3 bg-bg"
        style={styles.topBar}
      >
        <IconButton
          icon={<X size={20} color={colors.text} strokeWidth={2} />}
          onPress={() => router.back()}
          accessibilityLabel="Close article"
          variant="plain"
          size={44}
        />
        <IconButton
          icon={
            isSaved ? (
              <BookmarkCheck size={20} color={colors.primary} strokeWidth={2} />
            ) : (
              <Bookmark size={20} color={colors.text} strokeWidth={2} />
            )
          }
          onPress={handleBookmark}
          accessibilityLabel={isSaved ? 'Saved — tap to remove' : 'Save article'}
          accessibilityState={{ checked: isSaved }}
          variant="plain"
          size={44}
        />
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Category eyebrow */}
        <Animated.View entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(0))}>
          <Text
            className="text-2xs font-medium uppercase tracking-wider"
            style={{ color: eyebrowColor }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {categoryLabel[card.category]}
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(1))}>
          <Text
            className="font-medium text-text mt-2 leading-9"
            style={styles.title}
            accessibilityRole="header"
          >
            {card.title}
          </Text>
        </Animated.View>

        {/* Read time + years ago */}
        <Animated.View
          entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(2))}
          className="flex-row items-center gap-2 mt-3"
        >
          <Clock size={14} color={colors.textMuted} strokeWidth={1.5} />
          <Text className="font-sans text-sm text-text-muted">
            {card.readMinutes} min read
          </Text>
          <Text
            className="font-sans text-sm text-text-muted"
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            ·
          </Text>
          <Text className="font-sans text-sm text-text-muted">
            {card.yearsAgo} {card.yearsAgo === 1 ? 'year' : 'years'} ago
          </Text>
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(3))}
          className="mt-6"
          style={styles.divider}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />

        {/* Article body */}
        <View
          accessible
          accessibilityLabel={card.title}
          accessibilityRole="none"
        >
          {paragraphs.map((para, i) => {
            const cappedIndex = Math.min(i + 4, 8);
            return (
              <Animated.Text
                key={i}
                entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(cappedIndex))}
                className="font-sans text-base text-text leading-7 mt-4"
              >
                {para}
              </Animated.Text>
            );
          })}
        </View>

        {/* End of article */}
        <Animated.View
          entering={reduced ? enter.fade(0) : enter.fadeUp(stagger(8))}
          className="my-8 items-center"
        >
          <Text className="font-sans text-sm text-text-muted text-center">
            End of article.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
});
