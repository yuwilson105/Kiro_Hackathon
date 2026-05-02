import { startOfWeek, addDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { View, Text } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { enter } from '@/lib/motion';
import { colors } from '@/lib/theme';

type DayStatus = 'complete' | 'active' | 'empty';

type Props = {
  completedSteps: Record<string, string>;
};

function getDayStatus(date: Date, completedSteps: Record<string, string>): DayStatus {
  const dateStr = format(date, 'yyyy-MM-dd');
  const hasCompletion = Object.values(completedSteps).some(
    (completedAt) => completedAt.slice(0, 10) === dateStr,
  );
  if (hasCompletion) return 'complete';
  if (isBefore(startOfDay(date), startOfDay(new Date())) && !isToday(date)) return 'empty';
  return 'active';
}

const DOT_COLORS: Record<DayStatus, string> = {
  complete: colors.success,
  active: colors.warning,
  empty: colors.textSubtle,
};

export function WeekStrip({ completedSteps }: Props) {
  const reduced = useReducedMotion();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      label: format(date, 'EEEEE'), // Single letter M T W T F S S
      date,
      status: getDayStatus(date, completedSteps),
      isToday: isToday(date),
    };
  });

  return (
    <Animated.View
      entering={reduced ? enter.fade(560) : enter.fade(560)}
    >
      <View className="flex-row gap-2 justify-between">
        {days.map((day, i) => (
          <View
            key={i}
            className={
              day.isToday
                ? 'h-10 w-10 rounded-xl bg-surface border border-primary-soft items-center justify-center gap-0.5'
                : 'h-10 w-10 rounded-xl items-center justify-center gap-0.5'
            }
            accessible={true}
            accessibilityLabel={`${format(day.date, 'EEEE')}${day.isToday ? ', today' : ''}, ${day.status}`}
          >
            <Text
              className={`text-sm font-medium ${day.isToday ? 'text-text' : 'text-text-muted'}`}
            >
              {day.label}
            </Text>
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: DOT_COLORS[day.status] }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
