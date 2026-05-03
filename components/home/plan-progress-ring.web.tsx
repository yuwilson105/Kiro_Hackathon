/**
 * PlanProgressRing — web fallback
 * Uses react-native-svg <Circle> with stroke-dasharray to render the arc.
 * Animates via Reanimated on a derived shared value.
 */

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';
import { duration, ease, spring } from '@/lib/motion';
import { colors, type } from '@/lib/theme';

// Animated wrapper for react-native-svg Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type PlanProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  label?: string;
};

export function PlanProgressRing({
  size = 56,
  strokeWidth = 6,
  progress,
  label,
}: PlanProgressRingProps) {
  const reduced = useReducedMotion();
  const animatedProgress = useSharedValue(0);

  // Mount: 0 → initial progress
  useEffect(() => {
    if (reduced) {
      animatedProgress.value = progress;
    } else {
      animatedProgress.value = withSpring(progress, spring.gentle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prop change: animate to new value
  useEffect(() => {
    if (reduced) {
      animatedProgress.value = progress;
    } else {
      animatedProgress.value = withTiming(progress, {
        duration: duration.long,
        easing: ease.out,
      });
    }
  }, [progress, reduced, animatedProgress]);

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  // Rotate origin so arc starts at 12 o'clock
  const cx = size / 2;
  const cy = size / 2;

  // Derive dashoffset from animated progress on the UI thread
  const dashOffset = useDerivedValue(
    () => circumference * (1 - animatedProgress.value)
  );

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const fontSize = Math.round(size * 0.28);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      {/* SVG ring */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground arc — rotated so 0° is at 12 o'clock */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={arcProps}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      {/* Optional center label */}
      {label ? (
        <View style={styles.labelWrap} pointerEvents="none">
          <Text
            style={[
              styles.label,
              {
                fontSize,
                fontFamily: type.fontFamily.semibold,
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
