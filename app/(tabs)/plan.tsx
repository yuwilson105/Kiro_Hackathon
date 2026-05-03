import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useReducedMotion,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingNextButton } from '@/components/plan/floating-next-button';
import { WeekSection } from '@/components/plan/week-section';
import { enter } from '@/lib/motion';
import { computeStepStatus } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import type { PlanWeek } from '@/types/plan';

type WeekState = 'past' | 'current' | 'future';

function classifyWeek(
  week: PlanWeek,
  completedSteps: Record<string, string>,
  inProgressSteps: Record<string, true>,
): WeekState {
  const allDone = week.steps.every((s) => s.id in completedSteps);
  if (allDone && week.steps.length > 0) return 'past';
  const hasIncomplete = week.steps.some((s) => !(s.id in completedSteps));
  const hasLocked = week.steps.every(
    (s) =>
      !(s.id in completedSteps) &&
      !(s.id in inProgressSteps) &&
      s.prerequisites.some((p) => !(p in completedSteps)),
  );
  if (hasIncomplete && !hasLocked) return 'current';
  // First week with any non-locked step = current
  const hasAccessible = week.steps.some(
    (s) =>
      s.id in completedSteps ||
      s.id in inProgressSteps ||
      s.prerequisites.every((p) => p in completedSteps),
  );
  return hasAccessible ? 'current' : 'future';
}

function findCurrentWeekIndex(
  weeks: PlanWeek[],
  completedSteps: Record<string, string>,
  inProgressSteps: Record<string, true>,
): number {
  for (let i = 0; i < weeks.length; i++) {
    const state = classifyWeek(weeks[i], completedSteps, inProgressSteps);
    if (state === 'current') return i;
  }
  return 0;
}

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const plan = useStore((s) => s.plan);
  const completedSteps = useStore((s) => s.completedSteps);
  const inProgressSteps = useStore((s) => s.inProgressSteps);

  const scrollRef = useRef<Animated.ScrollView>(null);
  // refs to each week section for scroll targeting
  const weekOffsets = useRef<number[]>([]);

  // Live scroll position + the Y offset of the next pending step,
  // both shared values so the floating button can animate its arrow
  // direction on the UI thread without re-rendering this screen.
  const scrollY = useSharedValue(0);
  const nextStepY = useSharedValue<number | null>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const computeNextStepY = useCallback((): number | null => {
    if (!plan) return null;
    for (let wi = 0; wi < plan.weeks.length; wi++) {
      const week = plan.weeks[wi];
      for (const step of week.steps) {
        const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
        if (status === 'pending' || status === 'in-progress') {
          const offset = weekOffsets.current[wi];
          return offset ?? null;
        }
      }
    }
    return null;
  }, [plan, completedSteps, inProgressSteps]);

  // Recompute when plan/state changes; layout-driven recompute lives in onLayout below.
  useEffect(() => {
    nextStepY.value = computeNextStepY();
  }, [computeNextStepY, nextStepY]);

  const handleScrollToNext = useCallback(() => {
    const target = computeNextStepY();
    if (target === null) return;
    scrollRef.current?.scrollTo({ y: target, animated: !reduced });
  }, [computeNextStepY, reduced]);

  // Empty / loading state.
  if (!plan || plan.weeks.length === 0) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1 bg-bg items-center justify-center px-8"
      >
        <Text className="text-base font-medium text-text text-center">
          Your plan is being built.
        </Text>
        <Text className="text-sm font-sans text-text-muted text-center mt-2 leading-5">
          Check back in a moment.
        </Text>
      </View>
    );
  }

  const headerEntering = reduced ? enter.fade(0) : enter.fadeUp(0);

  const currentIdx = plan
    ? findCurrentWeekIndex(plan.weeks, completedSteps, inProgressSteps)
    : 0;

  return (
    <View className="flex-1 bg-bg">
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page header */}
        <Animated.View entering={headerEntering} className="mb-6">
          <Text className="text-3xl font-medium text-text">Your roadmap</Text>
          <Text className="text-sm font-sans text-text-muted mt-1">
            Each step unlocks the next one.
          </Text>
        </Animated.View>

        {/* Week sections — full-width now that the timeline rail is gone */}
        <View>
          {plan.weeks.map((week, i) => {
            if (week.steps.length === 0) return null;
            const resolvedState: WeekState =
              i < currentIdx ? 'past' : i === currentIdx ? 'current' : 'future';

            return (
              <View
                key={week.index}
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  // Track Y for FloatingNextButton scroll targeting. y is relative
                  // to the inner container, so add the ScrollView header offset.
                  weekOffsets.current[i] = y + (insets.top + 16);
                  nextStepY.value = computeNextStepY();
                }}
              >
                <WeekSection
                  week={week}
                  weekState={resolvedState}
                  plan={plan}
                  completedSteps={completedSteps}
                  inProgressSteps={inProgressSteps}
                  weekIndex={i}
                />
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>

      {/* Floating next button */}
      <FloatingNextButton
        scrollY={scrollY}
        nextStepY={nextStepY}
        onPress={handleScrollToNext}
      />
    </View>
  );
}
