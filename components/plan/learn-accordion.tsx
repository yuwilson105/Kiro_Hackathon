import { useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';

import { duration } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { LearnCard } from '@/types/plan';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  learnCard: LearnCard;
};

export function LearnAccordion({ learnCard }: Props) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const chevronRotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  function toggle() {
    if (!reduced) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          duration.short,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
    }
    const nextOpen = !open;
    setOpen(nextOpen);
    chevronRotation.value = withTiming(nextOpen ? 180 : 0, {
      duration: duration.short,
    });
  }

  return (
    <View className="mt-3 rounded-xl border border-border-subtle bg-surface overflow-hidden">
      <Pressable
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Before you go — here's what you need to know"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <Text className="flex-1 text-sm font-medium text-text">
          Before you go — here's what you need to know
        </Text>
        <Animated.View style={chevronStyle} accessibilityElementsHidden importantForAccessibility="no">
          <ChevronDown size={16} color={colors.textMuted} strokeWidth={2} />
        </Animated.View>
      </Pressable>

      {open && (
        <View className="px-4 pb-4 gap-0">
          {learnCard.sections.map((section, i) => (
            <View key={i} className="mt-3">
              <Text className="text-sm font-medium text-text">{section.heading}</Text>
              <Text className="text-sm font-sans text-text-muted leading-5 mt-1">
                {section.body}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
