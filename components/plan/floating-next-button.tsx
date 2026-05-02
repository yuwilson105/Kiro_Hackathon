import { type RefObject } from 'react';
import { type ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { ArrowDown } from 'lucide-react-native';

import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors, radii, shadow } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  scrollRef: RefObject<ScrollView | null>;
  onPress: () => void;
};

export function FloatingNextButton({ scrollRef, onPress }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ scale: scale.value }],
  }));

  function handlePressIn() {
    haptics.tap();
    scale.value = withSpring(0.95, spring.press);
  }

  function handlePressOut() {
    scale.value = withSpring(1, spring.press);
  }

  return (
    <AnimatedPressable
      style={[
        animStyle,
        shadow.fab,
        {
          position: 'absolute',
          bottom: 96,
          right: 16,
          borderRadius: radii.pill,
          backgroundColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 6,
        },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Scroll to next incomplete step"
      accessibilityHint="Jumps to the next task that isn't finished yet"
    >
      <Text
        style={{ color: colors.textInverse, fontFamily: 'HankenGrotesk_500Medium', fontSize: 14 }}
      >
        What's next?
      </Text>
      <ArrowDown size={14} color={colors.textInverse} strokeWidth={2} />
    </AnimatedPressable>
  );
}
