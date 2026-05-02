import { Pressable, Text, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';

type Variant = 'primary' | 'outline' | 'ghost' | 'soft';
type Size = 'lg' | 'md' | 'sm';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: ViewStyle;
};

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary border border-primary',
  outline: 'bg-bg border border-border',
  ghost: 'bg-transparent border border-transparent',
  soft: 'bg-surface border border-border-surface',
};

const variantTextClass: Record<Variant, string> = {
  primary: 'text-text-inverse',
  outline: 'text-text',
  ghost: 'text-primary-deep',
  soft: 'text-text',
};

const sizeClass: Record<Size, string> = {
  lg: 'h-14 px-6 rounded-pill',
  md: 'h-12 px-5 rounded-pill',
  sm: 'h-10 px-4 rounded-pill',
};

const sizeTextClass: Record<Size, string> = {
  lg: 'text-base',
  md: 'text-base',
  sm: 'text-sm',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    haptics.tap();
    scale.value = withSpring(0.96, spring.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, spring.press);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      className={`flex-row items-center justify-center gap-2 ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50' : ''}`}
      {...rest}
    >
      {leadingIcon}
      <Text className={`font-medium ${sizeTextClass[size]} ${variantTextClass[variant]}`}>
        {label}
      </Text>
      {trailingIcon}
    </AnimatedPressable>
  );
}
