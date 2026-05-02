import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { duration, ease } from '@/lib/motion';
import { colors } from '@/lib/theme';

type Props = {
  segments: number;
  current: number;
  className?: string;
};

export function ProgressBar({ segments, current, className = '' }: Props) {
  return (
    <View className={`flex-row gap-1.5 ${className}`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: segments, now: current }}>
      {Array.from({ length: segments }).map((_, i) => (
        <ProgressSegment key={i} active={i < current} />
      ))}
    </View>
  );
}

function ProgressSegment({ active }: { active: boolean }) {
  const fill = useSharedValue(active ? 1 : 0);

  if (active && fill.value !== 1) {
    fill.value = withTiming(1, { duration: duration.medium, easing: ease.out });
  } else if (!active && fill.value !== 0) {
    fill.value = withTiming(0, { duration: duration.short, easing: ease.snap });
  }

  const style = useAnimatedStyle(() => ({
    backgroundColor: fill.value > 0.5 ? colors.primary : colors.border,
    opacity: 0.4 + 0.6 * fill.value,
  }));

  return <Animated.View className="flex-1 h-1 rounded-full" style={style} />;
}
