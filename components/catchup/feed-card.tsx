import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react-native';

import { Card } from '@/components/ui/card';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { FeedCard as FeedCardType } from '@/types/feed';
import type { InterestKey } from '@/types/profile';

const CATEGORY_LABEL: Record<InterestKey, string> = {
  finance: 'MONEY',
  lgbtq: 'LGBTQ+',
  politics: 'POLITICS',
  voting: 'VOTING',
  'criminal-justice': 'LAW',
  tech: 'TECH',
  ai: 'AI',
  phones: 'PHONES',
  'social-media': 'SOCIAL',
  'mental-health-awareness': 'HEALTH',
  healthcare: 'HEALTHCARE',
  'music-entertainment': 'CULTURE',
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
  'music-entertainment': colors.textMuted,
  'womens-rights': colors.primary,
  immigration: colors.textMuted,
  housing: colors.successDeep,
  jobs: colors.primaryDeep,
  climate: colors.success,
  sports: colors.textMuted,
};

type Props = {
  card: FeedCardType;
  isSaved: boolean;
  isRead: boolean;
  onToggleSaved: (id: string) => void;
  onMarkRead: (id: string) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FeedCard({ card, isSaved, isRead, onToggleSaved, onMarkRead }: Props) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: opacity.value };
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    haptics.tap();
    if (reduced) {
      opacity.value = withSpring(0.75, spring.press);
    } else {
      scale.value = withSpring(0.97, spring.press);
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
    onMarkRead(card.id);
    router.push({ pathname: '/reader', params: { id: card.id } });
  };

  const handleBookmark = () => {
    haptics.select();
    onToggleSaved(card.id);
  };

  const eyebrowColor = CATEGORY_COLOR[card.category];
  const eyebrowLabel = CATEGORY_LABEL[card.category];
  const cardOpacity = isRead ? 0.75 : 1;

  return (
    <AnimatedPressable
      style={animStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Read article: ${card.title}`}
    >
      <Card variant="plain" padding="md" style={{ opacity: cardOpacity }}>
        {/* Top row: category + read time */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5">
            {!isRead && (
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: eyebrowColor }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            )}
            <Text
              className="text-2xs font-medium uppercase tracking-wider"
              style={{ color: eyebrowColor, letterSpacing: 0.8 }}
            >
              {eyebrowLabel}
            </Text>
          </View>
          <Text className="text-2xs font-medium text-text-muted" style={{ letterSpacing: 0.6 }}>
            {card.readMinutes} MIN READ
          </Text>
        </View>

        {/* Title */}
        <Text
          className="text-base font-medium text-text leading-6"
          numberOfLines={2}
        >
          {card.title}
        </Text>

        {/* Teaser */}
        <Text
          className="text-sm text-text-muted leading-5 mt-1"
          numberOfLines={2}
        >
          {card.teaser}
        </Text>

        {/* Bottom row: bookmark + read link */}
        <View className="flex-row items-center justify-between mt-3">
          <Pressable
            onPress={handleBookmark}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Unsave article' : 'Save article'}
            accessibilityState={{ selected: isSaved }}
          >
            {isSaved ? (
              <BookmarkCheck size={18} color={colors.primaryDeep} strokeWidth={2} />
            ) : (
              <Bookmark size={18} color={colors.textMuted} strokeWidth={1.75} />
            )}
          </Pressable>

          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-medium text-primary-deep">Read</Text>
            <ArrowRight size={14} color={colors.primaryDeep} strokeWidth={2} />
          </View>
        </View>
      </Card>
    </AnimatedPressable>
  );
}
