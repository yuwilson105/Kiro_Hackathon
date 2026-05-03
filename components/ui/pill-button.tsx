import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { duration, ease, spring } from '@/lib/motion';
import { colors } from '@/lib/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({
  label,
  selected = false,
  onPress,
  size = 'md',
  disabled = false,
  icon,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(selected ? 1 : 0);

  if (selected && progress.value !== 1) {
    progress.value = withTiming(1, { duration: duration.short, easing: ease.snap });
  } else if (!selected && progress.value !== 0) {
    progress.value = withTiming(0, { duration: duration.short, easing: ease.snap });
  }

  // Animate from white (255,255,255) to primaryDeep (74,125,176) — fully filled
  // confident selected state, not the prior soft tint.
  const containerStyle = useAnimatedStyle(() => {
    const bgR = 255 + (74 - 255) * progress.value;
    const bgG = 255 + (125 - 255) * progress.value;
    const bgB = 255 + (176 - 255) * progress.value;
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: `rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)})`,
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    haptics.select();
    scale.value = withSpring(0.97, spring.snap);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, spring.snap);
  };

  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5' : size === 'lg' ? 'px-5 py-3' : 'px-4 py-2.5';
  const textSizeClass = size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      style={[
        containerStyle,
        {
          borderWidth: 1,
          borderColor: selected ? colors.primaryDeep : colors.border,
          borderRadius: 999,
        },
      ]}
      className={`flex-row items-center gap-2 ${sizeClass} ${disabled ? 'opacity-50' : ''}`}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        className={`${textSizeClass} ${selected ? 'font-semibold' : 'font-medium'}`}
        style={{ color: selected ? colors.textInverse : colors.text }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
