import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';

import { HeroGreeting } from '@/components/home/hero-greeting';
import { MoodQuickCheck } from '@/components/home/mood-quick-check';
import { NearbyResource } from '@/components/home/nearby-resource';
import { QuickAccessGrid } from '@/components/home/quick-access-grid';
import { TodayTasksSection } from '@/components/home/today-tasks-section';
import { TodaysDiscovery } from '@/components/home/todays-discovery';
import { WeekStrip } from '@/components/home/week-strip';
import { ScreenContainer } from '@/components/layout/screen-container';
import { useCheckinSheet } from '@/components/sheets/checkin-sheet';
import { enter } from '@/lib/motion';
import { computeStepStatus } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { PlanStep, StepStatus } from '@/types/plan';

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

type TaskItem = PlanStep & { enterDelay: number; status: StepStatus };

const TASK_DELAYS = [200, 280, 360] as const;

export default function HomeScreen() {
  const router = useRouter();

  const { profile, streak, plan, completedSteps, inProgressSteps, lastCheckinShownDate } =
    useStore(
      useShallow((s) => ({
        profile: s.profile,
        streak: s.streak,
        plan: s.plan,
        completedSteps: s.completedSteps,
        inProgressSteps: s.inProgressSteps,
        lastCheckinShownDate: s.lastCheckinShownDate,
      })),
    );

  const completeStep = useStore((s) => s.completeStep);
  const markCheckinShown = useStore((s) => s.markCheckinShown);
  const resetOnboarding = useStore((s) => s.resetOnboarding);
  const checkinSheet = useCheckinSheet();
  const reduced = useReducedMotion();

  // Today's tasks (in-progress first, then pending, max 3)
  const taskItems: TaskItem[] = useMemo(() => {
    if (!plan) return [];
    const allSteps = plan.weeks.flatMap((w) => w.steps);
    const inProgress: { step: PlanStep; status: StepStatus }[] = [];
    const pending: { step: PlanStep; status: StepStatus }[] = [];
    for (const step of allSteps) {
      const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
      if (status === 'in-progress') inProgress.push({ step, status });
      else if (status === 'pending') pending.push({ step, status });
    }
    return [...inProgress, ...pending]
      .slice(0, 3)
      .map(({ step, status }, i) => ({ ...step, status, enterDelay: TASK_DELAYS[i] ?? 360 }));
  }, [plan, completedSteps, inProgressSteps]);

  const hasMilestoneToday = useMemo(() => {
    if (!plan) return false;
    return plan.weeks
      .flatMap((w) => w.steps)
      .some((step) => {
        const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
        return step.isMilestone && (status === 'pending' || status === 'in-progress');
      });
  }, [plan, completedSteps, inProgressSteps]);

  const handleMarkDone = (id: string) => completeStep(id);
  const handleTaskPress = () => router.push('/(tabs)/plan' as never);
  const handleSetUpPlan = () => router.push('/(onboarding)/dates' as never);

  return (
    <ScreenContainer scroll contentClassName="px-4 pt-4 pb-12 gap-5">
      {/* DEV-only reset button */}
      {__DEV__ && (
        <Pressable
          onPress={() => {
            resetOnboarding();
            router.replace('/');
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Reset application"
          style={{
            alignSelf: 'flex-end',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'Onest_500Medium' }}>
            ↺ Reset
          </Text>
        </Pressable>
      )}
      {/* 1. Hero greeting */}
      <Animated.View entering={reduced ? enter.fade(0) : enter.fadeUp(0)}>
        <HeroGreeting
          firstName={profile.firstName || 'there'}
          streakCurrent={streak.current}
          todayTaskCount={taskItems.length}
          hasMilestoneToday={hasMilestoneToday}
        />
      </Animated.View>

      {/* 2. Week strip — pills only, right under greeting */}
      <Animated.View entering={reduced ? enter.fade(80) : enter.fadeUp(80)} className="gap-3">
        <WeekStrip completedSteps={completedSteps} compact />
      </Animated.View>

      {/* 3. Today's tasks (or empty / no-plan state) */}
      <Animated.View entering={reduced ? enter.fade(220) : enter.fadeUp(220)}>
        <TodayTasksSection
          tasks={taskItems}
          hasPlan={plan != null && plan.weeks.length > 0}
          onMarkDone={handleMarkDone}
          onTaskPress={handleTaskPress}
          onSetUpPlan={handleSetUpPlan}
        />
      </Animated.View>

      {/* 4. Mood quick check */}
      <Animated.View entering={reduced ? enter.fade(480) : enter.fadeUp(480)}>
        <MoodQuickCheck />
      </Animated.View>

      {/* 6. Today's discovery (only renders if a candidate exists) */}
      <Animated.View entering={reduced ? enter.fade(600) : enter.fadeUp(600)}>
        <TodaysDiscovery />
      </Animated.View>

      {/* 7. Nearby resource (only renders if a candidate exists) */}
      <Animated.View entering={reduced ? enter.fade(680) : enter.fadeUp(680)}>
        <NearbyResource />
      </Animated.View>

      {/* 8. Quick access 2x2 grid */}
      <Animated.View entering={reduced ? enter.fade(780) : enter.fadeUp(780)}>
        <QuickAccessGrid
          onCatchUp={() => router.push('/(tabs)/catchup' as never)}
          onFindHelp={() => router.push('/(tabs)/help' as never)}
          onWellness={() => router.push('/wellness' as never)}
          onPlan={() => router.push('/(tabs)/plan' as never)}
        />
      </Animated.View>
    </ScreenContainer>
  );
}
