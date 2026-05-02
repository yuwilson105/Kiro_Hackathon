import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

import { StepCard } from '@/components/plan/step-card';
import { enter, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { computeStepStatus } from '@/lib/plan-generator';
import type { Plan, PlanStep, PlanWeek } from '@/types/plan';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type WeekState = 'past' | 'current' | 'future';

type Props = {
  week: PlanWeek;
  weekState: WeekState;
  plan: Plan;
  completedSteps: Record<string, string>;
  inProgressSteps: Record<string, true>;
  weekIndex: number;
};

function getPrereqTitle(step: PlanStep, plan: Plan): string | undefined {
  if (!step.prerequisites.length) return undefined;
  const firstPrereqId = step.prerequisites[0];
  for (const w of plan.weeks) {
    const found = w.steps.find((s) => s.id === firstPrereqId);
    if (found) return found.title;
  }
  return undefined;
}

export function WeekSection({
  week,
  weekState,
  plan,
  completedSteps,
  inProgressSteps,
  weekIndex,
}: Props) {
  const reduced = useReducedMotion();

  const doneCount = week.steps.filter((s) => s.id in completedSteps).length;
  const totalCount = week.steps.length;
  const allDone = doneCount === totalCount;

  // Past weeks collapsed, current expanded, future collapsed.
  const [expanded, setExpanded] = useState(weekState === 'current');

  if (totalCount === 0) return null;

  function toggle() {
    if (weekState === 'future') return;
    if (!reduced) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(260, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
      );
    }
    setExpanded((v) => !v);
  }

  const weekLabel = `Week ${week.index + 1}`;
  const isFuture = weekState === 'future';

  const entering = reduced
    ? enter.fade(stagger(weekIndex, 60))
    : enter.fadeUp(stagger(weekIndex, 60));

  return (
    <Animated.View entering={entering} className="mb-4">
      {/* Section header */}
      <Pressable
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${weekLabel}, ${doneCount} of ${totalCount} done`}
        accessibilityState={{ expanded, disabled: isFuture }}
        className="flex-row items-center justify-between mb-3"
      >
        <Text
          className={`text-base font-medium ${isFuture ? 'text-text-subtle' : 'text-text'}`}
        >
          {weekLabel}
        </Text>

        <View className="flex-row items-center gap-2">
          {isFuture ? (
            <Text className="text-xs font-sans text-text-subtle">
              Unlocks after Week {week.index}
            </Text>
          ) : allDone ? (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: `${colors.success}26`,
              }}
              className="items-center justify-center"
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <Check size={13} color={colors.success} strokeWidth={2.5} />
            </View>
          ) : (
            <Text className="text-sm font-sans text-text-muted">
              {doneCount} of {totalCount} done
            </Text>
          )}
        </View>
      </Pressable>

      {/* Steps */}
      {expanded && !isFuture && (
        <View className="gap-3">
          {week.steps.map((step, i) => {
            const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
            const cappedI = Math.min(i, 8);
            const stepEntering = reduced
              ? enter.fade(stagger(cappedI, 40))
              : enter.fadeUp(stagger(cappedI, 40));
            const prereqTitle = getPrereqTitle(step, plan);

            return (
              <Animated.View key={step.id} entering={stepEntering}>
                <StepCard step={step} status={status} prereqTitle={prereqTitle} />
              </Animated.View>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
}
