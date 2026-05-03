import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Brain,
  Dumbbell,
  Flower2,
  Gavel,
  Globe,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Music2,
  Scale,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import * as haptics from '@/lib/haptics';
import { duration, ease, enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

type Props = { onContinue: (data: { interests: string[] }) => void };

type Interest = {
  id: string;
  label: string;
  Icon: LucideIcon;
};

const INTERESTS: readonly Interest[] = [
  { id: 'civil-rights', label: 'Civil rights', Icon: HeartHandshake },
  { id: 'tech', label: 'Tech & apps', Icon: Smartphone },
  { id: 'politics', label: 'Politics & law', Icon: Scale },
  { id: 'finance', label: 'Money & finance', Icon: Wallet },
  { id: 'social', label: 'Social media', Icon: MessageCircle },
  { id: 'music', label: 'Music & entertainment', Icon: Music2 },
  { id: 'mental-health', label: 'Mental health', Icon: Brain },
  { id: 'justice', label: 'Justice reform', Icon: Gavel },
  { id: 'immigration', label: 'Immigration', Icon: Globe },
  { id: 'climate', label: 'Climate', Icon: Leaf },
  { id: 'sports', label: 'Sports', Icon: Dumbbell },
] as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PillProps = {
  interest: Interest;
  selected: boolean;
  onToggle: () => void;
  index: number;
  reduceMotion: boolean;
};

function InterestPill({ interest, selected, onToggle, index, reduceMotion }: PillProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(selected ? 1 : 0);

  // Drive the cross-fade when `selected` changes from the parent.
  if (selected && progress.value !== 1) {
    progress.value = reduceMotion
      ? 1
      : withTiming(1, { duration: 180, easing: ease.snap });
  } else if (!selected && progress.value !== 0) {
    progress.value = reduceMotion
      ? 0
      : withTiming(0, { duration: 180, easing: ease.snap });
  }

  const containerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 1],
      [colors.bg, colors.surfaceDeep],
    );
    const border = interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.primary],
    );
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 1 + 0.5 * progress.value,
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.text, colors.primaryDeep],
    ),
  }));

  const iconColor = selected ? colors.primaryDeep : colors.text;
  const Icon = interest.Icon;

  const handlePress = () => {
    haptics.select();
    if (!reduceMotion) {
      scale.value = withSpring(1.06, spring.bouncy, () => {
        scale.value = withSpring(1, spring.bouncy);
      });
    }
    onToggle();
  };

  return (
    <Animated.View
      entering={reduceMotion ? enter.fade(stagger(index, 30)) : enter.fadeUp(stagger(index, 30))}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`${interest.label} interest`}
        accessibilityState={{ selected }}
        onPress={handlePress}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        style={[
          containerStyle,
          { borderRadius: 999 },
        ]}
        className="flex-row items-center gap-2 px-4 py-2.5"
      >
        <Icon size={14} color={iconColor} strokeWidth={2} />
        <Animated.Text style={textStyle} className="font-medium text-sm">
          {interest.label}
        </Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

type CounterProps = { count: number; reduceMotion: boolean };

function LiveCounter({ count, reduceMotion }: CounterProps) {
  const opacity = useSharedValue(count > 0 ? 1 : 0);
  const target = count > 0 ? 1 : 0;

  if (opacity.value !== target) {
    opacity.value = reduceMotion
      ? target
      : withTiming(target, { duration: duration.short, easing: ease.out });
  }

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={style} className="text-xs font-medium text-primary-deep">
      {count > 0 ? `${count} picked` : ''}
    </Animated.Text>
  );
}

type ContinueProps = {
  enabled: boolean;
  onPress: () => void;
  reduceMotion: boolean;
};

function ContinueButton({ enabled, onPress, reduceMotion }: ContinueProps) {
  const pop = useSharedValue(1);

  // Bouncy pop the moment validation flips from false → true.
  if (enabled && pop.value === 1) {
    if (!reduceMotion) {
      pop.value = withSpring(1.04, spring.bouncy, () => {
        pop.value = withSpring(1, spring.bouncy);
      });
    }
  }

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Animated.View style={style}>
      <Button
        label="Continue"
        variant={enabled ? 'primary' : 'outline'}
        disabled={!enabled}
        fullWidth
        onPress={() => {
          if (!enabled) return;
          haptics.success();
          onPress();
        }}
      />
    </Animated.View>
  );
}

export function StepInterests({ onContinue }: Props) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = selected.size;
  const canContinue = count >= 1;

  const orderedSelection = useMemo(
    () => INTERESTS.filter((i) => selected.has(i.id)).map((i) => i.id),
    [selected],
  );

  return (
    <View className="flex-1 bg-bg px-6 pt-6 pb-8">
      <Animated.View entering={reduceMotion ? enter.fade(0) : enter.fadeUp(0)}>
        <Text
          className="font-semibold"
          style={{ color: colors.text, fontSize: 28, lineHeight: 34 }}
        >
          What do you want to catch up on?
        </Text>
        <Text
          className="mt-2 text-sm"
          style={{ color: colors.textMuted, lineHeight: 20 }}
        >
          Pick what you&apos;re curious about. We&apos;ll bring you up to speed on those first.
        </Text>
      </Animated.View>

      <View className="mt-7 flex-row items-baseline justify-between">
        <Animated.Text
          entering={reduceMotion ? enter.fade(80) : enter.fadeUp(80)}
          className="text-xs"
          style={{ color: colors.textSubtle }}
        >
          Pick a few. There&apos;s no wrong answer.
        </Animated.Text>
        <LiveCounter count={count} reduceMotion={reduceMotion} />
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {INTERESTS.map((interest, i) => (
          <InterestPill
            key={interest.id}
            interest={interest}
            selected={selected.has(interest.id)}
            onToggle={() => toggle(interest.id)}
            index={i}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>

      <View className="mt-auto pt-8">
        <ContinueButton
          enabled={canContinue}
          reduceMotion={reduceMotion}
          onPress={() => onContinue({ interests: orderedSelection })}
        />
      </View>
    </View>
  );
}
