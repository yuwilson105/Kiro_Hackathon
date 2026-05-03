import { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';

export type SliderStatus = 'pending' | 'in-progress' | 'complete';

const SEGMENTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'complete', label: 'Done' },
] as const;

// Index-aligned with SEGMENTS
const PILL_BG = ['#FFFFFF', '#FFE9D6', '#88B17A'];
const PILL_LABEL_ACTIVE = ['#1A1D21', '#B5601A', '#FFFFFF'];

type Props = {
  value: SliderStatus;
  onChange: (next: SliderStatus) => void;
  stepTitle: string;
};

export function StepStatusSlider({ value, onChange, stepTitle }: Props) {
  const [width, setWidth] = useState(0);
  const valueIdx = Math.max(
    0,
    SEGMENTS.findIndex((s) => s.value === value),
  );

  const progress = useDerivedValue(
    () =>
      withSpring(valueIdx, {
        damping: 22,
        stiffness: 260,
        mass: 0.9,
      }),
    [valueIdx],
  );

  const segmentWidth = width > 6 ? (width - 6) / SEGMENTS.length : 0;

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 3 + progress.value * segmentWidth }],
    width: segmentWidth > 0 ? segmentWidth : 0,
    backgroundColor: interpolateColor(progress.value, [0, 1, 2], PILL_BG),
  }));

  const handlePress = (next: SliderStatus, nextIdx: number) => {
    if (next === value) return;
    if (next === 'complete') haptics.success();
    else if (nextIdx < valueIdx) haptics.tap();
    else haptics.select();
    onChange(next);
  };

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="adjustable"
      accessibilityLabel={`${stepTitle} status`}
      accessibilityValue={{ text: SEGMENTS[valueIdx].label }}
      style={{
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F4F6F8',
        borderWidth: 1,
        borderColor: '#E6E8EB',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 3,
              bottom: 3,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOpacity: 0.07,
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 2,
              elevation: 2,
            },
            pillStyle,
          ]}
        />
      )}

      {SEGMENTS.map((seg, i) => {
        const isActive = value === seg.value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => handlePress(seg.value, i)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={seg.label}
            accessibilityState={{ selected: isActive }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontFamily: 'Onest_500Medium',
                fontSize: 13,
                color: isActive ? PILL_LABEL_ACTIVE[i] : '#6B7177',
                letterSpacing: -0.1,
              }}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
