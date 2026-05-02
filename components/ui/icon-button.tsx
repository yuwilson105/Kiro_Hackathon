import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  icon: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'plain' | 'surface' | 'primary';
};

const variantClass = {
  plain: 'bg-transparent',
  surface: 'bg-surface border border-border-surface',
  primary: 'bg-primary',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  variant = 'plain',
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        haptics.tap();
        scale.value = withSpring(0.92, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.press);
      }}
      hitSlop={8}
      style={[style, { width: size, height: size }]}
      className={`items-center justify-center rounded-full ${variantClass[variant]}`}
      {...rest}
    >
      {icon}
    </AnimatedPressable>
  );
}
