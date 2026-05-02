import { View, Text } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { FlameLogo } from '@/components/animations/flame-logo';
import { enter } from '@/lib/motion';

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  const reduced = useReducedMotion();

  return (
    <Animated.View
      entering={reduced ? enter.fade(80) : enter.fadeUp(80)}
      accessible={true}
      accessibilityLabel={`${streak} day streak`}
    >
      <View className="items-center gap-1">
        <View accessible={false}>
          <FlameLogo size={36} loop={true} />
        </View>
        <Text className="text-display font-semibold text-text leading-none">
          {streak}
        </Text>
        <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted">
          day streak
        </Text>
      </View>
    </Animated.View>
  );
}
