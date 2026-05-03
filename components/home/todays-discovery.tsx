import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';

import { useStore } from '@/lib/store';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { feedCards } from '@/lib/mock/feed';
import type { InterestKey } from '@/types/profile';

const CATEGORY_LABEL: Record<InterestKey, string> = {
  finance: 'FINANCE',
  'civil-rights': 'RIGHTS',
  politics: 'POLITICS',
  voting: 'VOTING',
  'criminal-justice': 'LAW',
  tech: 'TECH',
  ai: 'AI',
  phones: 'PHONES',
  'social-media': 'SOCIAL',
  'mental-health-awareness': 'WELLNESS',
  healthcare: 'HEALTHCARE',
  'music-entertainment': 'CULTURE',
  immigration: 'IMMIGRATION',
  housing: 'HOUSING',
  jobs: 'JOBS',
  climate: 'CLIMATE',
  sports: 'SPORTS',
};

const CATEGORY_COLOR: Record<InterestKey, string> = {
  finance: colors.accent,
  'civil-rights': colors.success,
  politics: colors.danger,
  voting: colors.primaryDeep,
  'criminal-justice': colors.primaryDeep,
  tech: colors.primaryDeep,
  ai: colors.primary,
  phones: colors.primary,
  'social-media': colors.primaryDeep,
  'mental-health-awareness': colors.primary,
  healthcare: colors.primary,
  'music-entertainment': colors.textMuted,
  immigration: colors.textMuted,
  housing: colors.successDeep,
  jobs: colors.primaryDeep,
  climate: colors.success,
  sports: colors.textMuted,
};

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TodaysDiscovery(): React.ReactElement | null {
  const router = useRouter();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const interests = useStore((s) => s.profile.interests);
  const readFeedIds = useStore((s) => s.readFeedIds);

  const unread = feedCards.filter((c) => !readFeedIds.includes(c.id));
  const pool =
    interests.length > 0
      ? unread.filter((c) => interests.includes(c.category))
      : unread;

  const candidates = pool.length > 0 ? pool : unread;
  if (candidates.length === 0) return null;

  const card = candidates[dayOfYear() % candidates.length];

  const categoryColor = CATEGORY_COLOR[card.category];
  const categoryLabel = CATEGORY_LABEL[card.category];

  const animStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: opacity.value };
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    haptics.tap();
    if (reduced) {
      opacity.value = withSpring(0.75, spring.press);
    } else {
      scale.value = withSpring(0.98, spring.press);
    }
  };

  const handlePressOut = () => {
    if (reduced) {
      opacity.value = withSpring(1, spring.press);
    } else {
      scale.value = withSpring(1, spring.press);
    }
  };

  const handlePress = () => {
    router.push({ pathname: '/reader', params: { id: card.id } });
  };

  return (
    <AnimatedPressable
      style={animStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Today's discovery: ${card.title}. ${card.readMinutes} minute read.`}
    >
      <View className="bg-bg border border-border rounded-2xl p-4 w-full">
        {/* Eyebrow row — type badge on left, category badge on right */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-2xs font-medium uppercase tracking-wider text-text-muted"
            importantForAccessibility="no"
          >
            ARTICLE
          </Text>
          <Text
            className="text-2xs font-medium uppercase tracking-wider"
            style={{ color: categoryColor }}
          >
            {categoryLabel}
          </Text>
        </View>

        {/* Title */}
        <Text
          className="text-base font-medium text-text leading-snug mt-2"
          numberOfLines={2}
        >
          {card.title}
        </Text>

        {/* Teaser */}
        <Text
          className="text-sm font-sans text-text-muted leading-5 mt-1"
          numberOfLines={2}
        >
          {card.teaser}
        </Text>

        {/* Bottom row */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center gap-1.5">
            <Clock size={12} color={colors.textMuted} strokeWidth={1.5} />
            <Text className="text-xs font-sans text-text-muted">
              {card.readMinutes} min read
            </Text>
          </View>
          <Text className="text-sm font-medium text-primary-deep">Read →</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
