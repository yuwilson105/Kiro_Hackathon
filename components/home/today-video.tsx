import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { ArrowRight, Play } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { buildYouTubeSearchUrl, formatVideoDuration, videos, type Video } from '@/lib/mock/videos';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { InterestKey } from '@/types/profile';

const CATEGORY_LABEL: Record<InterestKey, string> = {
  lgbtq: 'LGBTQ+',
  tech: 'TECH',
  ai: 'AI',
  phones: 'PHONES',
  politics: 'POLITICS',
  voting: 'VOTING',
  finance: 'MONEY',
  'social-media': 'SOCIAL',
  'music-entertainment': 'MUSIC',
  'mental-health-awareness': 'WELLNESS',
  healthcare: 'HEALTHCARE',
  'criminal-justice': 'JUSTICE',
  'womens-rights': "WOMEN'S",
  immigration: 'IMMIGRATION',
  housing: 'HOUSING',
  jobs: 'JOBS',
  climate: 'CLIMATE',
  sports: 'SPORTS',
};

const CATEGORY_COLOR: Record<InterestKey, string> = {
  finance: colors.accent,
  lgbtq: colors.success,
  politics: colors.danger,
  voting: colors.primaryDeep,
  'criminal-justice': colors.primaryDeep,
  tech: colors.primaryDeep,
  ai: colors.primary,
  phones: colors.primary,
  'social-media': colors.primaryDeep,
  'mental-health-awareness': colors.primary,
  healthcare: colors.primary,
  immigration: colors.primary,
  'music-entertainment': colors.textMuted,
  'womens-rights': colors.textMuted,
  housing: colors.successDeep,
  jobs: colors.primaryDeep,
  climate: colors.success,
  sports: colors.textMuted,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function TodayVideo(): React.ReactElement | null {
  const interests = useStore((s) => s.profile.interests);
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const video = useMemo<Video | null>(() => {
    if (videos.length === 0) return null;
    const interestSet = new Set(interests);
    const matched = interests.length > 0 ? videos.filter((v) => interestSet.has(v.category)) : videos;
    const pool = matched.length > 0 ? matched : videos;
    const idx = dayOfYear(new Date()) % pool.length;
    return pool[idx];
  }, [interests]);

  const animStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ scale: scale.value }] },
  );

  const handlePressIn = useCallback(() => {
    haptics.tap();
    if (!reduced) scale.value = withSpring(0.98, spring.press);
  }, [reduced, scale]);

  const handlePressOut = useCallback(() => {
    if (!reduced) scale.value = withSpring(1, spring.press);
  }, [reduced, scale]);

  if (!video) return null;

  const eyebrowColor = CATEGORY_COLOR[video.category];
  const eyebrowLabel = CATEGORY_LABEL[video.category];
  const duration = formatVideoDuration(video.durationSec);

  return (
    <AnimatedPressable
      onPress={() => Linking.openURL(buildYouTubeSearchUrl(video.searchQuery))}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animStyle,
        {
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          overflow: 'hidden',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Watch video: ${video.title}. ${duration}`}
    >
      {/* Thumbnail with real image + dim overlay + play icon + duration badge */}
      <View
        style={{
          aspectRatio: 16 / 9,
          backgroundColor: colors.primarySoft,
          position: 'relative',
        }}
      >
        <Image
          source={{ uri: video.thumbnailUrl }}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          transition={200}
          accessibilityLabel={`Thumbnail for: ${video.title}`}
        />
        {/* Subtle dark overlay so the play icon is always legible */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(31,45,61,0.18)',
          }}
        />
        {/* Center play icon */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.94)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={24} color={colors.primaryDeep} strokeWidth={2} fill={colors.primaryDeep} />
          </View>
        </View>
        {/* Duration badge bottom-right */}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(31,45,61,0.78)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'Onest_500Medium',
              color: '#FFFFFF',
              letterSpacing: 0.3,
            }}
          >
            {duration}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Onest_500Medium',
              color: eyebrowColor,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            VIDEO · {eyebrowLabel}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Onest_400Regular',
              color: colors.textMuted,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {video.yearsAgo === 0 ? 'NEW' : `${video.yearsAgo}Y AGO`}
          </Text>
        </View>
        <Text
          className="font-medium text-text"
          style={{ fontSize: 16, lineHeight: 22, marginTop: 6 }}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: 10,
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'Onest_500Medium',
              color: colors.primaryDeep,
            }}
          >
            Watch
          </Text>
          <ArrowRight size={14} color={colors.primaryDeep} strokeWidth={2.25} />
        </View>
      </View>
    </AnimatedPressable>
  );
}
