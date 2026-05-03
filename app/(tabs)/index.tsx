import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/shallow';

import { HeroGreeting } from '@/components/home/hero-greeting';
import { MoodQuickCheck } from '@/components/home/mood-quick-check';
import { NearbyResource } from '@/components/home/nearby-resource';
import { QuickAccessGrid } from '@/components/home/quick-access-grid';
import { TodayVideo } from '@/components/home/today-video';
import { TodaysDiscovery } from '@/components/home/todays-discovery';
import { WeekStrip } from '@/components/home/week-strip';
import { ScreenContainer } from '@/components/layout/screen-container';
import { enter } from '@/lib/motion';
import { computeStepStatus } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { PlanStep, StepStatus } from '@/types/plan';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { profile, streak, plan, completedSteps, inProgressSteps, resetOnboarding } =
    useStore(
      useShallow((s) => ({
        profile: s.profile,
        streak: s.streak,
        plan: s.plan,
        completedSteps: s.completedSteps,
        inProgressSteps: s.inProgressSteps,
        resetOnboarding: s.resetOnboarding,
      })),
    );

  const reduced = useReducedMotion();

  function handleReset() {
    Alert.alert(
      'Start over?',
      'This clears your profile, plan, and all progress. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/(onboarding)/name');
          },
        },
      ],
    );
  }

  // Today's task count is still surfaced in the greeting subline ("3 things today.")
  // but the full task list lives only in My Plan.
  const todayTaskCount = useMemo(() => {
    if (!plan) return 0;
    const allSteps: PlanStep[] = plan.weeks.flatMap((w) => w.steps);
    let count = 0;
    for (const step of allSteps) {
      const status: StepStatus = computeStepStatus(
        step.id,
        completedSteps,
        inProgressSteps,
        plan,
      );
      if (status === 'in-progress' || status === 'pending') count += 1;
      if (count >= 3) break;
    }
    return count;
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

  return (
    <ScreenContainer scroll contentClassName="px-4 pt-4 pb-12 gap-5">
      {/* Settings row */}
      <View
        style={{ paddingTop: insets.top > 0 ? 0 : 8 }}
        className="flex-row justify-end"
        accessibilityElementsHidden={false}
      >
        <Pressable
          onPress={handleReset}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Reset app"
          accessibilityHint="Clears all data and returns to onboarding"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Settings size={20} color={colors.textMuted} strokeWidth={1.75} />
        </Pressable>
      </View>
      {/* 1. Hero greeting */}
      <Animated.View entering={reduced ? enter.fade(0) : enter.fadeUp(0)}>
        <HeroGreeting
          firstName={(profile.firstName || '').trim().split(/\s+/)[0] || 'there'}
          streakCurrent={streak.current}
          todayTaskCount={todayTaskCount}
          hasMilestoneToday={hasMilestoneToday}
        />
      </Animated.View>

      {/* 2. Week strip - pills only, right under greeting */}
      <Animated.View entering={reduced ? enter.fade(80) : enter.fadeUp(80)} className="gap-3">
        <WeekStrip completedSteps={completedSteps} compact />
      </Animated.View>

      {/* 3. Mood quick check */}
      <Animated.View entering={reduced ? enter.fade(220) : enter.fadeUp(220)}>
        <MoodQuickCheck />
      </Animated.View>

      {/* 4. Quick access 2x2 grid - top priority navigation */}
      <Animated.View entering={reduced ? enter.fade(360) : enter.fadeUp(360)}>
        <QuickAccessGrid
          onCatchUp={() => router.push('/(tabs)/catchup' as never)}
          onFindHelp={() => router.push('/(tabs)/help' as never)}
          onWellness={() => router.push('/wellness' as never)}
          onPlan={() => router.push('/(tabs)/plan' as never)}
        />
      </Animated.View>

      {/* 5. Today's discovery — section with article, resource, video stacked */}
      <Animated.View entering={reduced ? enter.fade(500) : enter.fadeUp(500)} className="gap-3">
        {/* Full-width separator above the section */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginTop: 8,
            marginBottom: 4,
          }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text
          style={{
            fontFamily: 'HankenGrotesk_500Medium',
            fontWeight: '500',
            fontSize: 26,
            lineHeight: 30,
            letterSpacing: -0.5,
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Today's discovery
        </Text>
        <TodaysDiscovery />
        <NearbyResource />
        <TodayVideo />
      </Animated.View>
    </ScreenContainer>
  );
}
