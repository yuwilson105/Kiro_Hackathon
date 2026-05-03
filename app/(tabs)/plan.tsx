import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { FloatingNextButton } from '@/components/plan/floating-next-button';
import { PlanRail } from '@/components/plan/plan-rail';
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

  // Rail: measured Y offsets per week within the weeks container.
  // Stored as state so the rail re-renders when layouts settle.
  const [railOffsets, setRailOffsets] = useState<number[]>([]);
  // Total height of the weeks container so the rail tail reaches the bottom.
  const [weeksContentHeight, setWeeksContentHeight] = useState(0);

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
        {__DEV__ && (
          <Pressable
            onPress={() => router.push('/dev' as never)}
            className="mb-8 px-4 py-2 rounded-pill border border-border bg-bg"
            accessibilityRole="button"
            accessibilityLabel="Open developer menu"
          >
            <Text className="text-xs font-medium text-text-muted tracking-wider uppercase">
              ⚙ Dev menu
            </Text>
          </Pressable>
        )}
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

  // Build rail nodes from measured offsets
  const visibleWeeks = plan.weeks.filter((w) => w.steps.length > 0);
  const railNodes = visibleWeeks.map((week, i) => {
    const resolvedState: WeekState =
      i < currentIdx ? 'past' : i === currentIdx ? 'current' : 'future';
    return {
      state: resolvedState,
      offsetY: railOffsets[i] ?? 0,
    };
  });

  // Left padding to give the rail + nodes room (node is 10px, add 8px gap)
  const RAIL_LEFT_OFFSET = 18; // px from ScrollView left edge to rail centre
  const WEEKS_PADDING_LEFT = RAIL_LEFT_OFFSET + 10 + 8; // 36px total

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

        {/* Weeks container — relative so the rail can be absolutely positioned */}
        <View
          style={{ position: 'relative', paddingLeft: WEEKS_PADDING_LEFT }}
          onLayout={(e) => setWeeksContentHeight(e.nativeEvent.layout.height)}
        >
          {/* Timeline rail — rendered behind week content */}
          <PlanRail
            nodes={railNodes}
            contentHeight={weeksContentHeight}
          />

          {/* Week sections */}
          {plan.weeks.map((week, i) => {
            if (week.steps.length === 0) return null;
            const resolvedState: WeekState =
              i < currentIdx ? 'past' : i === currentIdx ? 'current' : 'future';

            // Track visual index (excluding empty weeks) for rail offset mapping
            const visibleIdx = visibleWeeks.findIndex((w) => w.index === week.index);

            return (
              <View
                key={week.index}
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  // Store in weekOffsets for FloatingNextButton scroll targeting.
                  // weekOffsets is relative to the inner padded container, so add
                  // ScrollView header offset when scrolling.
                  weekOffsets.current[i] = y + (insets.top + 16);
                  nextStepY.value = computeNextStepY();

                  // Store midpoint Y of this week's header row for the rail node.
                  // Use the top edge + a small offset to align with the week label row.
                  setRailOffsets((prev) => {
                    const next = [...prev];
                    next[visibleIdx] = y + 12; // ~centre of the week header text
                    return next;
                  });
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
