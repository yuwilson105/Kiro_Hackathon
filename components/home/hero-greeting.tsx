import { format, getHours } from 'date-fns';
import { type ReactElement } from 'react';
import { View, Text } from 'react-native';

import { StreakBadge } from '@/components/home/streak-badge';

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
  if (todayTaskCount > 0)
    return `${todayTaskCount} ${todayTaskCount === 1 ? 'thing' : 'things'} today.`;
  return 'Nothing pressing today.';
}

export function HeroGreeting({
  firstName,
  streakCurrent,
  todayTaskCount,
  hasMilestoneToday,
}: Props): ReactElement {
  const now = new Date();
  const greeting = getGreeting();
  const subline = getSubline(streakCurrent, todayTaskCount, hasMilestoneToday);

  const weekday = format(now, 'EEEE');
  const monthDay = format(now, 'MMM d');
  const dayLabel = streakCurrent === 0 ? 'Day 1' : `Day ${streakCurrent}`;

  const a11yLabel = `Greeting: ${greeting}, ${firstName}. ${subline} Date: ${weekday}, ${monthDay}. Streak: ${streakCurrent} days.`;

  return (
    <View className="bg-surface border border-border-surface rounded-3xl flex-row items-center justify-between" style={{ padding: 22 }}>
      {/* LEFT column - centered vertically within the card height */}
      <View
        accessible
        accessibilityLabel={a11yLabel}
        className="flex-1 justify-center"
        style={{ paddingRight: 16, gap: 10 }}
      >
        {/* Top group */}
        <View className="gap-1">
          <Text className="text-2xl font-medium text-text" numberOfLines={1}>
            {greeting}, {firstName}.
          </Text>
          <Text className="text-sm font-sans text-text leading-5">{subline}</Text>
        </View>

        {/* Date / day strip - sits right under, no big gap */}
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Text
            className="text-xs font-medium uppercase text-text-muted"
            style={{ letterSpacing: 1 }}
          >
            {weekday}
          </Text>
          <Text className="text-xs font-medium text-text-muted" style={{ letterSpacing: 1 }}>
            ·
          </Text>
          <Text
            className="text-xs font-medium uppercase text-text-muted"
            style={{ letterSpacing: 1 }}
          >
            {monthDay}
          </Text>
          <Text className="text-xs font-medium text-text-muted" style={{ letterSpacing: 1 }}>
            ·
          </Text>
          <Text
            className="text-xs font-medium uppercase text-text-muted"
            style={{ letterSpacing: 1 }}
          >
            {dayLabel}
          </Text>
        </View>
      </View>

      {/* RIGHT side - defines the card height */}
      <StreakBadge streak={streakCurrent} />
    </View>
  );
}
