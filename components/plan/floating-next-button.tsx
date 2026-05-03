import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  type SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { ArrowDown } from 'lucide-react-native';

import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors, radii, shadow } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  scrollY: SharedValue<number>;
  nextStepY: SharedValue<number | null>;
  onPress: () => void;
};

// Distance in px within which the user is considered "at" the next step.
// Wider than the arrow's 8px dead-zone — a step is usually in view well
// before its top exactly matches scrollY.
const NEAR_TARGET_PX = 300;
// How long the user must stay scrolled away from the next step before
// the button reappears. Lets you scroll around without it bouncing in.
const SHOW_AFTER_AWAY_MS = 10_000;
const FADE_MS = 220;

export function FloatingNextButton({ scrollY, nextStepY, onPress }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  // 0 = arrow points down (next step is below us), 180 = points up (next step is above us)
  const arrowRotation = useSharedValue(0);
  // 1 = visible. Starts hidden — we earn visibility by being away for SHOW_AFTER_AWAY_MS.
  const visibility = useSharedValue(0);

  // JS-thread mirror of the scroll-distance check, so we can run a setTimeout off it.
  const [isNearTarget, setIsNearTarget] = useState(true);
  // Final visibility decision — true after the user has been away long enough.
  const [shouldShow, setShouldShow] = useState(false);

  const animStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: reduced ? [] : [{ scale: scale.value }],
  }));

  // Flip the arrow direction whenever the next step crosses the current scroll position.
  useAnimatedReaction(
    () => {
      if (nextStepY.value === null) return false;
      // Small dead zone so the arrow doesn't twitch when the user lands exactly on the step.
      return nextStepY.value < scrollY.value - 8;
    },
    (isAbove, prev) => {
      if (isAbove === prev) return;
      arrowRotation.value = reduced
        ? (isAbove ? 180 : 0)
        : withSpring(isAbove ? 180 : 0, { damping: 18, stiffness: 220, mass: 0.8 });
    },
  );

  // Track whether the user is near the next step. No target = treat as near (hide).
  useAnimatedReaction(
    () => {
      if (nextStepY.value === null) return true;
      return Math.abs(nextStepY.value - scrollY.value) < NEAR_TARGET_PX;
    },
    (near, prev) => {
      if (near === prev) return;
      runOnJS(setIsNearTarget)(near);
    },
  );

  // When near: hide immediately. When far: wait SHOW_AFTER_AWAY_MS, then show.
  // The cleanup clears the pending timer if the user scrolls back into range.
  useEffect(() => {
    if (isNearTarget) {
      setShouldShow(false);
      return;
    }
    const t = setTimeout(() => setShouldShow(true), SHOW_AFTER_AWAY_MS);
    return () => clearTimeout(t);
  }, [isNearTarget]);

  // Drive the visibility shared value from the React state above.
  useEffect(() => {
    visibility.value = reduced
      ? (shouldShow ? 1 : 0)
      : withTiming(shouldShow ? 1 : 0, { duration: FADE_MS });
  }, [shouldShow, reduced, visibility]);

  const arrowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
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
          bottom: 24,
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
      pointerEvents={shouldShow ? 'auto' : 'none'}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Scroll to next incomplete step"
      accessibilityHint="Jumps to the next task that isn't finished yet"
      accessibilityElementsHidden={!shouldShow}
      importantForAccessibility={shouldShow ? 'auto' : 'no-hide-descendants'}
    >
      <Text
        style={{ color: colors.textInverse, fontFamily: 'Onest_500Medium', fontSize: 14 }}
      >
        What's next?
      </Text>
      <Animated.View style={arrowAnimStyle}>
        <ArrowDown size={14} color={colors.textInverse} strokeWidth={2} />
      </Animated.View>
    </AnimatedPressable>
  );
}
