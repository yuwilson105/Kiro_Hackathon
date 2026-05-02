import { Linking, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import * as haptics from '@/lib/haptics';
import { enter, spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { StepStatus, StepUrgency } from '@/types/plan';

type Props = {
  id: string;
  title: string;
  description: string;
  urgency: StepUrgency;
  status: StepStatus;
  resourceAddress?: string;
  enterDelay: number;
  onMarkDone: (id: string) => void;
  onPress: () => void;
};

const EYEBROW: Record<StepUrgency, string> = {
  morning: 'MORNING',
  'this-week': 'THIS WEEK',
  'this-month': 'THIS MONTH',
  urgent: 'URGENT',
};

const EYEBROW_COLOR: Record<StepUrgency, string> = {
  morning: 'text-accent',
  'this-week': 'text-primary-deep',
  'this-month': 'text-text-muted',
  urgent: 'text-warning',
};

const DOT_BG: Record<StepStatus, string | null> = {
  complete: colors.success,
  'in-progress': colors.accent,
  pending: null,
  locked: null,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({
  id, title, description, urgency, status,
  resourceAddress, enterDelay, onMarkDone, onPress,
}: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: opacity.value }
      : { transform: [{ scale: scale.value }] },
  );

  const handlePressIn = () => {
    haptics.tap();
    if (reduced) opacity.value = withSpring(0.75, spring.press);
    else scale.value = withSpring(0.96, spring.press);
  };

  const handlePressOut = () => {
    if (reduced) opacity.value = withSpring(1, spring.press);
    else scale.value = withSpring(1, spring.press);
  };

  const isComplete = status === 'complete';
  const dotBg = DOT_BG[status];

  return (
    <Animated.View entering={reduced ? enter.fade(enterDelay) : enter.fadeUp(enterDelay)}>
      <AnimatedPressable
        style={animStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityLabel={`Task: ${title}, ${description}, ${status.replace('-', ' ')}`}
        accessibilityRole="button"
      >
        <View
          className="bg-bg border border-border rounded-2xl px-4 py-4 gap-1"
          style={[
            isComplete && { borderLeftWidth: 4, borderLeftColor: colors.success, opacity: 0.7 },
          ]}
        >
          <Text className={`text-2xs font-medium uppercase tracking-wider ${EYEBROW_COLOR[urgency]}`}>
            {EYEBROW[urgency]}
          </Text>
          <Text className="text-base font-medium text-text" numberOfLines={2}>{title}</Text>
          <Text className="text-sm font-sans text-text-muted leading-5" numberOfLines={2}>
            {description}
          </Text>

          {resourceAddress ? (
            <Pressable
              className="flex-row items-center gap-1.5 mt-1"
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              onPress={() => Linking.openURL(`maps:?q=${encodeURIComponent(resourceAddress)}`)}
              accessibilityRole="link"
              accessibilityLabel={`Open map for ${resourceAddress}`}
            >
              <MapPin size={14} strokeWidth={2} color={colors.primaryDeep} />
              <Text className="text-sm font-medium text-primary-deep flex-1" numberOfLines={1}>
                {resourceAddress}
              </Text>
            </Pressable>
          ) : null}

          <View className="flex-row items-center justify-between mt-2">
            <View
              className={dotBg ? 'w-4 h-4 rounded-full' : 'w-4 h-4 rounded-full border-2 border-border'}
              style={dotBg ? { backgroundColor: dotBg } : undefined}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            {!isComplete ? (
              <Button
                label="Mark done"
                variant="outline"
                size="sm"
                accessibilityLabel={`Mark ${title} as done`}
                onPress={() => { haptics.success(); onMarkDone(id); }}
              />
            ) : null}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
