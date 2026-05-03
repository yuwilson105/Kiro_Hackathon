import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfettiSkia } from '@/components/animations/confetti-skia';
import { FlameLogo } from '@/components/animations/flame-logo';
import { Button } from '@/components/ui/button';
import { enter, stagger } from '@/lib/motion';
import { PLAN_GRAPH } from '@/lib/mock/plan-graph';
import { useStore } from '@/lib/store';
import type { PlanStep } from '@/types/plan';

// ─── Milestone title map ──────────────────────────────────────────────────────
function getMilestoneTitle(step: PlanStep | null): string {
  if (!step) return 'You did it.';
  const id = step.id;
  if (id === 'get-state-id') return 'You got your ID.';
  if (id === 'open-bank-account') return 'You opened a bank account.';
  if (id.includes('apply-first-jobs') || id === 'first-job') return 'You started applying for jobs.';
  if (id.includes('find-stable-housing') || id === 'find-housing') return 'You found stable housing.';
  if (id === 'reconnect-family' || id === 'reach-out-to-family') return 'You reconnected with family.';
  return 'You did it.';
}

// ─── Companion note map ───────────────────────────────────────────────────────
function getMilestoneNote(step: PlanStep | null): string {
  if (!step) return "That took guts. Most people don't even get this far.";
  const id = step.id;
  if (id === 'get-state-id')
    return "That was one of the hardest first steps. Everything that comes next gets a little easier because of this.";
  if (id === 'open-bank-account')
    return "That account is yours now. Direct deposit, automatic savings, building credit. None of it was possible without this step.";
  if (id.includes('find-stable-housing') || id === 'find-housing')
    return "Stable ground. Everything else gets easier from here.";
  if (id.includes('apply-first-jobs') || id === 'first-job')
    return "An income changes the math on everything else. Take the first paycheck for yourself. You earned it.";
  if (id === 'reconnect-family' || id === 'reach-out-to-family')
    return "That took courage. Whatever happens next, you opened the door.";
  return "That took guts. Most people don't even get this far.";
}

// ─── Look up a step by id across all weeks ───────────────────────────────────
function findStep(stepId: string): PlanStep | null {
  return PLAN_GRAPH.find((s) => s.id === stepId) ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MilestoneScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const unlockedMilestoneId = useStore((s) => s.unlockedMilestoneId);
  const plan = useStore((s) => s.plan);
  const setMilestoneUnlocked = useStore((s) => s.setMilestoneUnlocked);

  // Auto-dismiss guard: if there's no id, dismiss after 200ms
  useEffect(() => {
    if (!unlockedMilestoneId) {
      const t = setTimeout(() => router.back(), 200);
      return () => clearTimeout(t);
    }
  }, [unlockedMilestoneId, router]);

  const step = unlockedMilestoneId ? findStep(unlockedMilestoneId) : null;
  const title = getMilestoneTitle(step);
  const note = getMilestoneNote(step);

  // Collect unlocked next-step titles
  const unlockedIds = step?.unlocks ?? [];
  const unlockedTitles: string[] = unlockedIds.map((id) => {
    // First check in-plan steps (personalised)
    if (plan) {
      for (const week of plan.weeks) {
        const found = week.steps.find((s) => s.id === id);
        if (found) return found.title;
      }
    }
    // Fall back to PLAN_GRAPH
    return PLAN_GRAPH.find((s) => s.id === id)?.title ?? id;
  });

  const handleKeepGoing = () => {
    setMilestoneUnlocked(null);
    router.back();
  };

  // ─── Reduced motion: single fade on the whole block ─────────────────────────
  if (reduced) {
    return (
      <View
        className="flex-1 bg-surface"
        accessibilityRole="summary"
        accessibilityLabel={title}
      >
        <ConfettiSkia width={width} height={height} />
        <Animated.View
          entering={enter.fade(0)}
          className="flex-1 items-center justify-center px-8"
          style={{ paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }}
        >
          <FlameLogo size={140} loop={false} />
          <View className="mt-8">
            <Text className="text-3xl font-semibold text-text text-center leading-9">{title}</Text>
          </View>
          <View className="mt-4">
            <Text className="text-base text-text-muted text-center leading-6" style={{ maxWidth: width * 0.8 }}>
              {note}
            </Text>
          </View>
          {unlockedTitles.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted text-center mb-3">
                This unlocks:
              </Text>
              {unlockedTitles.map((t, i) => (
                <View key={i} className="flex-row items-center gap-2 mb-1 justify-center">
                  <Text className="text-text-muted text-sm">·</Text>
                  <Text className="text-sm text-text">{t}</Text>
                </View>
              ))}
            </View>
          )}
          <View className="mt-8 w-full">
            <Button
              label="Keep going"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleKeepGoing}
              accessibilityLabel="Continue back to your plan"
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ─── Full animated path ───────────────────────────────────────────────────
  return (
    <View
      className="flex-1 bg-surface"
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      {/* Confetti overlay — full screen, pointer events none */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, width, height, zIndex: 0 }}
        pointerEvents="none"
      >
        <ConfettiSkia width={width} height={height} />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        scrollEnabled={false}
        style={{ zIndex: 1 }}
      >
        {/* Flame bloom — delayed 200ms per milestone choreography */}
        <Animated.View entering={enter.zoom(200)}>
          <FlameLogo size={140} loop={false} />
        </Animated.View>

        {/* 32pt gap */}
        <View className="h-8" />

        {/* Milestone title */}
        <Animated.View entering={enter.fadeUp(600)}>
          <Text className="text-3xl font-semibold text-text text-center leading-9">
            {title}
          </Text>
        </Animated.View>

        {/* 16pt gap */}
        <View className="h-4" />

        {/* Companion note */}
        <Animated.View entering={enter.fadeUp(900)}>
          <Text
            className="text-base text-text-muted text-center leading-6"
            style={{ maxWidth: width * 0.8 }}
          >
            {note}
          </Text>
        </Animated.View>

        {/* 24pt gap */}
        <View className="h-6" />

        {/* Unlocks section */}
        {unlockedTitles.length > 0 && (
          <View className="w-full items-center">
            <Animated.View entering={enter.fadeUp(1200)}>
              <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted text-center mb-3">
                This unlocks:
              </Text>
            </Animated.View>
            {unlockedTitles.map((t, i) => {
              const cappedIdx = Math.min(i, 8);
              return (
                <Animated.View
                  key={i}
                  entering={enter.fadeUp(stagger(cappedIdx, 60) + 1200)}
                  className="flex-row items-center gap-2 mb-1"
                >
                  <Text className="text-text-muted text-sm">·</Text>
                  <Text className="text-sm text-text">{t}</Text>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* 32pt gap */}
        <View className="h-8" />

        {/* Keep going CTA */}
        <Animated.View entering={enter.fadeUp(1500)} className="w-full">
          <Button
            label="Keep going"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleKeepGoing}
            accessibilityLabel="Continue back to your plan"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
