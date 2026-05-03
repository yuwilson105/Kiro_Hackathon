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
import { Check, ChevronRight } from 'lucide-react-native';

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

/** Returns the title of the first non-complete step in the week, or undefined. */
function getFirstPendingTitle(
  week: PlanWeek,
  completedSteps: Record<string, string>,
  inProgressSteps: Record<string, true>,
): string | undefined {
  // Prefer in-progress first, then pending (not locked).
  for (const step of week.steps) {
    if (step.id in inProgressSteps) return step.title;
  }
  for (const step of week.steps) {
    if (!(step.id in completedSteps)) return step.title;
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
  const isPast = weekState === 'past';
  const isCurrent = weekState === 'current';

  const entering = reduced
    ? enter.fade(stagger(weekIndex, 60))
    : enter.fadeUp(stagger(weekIndex, 60));

  // State-specific design tokens
  const barColor = isCurrent
    ? colors.accent
    : isPast
      ? colors.success
      : colors.borderSubtle;

  const firstPendingTitle = isCurrent
    ? getFirstPendingTitle(week, completedSteps, inProgressSteps)
    : undefined;

  // --- PAST STATE ---
  if (isPast) {
    return (
      <Animated.View entering={entering} className="mb-4">
        <Pressable
          onPress={toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${weekLabel}, all ${totalCount} steps done`}
          accessibilityState={{ expanded }}
        >
          <View className="flex-row items-center" style={{ gap: 14 }}>
            {/* Left accent bar — sage, solid, earned */}
            <View
              style={{
                width: 3,
                height: 38,
                borderRadius: 2,
                backgroundColor: barColor,
              }}
            />

            {/* Content */}
            <View className="flex-1 flex-row items-center justify-between">
              <View style={{ gap: 1 }}>
                <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                  {weekLabel}
                </Text>
                <Text className="text-sm font-medium text-text-muted">
                  {totalCount} steps complete
                </Text>
              </View>

              {/* Check badge */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: `${colors.success}22`,
                }}
                className="items-center justify-center"
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                <Check size={13} color={colors.success} strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </Pressable>

        {/* Steps (toggleable on past weeks) */}
        {expanded && (
          <View className="gap-3 mt-4">
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

  // --- CURRENT STATE ---
  if (isCurrent) {
    return (
      <Animated.View entering={entering} className="mb-5">
        <Pressable
          onPress={toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${weekLabel}, ${doneCount} of ${totalCount} done`}
          accessibilityState={{ expanded }}
        >
          <View className="flex-row items-stretch" style={{ gap: 14 }}>
            {/* Left accent bar — peach, taller to match content */}
            <View
              style={{
                width: 3,
                borderRadius: 2,
                backgroundColor: barColor,
                alignSelf: 'stretch',
                minHeight: 52,
              }}
            />

            {/* Content block */}
            <View className="flex-1" style={{ gap: 6 }}>
              {/* Top row: eyebrow + chevron */}
              <View className="flex-row items-center justify-between">
                <Text className="text-2xs font-medium uppercase tracking-wider text-accent">
                  {weekLabel} · now
                </Text>
                <ChevronRight
                  size={14}
                  color={colors.textMuted}
                  strokeWidth={2}
                  style={{
                    transform: [{ rotate: expanded ? '90deg' : '0deg' }],
                  }}
                />
              </View>

              {/* Progress line */}
              <View className="flex-row items-center" style={{ gap: 8 }}>
                {/* Bar track */}
                <View
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: colors.borderSubtle,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${(doneCount / totalCount) * 100}%`,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
                <Text className="text-xs font-sans text-text-muted">
                  {doneCount} of {totalCount}
                </Text>
              </View>

              {/* Up-next preview */}
              {!!firstPendingTitle && (
                <Text
                  className="text-sm font-sans text-text-muted leading-5"
                  numberOfLines={1}
                >
                  Up next: {firstPendingTitle}
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        {/* Steps */}
        {expanded && (
          <View className="gap-3 mt-4">
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

  // --- FUTURE STATE ---
  // Non-interactive, anticipatory, not dead.
  const weeksAway = week.index + 1; // 1-based display; "starts at week N" phrasing
  const prevWeekLabel = `Week ${week.index}`;

  return (
    <Animated.View entering={entering} className="mb-4">
      <View
        className="flex-row items-center"
        style={{ gap: 14 }}
        accessibilityElementsHidden={false}
        accessible
        accessibilityLabel={`${weekLabel}, ${totalCount} steps, opens after ${prevWeekLabel}`}
        importantForAccessibility="no-hide-descendants"
      >
        {/* Left bar — borderSubtle, dashed feel via alternating opacity not actual dash */}
        <View style={{ gap: 4, width: 3, justifyContent: 'center' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 3,
                height: 5,
                borderRadius: 1.5,
                backgroundColor: colors.borderSubtle,
                opacity: 1 - i * 0.14,
              }}
            />
          ))}
        </View>

        {/* Content */}
        <View className="flex-1 flex-row items-center justify-between" style={{ opacity: 0.55 }}>
          <View style={{ gap: 2 }}>
            <Text className="text-2xs font-medium uppercase tracking-wider text-text-subtle">
              {weekLabel}
            </Text>
            <Text className="text-sm font-sans text-text-muted">
              {totalCount} steps · after {prevWeekLabel}
            </Text>
          </View>

          {/* Step count dot cluster — gives a visual sense of scope without being a list */}
          <View className="flex-row items-center" style={{ gap: 3 }}>
            {Array.from({ length: Math.min(totalCount, 5) }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.borderSubtle,
                }}
              />
            ))}
            {totalCount > 5 && (
              <Text className="text-2xs font-sans text-text-subtle" style={{ marginLeft: 2 }}>
                +{totalCount - 5}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
