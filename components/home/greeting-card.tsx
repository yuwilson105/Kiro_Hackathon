import { getHours } from 'date-fns';
import { View, Text } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { StreakBadge } from '@/components/home/streak-badge';
import { enter } from '@/lib/motion';

type Props = {
  firstName: string;
  streakCurrent: number;
  todayTaskCount: number;
  hasMilestoneToday: boolean;
};

function getGreeting(): string {
  const hour = getHours(new Date());
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getSubline(
  streakCurrent: number,
  todayTaskCount: number,
  hasMilestoneToday: boolean,
): string {
  if (hasMilestoneToday) return 'Today is a big one.';
  if (streakCurrent === 0) return "Today's the first day.";
  if (todayTaskCount === 0) return 'Nothing pressing today.';
  return `You've got ${todayTaskCount} ${todayTaskCount === 1 ? 'thing' : 'things'} today.`;
}

export function GreetingCard({
  firstName,
  streakCurrent,
  todayTaskCount,
  hasMilestoneToday,
}: Props) {
  const reduced = useReducedMotion();
  const greeting = getGreeting();
  const subline = getSubline(streakCurrent, todayTaskCount, hasMilestoneToday);

  return (
    <Animated.View
      entering={reduced ? enter.fade(0) : enter.fadeUp(0)}
    >
      <View className="bg-surface border border-border-surface rounded-2xl px-5 py-5 flex-row items-start justify-between">
        <View className="flex-1 pr-4 gap-1">
          <Text className="text-2xl font-medium text-text" numberOfLines={1}>
            {greeting}, {firstName}.
          </Text>
          <Text className="text-sm font-sans text-text leading-5">{subline}</Text>
        </View>
        <StreakBadge streak={streakCurrent} />
      </View>
    </Animated.View>
  );
}
