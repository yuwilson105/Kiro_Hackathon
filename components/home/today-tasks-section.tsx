import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/home/task-card';
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
          <View className="mt-4">
            <Button
              label="Get started"
              variant="primary"
              size="md"
              onPress={onSetUpPlan}
            />
          </View>
        </View>
      )}
    </View>
  );
}
