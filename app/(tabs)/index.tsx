import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useShallow } from 'zustand/shallow';

import { ScreenContainer } from '@/components/layout/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { GreetingCard } from '@/components/home/greeting-card';
import { TaskCard } from '@/components/home/task-card';
import { WeekStrip } from '@/components/home/week-strip';
import { QuickAccessGrid } from '@/components/home/quick-access-grid';
import { useStore } from '@/lib/store';
import { computeStepStatus } from '@/lib/plan-generator';
import type { PlanStep } from '@/types/plan';
import { useCheckinSheet } from '@/components/sheets/checkin-sheet';

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

type TaskItem = PlanStep & { enterDelay: number };

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
  const checkinSheet = useCheckinSheet();

  // Check-in sheet trigger
  useEffect(() => {
    const today = todayISO();
    if (lastCheckinShownDate !== today) {
      const timer = setTimeout(() => {
        checkinSheet.present();
        markCheckinShown(today);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lastCheckinShownDate, markCheckinShown, checkinSheet]);

  // Collect visible steps: skip locked + complete for the "today" section
  const allSteps: PlanStep[] = plan
    ? plan.weeks.flatMap((w) => w.steps)
    : [];

  const TASK_DELAYS = [200, 280, 360] as const;

  const taskItems: TaskItem[] = (() => {
    if (!plan) return [];
    const inProgress: PlanStep[] = [];
    const pending: PlanStep[] = [];

    for (const step of allSteps) {
      const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
      if (status === 'in-progress') inProgress.push(step);
      else if (status === 'pending') pending.push(step);
    }

    const ordered = [...inProgress, ...pending].slice(0, 3);
    return ordered.map((step, i) => ({ ...step, enterDelay: TASK_DELAYS[i] ?? 360 }));
  })();

  const hasMilestoneToday =
    plan != null &&
    allSteps.some((step) => {
      const status = computeStepStatus(step.id, completedSteps, inProgressSteps, plan);
      return step.isMilestone && (status === 'pending' || status === 'in-progress');
    });

  const handleMarkDone = (id: string) => {
    completeStep(id);
  };

  const handleTaskPress = () => {
    router.push('/(tabs)/plan' as never);
  };

  return (
    <ScreenContainer scroll contentClassName="px-4 pt-4 pb-10 gap-6">

      {/* A. Greeting card */}
      <GreetingCard
        firstName={profile.firstName || 'there'}
        streakCurrent={streak.current}
        todayTaskCount={taskItems.length}
        hasMilestoneToday={hasMilestoneToday}
      />

      {/* B. Today section */}
      <View className="gap-3">
        <SectionHeader eyebrow="TODAY" />
        {taskItems.map((item) => {
          const status = computeStepStatus(item.id, completedSteps, inProgressSteps, plan!);
          return (
            <TaskCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              urgency={item.urgency}
              status={status}
              resourceAddress={item.resourceAddress}
              enterDelay={item.enterDelay}
              onMarkDone={handleMarkDone}
              onPress={handleTaskPress}
            />
          );
        })}
      </View>

      {/* C. This week section */}
      <View className="gap-3">
        <SectionHeader eyebrow="THIS WEEK" />
        <WeekStrip completedSteps={completedSteps} />
      </View>

      {/* D. Quick access grid */}
      <View className="gap-3">
        <QuickAccessGrid
          onCatchUp={() => router.push('/(tabs)/catchup' as never)}
          onFindHelp={() => router.push('/(tabs)/help' as never)}
          onWellness={() => router.push('/wellness' as never)}
        />
      </View>

    </ScreenContainer>
  );
}
