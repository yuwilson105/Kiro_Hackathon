import { ArrowRight, Sparkles } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { TaskCard } from '@/components/home/task-card';
import { SectionHeader } from '@/components/ui/section-header';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { PlanStep, StepStatus } from '@/types/plan';

type TaskItem = PlanStep & { enterDelay: number; status: StepStatus };

type Props = {
  tasks: TaskItem[];
  hasPlan: boolean;
  onMarkDone: (id: string) => void;
  onTaskPress: (id: string) => void;
  onSetUpPlan?: () => void;
};

export function TodayTasksSection({
  tasks,
  hasPlan,
  onMarkDone,
  onTaskPress,
  onSetUpPlan,
}: Props) {
  return (
    <View className="gap-3">
      <SectionHeader eyebrow="TODAY" />

      {hasPlan && tasks.length > 0 ? (
        <View className="gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              urgency={task.urgency}
              status={task.status}
              resourceAddress={task.resourceAddress}
              enterDelay={task.enterDelay}
              onMarkDone={onMarkDone}
              onPress={() => onTaskPress(task.id)}
            />
          ))}
        </View>
      ) : hasPlan && tasks.length === 0 ? (
        <View
          className="bg-surface border border-border-surface rounded-2xl items-center"
          style={{ padding: 18 }}
          accessible={true}
          accessibilityLabel="You're done for today. Tomorrow's plan is already waiting."
        >
          <Sparkles size={22} strokeWidth={2} color={colors.success} />
          <Text className="text-base font-medium text-text mt-2">
            You're done for today.
          </Text>
          <Text className="text-sm font-sans text-text-muted leading-5 mt-1 text-center">
            Tomorrow's plan is already waiting.
          </Text>
        </View>
      ) : (
        <View
          className="bg-surface border border-border-surface rounded-2xl"
          style={{ padding: 18 }}
          accessible={true}
          accessibilityLabel="Let's set up your plan. Tell us a bit about you and we'll build a plan you can follow day by day."
        >
          <Text className="text-base font-medium text-text">
            Let's set up your plan.
          </Text>
          <Text className="text-sm font-sans text-text-muted leading-5 mt-2">
            Tell us a bit about you and we'll build a plan you can follow day by day.
          </Text>
          <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
            <BuildPlanCta onPress={onSetUpPlan} />
          </View>
        </View>
      )}
    </View>
  );
}

// ── BuildPlanCta - pill with leading sparkle + trailing arrow ───────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BuildPlanCta({ onPress }: { onPress?: () => void }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const arrowX = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ scale: scale.value }] },
  );
  const arrowStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ translateX: arrowX.value }] },
  );

  const handlePressIn = useCallback(() => {
    haptics.tap();
    if (!reduced) {
      scale.value = withSpring(0.96, spring.press);
      arrowX.value = withSpring(3, spring.press);
    }
  }, [reduced, scale, arrowX]);

  const handlePressOut = useCallback(() => {
    if (!reduced) {
      scale.value = withSpring(1, spring.press);
      arrowX.value = withSpring(0, spring.press);
    }
  }, [reduced, scale, arrowX]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Build my plan"
      style={[
        containerStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          height: 44,
          paddingLeft: 16,
          paddingRight: 18,
          gap: 10,
          borderRadius: 999,
          backgroundColor: colors.primaryDeep,
        },
      ]}
    >
      <Sparkles size={16} color="#FFFFFF" strokeWidth={2} />
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'Onest_500Medium',
          color: '#FFFFFF',
          letterSpacing: 0.2,
        }}
      >
        Build my plan
      </Text>
      <Animated.View style={arrowStyle}>
        <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.25} />
      </Animated.View>
    </AnimatedPressable>
  );
}
