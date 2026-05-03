import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { FlameLogo } from '@/components/animations/flame-logo';
import { enter } from '@/lib/motion';
import { paletteForStreak } from '@/lib/streak-palette';

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  const reduced = useReducedMotion();
  const palette = useMemo(() => paletteForStreak(streak), [streak]);

  return (
    <Animated.View
      entering={reduced ? enter.fade(80) : enter.fadeUp(80)}
      accessible={true}
      accessibilityLabel={`${streak} day streak. Long-press to open dev menu.`}
    >
      <Pressable
        onLongPress={() => router.push('/dev')}
        delayLongPress={300}
        hitSlop={16}
      >
        <View className="items-center gap-1">
          <View accessible={false} pointerEvents="none">
            <FlameLogo
              size={36}
              loop={true}
              outerColors={palette.outer}
              innerColors={palette.inner}
              haloHue={palette.halo}
            />
          </View>
          <Text className="text-display font-serif text-text leading-none">
            {streak}
          </Text>
          <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            day streak
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
