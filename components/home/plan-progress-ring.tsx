/**
 * PlanProgressRing — native (iOS / Android)
 * Renders a circular progress arc via Skia Canvas, with an RN Text label overlay.
 */

import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, ease, spring } from '@/lib/motion';
import { colors, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Module-scope Skia paint objects — created once, reused across renders
// ---------------------------------------------------------------------------

const trackPaint = Skia.Paint();
trackPaint.setColor(Skia.Color(colors.borderSubtle));
trackPaint.setStyle(1 /* Stroke */);
trackPaint.setStrokeCap(1 /* Round */);
trackPaint.setAntiAlias(true);

const arcPaint = Skia.Paint();
arcPaint.setColor(Skia.Color(colors.primary));
arcPaint.setStyle(1 /* Stroke */);
arcPaint.setStrokeCap(1 /* Round */);
arcPaint.setAntiAlias(true);

// ---------------------------------------------------------------------------

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

  // Mount: animate 0 → initial progress
  useEffect(() => {
    if (reduced) {
      animatedProgress.value = progress;
    } else {
      animatedProgress.value = withSpring(progress, spring.gentle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prop change: animate to new progress value
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

  // Update paint stroke widths (safe at render time — Skia reads on draw)
  trackPaint.setStrokeWidth(strokeWidth);
  arcPaint.setStrokeWidth(strokeWidth);

  // Capture scalar values for use inside worklets
  const halfSize = size / 2;
  const radius = (size - strokeWidth) / 2;
  const sw = strokeWidth;

  // Track path — full circle; rebuilt only when size/strokeWidth change
  const trackPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addCircle(halfSize, halfSize, radius);
    return p;
  });

  // Arc path — recomputed in worklet when animatedProgress changes
  const arcPath = useDerivedValue(() => {
    const sweep = animatedProgress.value * 360;
    const p = Skia.Path.Make();
    // Start at 12 o'clock (-90°), sweep clockwise
    p.addArc(
      { x: sw / 2, y: sw / 2, width: halfSize * 2 - sw, height: halfSize * 2 - sw },
      -90,
      sweep
    );
    return p;
  });

  const fontSize = Math.round(size * 0.28);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      <Canvas style={{ width: size, height: size }}>
        <Path path={trackPath} paint={trackPaint} />
        <Path path={arcPath} paint={arcPaint} />
      </Canvas>

      {label ? (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={styles.labelWrap}>
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
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  labelWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
