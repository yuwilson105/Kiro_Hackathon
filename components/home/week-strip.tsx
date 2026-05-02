import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import {
  addDays,
  format,
  isAfter,
  isToday,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { duration, ease, enter, spring } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Mood, MoodEntry } from '@/types/check-in';

type Props = {
  completedSteps: Record<string, string>;
};

const MOOD_LABEL: Record<Mood, string> = {
  good: 'good',
  okay: 'okay',
  struggling: 'struggling',
  'need-talk': 'needed to talk',
};

const MOOD_DOT: Record<Mood, string> = {
  good: colors.success,
  okay: colors.accent,
  struggling: colors.danger,
  'need-talk': colors.primary,
};

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'] as const;
const numberWord = (n: number) => (n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n));

const RULE_WIDTH = 28;
const TABULAR: { fontVariant: 'tabular-nums'[] } = { fontVariant: ['tabular-nums'] };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const todayDateStr = () => format(new Date(), 'yyyy-MM-dd');

type DayMeta = {
  date: Date;
  dateStr: string;
  letter: string;
  numeral: string;
  isToday: boolean;
  isFuture: boolean;
  stepCount: number;
  mood?: Mood;
  note?: string;
};

function buildWeek(
  completedSteps: Record<string, string>,
  moodHistory: MoodEntry[],
): DayMeta[] {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const today = startOfDay(now);

  const counts = new Map<string, number>();
  for (const iso of Object.values(completedSteps)) {
    const key = iso.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const moodByDate = new Map<string, MoodEntry>();
  for (const m of moodHistory) moodByDate.set(m.date, m);

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const moodEntry = moodByDate.get(dateStr);
    return {
      date,
      dateStr,
      letter: format(date, 'EEEEE'),
      numeral: format(date, 'd'),
      isToday: isToday(date),
      isFuture: isAfter(startOfDay(date), today),
      stepCount: counts.get(dateStr) ?? 0,
      mood: moodEntry?.mood,
      note: moodEntry?.note,
    };
  });
}

export function WeekStrip({ completedSteps }: Props) {
  const reduced = useReducedMotion();
  const moodHistory = useStore((s) => s.moodHistory);

  const week = useMemo(
    () => buildWeek(completedSteps, moodHistory),
    [completedSteps, moodHistory],
  );

  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const selectedIndex = week.findIndex((d) => d.dateStr === selectedDate);
  const selected = selectedIndex >= 0 ? week[selectedIndex] : week[week.length - 1];

  const cellCenters = useRef<number[]>([]);
  const ruleX = useSharedValue<number | null>(null);

  const settleRule = (targetX: number, animated: boolean) => {
    if (ruleX.value === null) {
      ruleX.value = targetX;
      return;
    }
    if (!animated || reduced) {
      ruleX.value = withTiming(targetX, { duration: duration.short, easing: ease.out });
    } else {
      ruleX.value = withSpring(targetX, spring.snap);
    }
  };

  const captureCellLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const center = x + width / 2;
    cellCenters.current[i] = center;
    if (i === selectedIndex && ruleX.value === null) {
      ruleX.value = center - RULE_WIDTH / 2;
    }
  };

  // Animate rule when selection changes (after first layout)
  useEffect(() => {
    const cx = cellCenters.current[selectedIndex];
    if (cx === undefined) return;
    settleRule(cx - RULE_WIDTH / 2, true);
    // intentional: settleRule reads refs/sv directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ruleX.value ?? 0 }],
    opacity: ruleX.value === null ? 0 : 1,
  }));

  const handleSelect = (d: DayMeta) => {
    if (d.isFuture || d.dateStr === selectedDate) return;
    haptics.select();
    setSelectedDate(d.dateStr);
  };

  // Detail copy
  const headlineWeekday = format(selected.date, 'EEEE');
  const headlineMonthDay = format(selected.date, 'MMM d');

  let openingLine: string;
  if (selected.isToday) openingLine = 'Today is yours.';
  else if (selected.stepCount > 0) openingLine = 'You showed up.';
  else if (selected.mood) openingLine = 'You checked in.';
  else openingLine = 'A quiet day.';

  const detailParts: string[] = [];
  if (selected.stepCount > 0) {
    const word = numberWord(selected.stepCount);
    const noun = selected.stepCount === 1 ? 'step' : 'steps';
    const suffix = selected.isToday ? ' so far' : '';
    detailParts.push(`${word} ${noun}${suffix}`);
  }
  if (selected.mood) {
    detailParts.push(MOOD_LABEL[selected.mood]);
  }
  const detailLine = detailParts.join(' · ');

  const ruleColor = selected.isToday ? colors.primaryDeep : colors.primary;

  return (
    <Animated.View entering={enter.fade(560)}>
      {/* Strip row */}
      <View className="flex-row gap-2">
        {week.map((d, i) => (
          <DayCell
            key={d.dateStr}
            day={d}
            isSelected={d.dateStr === selectedDate}
            onLayout={captureCellLayout(i)}
            onPress={() => handleSelect(d)}
            reduced={reduced}
          />
        ))}
      </View>

      {/* Hairline + animated selection bar */}
      <View className="mt-3 h-[2px]">
        <View
          className="absolute left-0 right-0 top-[1px] h-px"
          style={{ backgroundColor: colors.borderSubtle }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              height: 2,
              width: RULE_WIDTH,
              backgroundColor: ruleColor,
              borderRadius: 1,
            },
            ruleStyle,
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>

      {/* Detail panel */}
      <Animated.View
        key={selectedDate}
        entering={enter.fade(80)}
        className="mt-4 gap-1"
      >
        <View className="flex-row items-baseline justify-between">
          <Text className="text-base font-semibold text-text">
            {selected.isToday ? 'Today' : headlineWeekday}
          </Text>
          <Text
            className="text-2xs uppercase tracking-wider text-text-subtle"
            style={TABULAR}
          >
            {headlineMonthDay}
          </Text>
        </View>

        <Text className="text-sm text-text-muted">{openingLine}</Text>

        {detailLine ? (
          <Text className="text-sm text-text-muted">{detailLine}</Text>
        ) : null}

        {selected.note ? (
          <Text className="text-sm font-medium italic text-text mt-1">
            {`“${selected.note}”`}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

type DayCellProps = {
  day: DayMeta;
  isSelected: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: () => void;
  reduced: boolean;
};

function DayCell({ day, isSelected, onLayout, onPress, reduced }: DayCellProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: opacity.value }
      : { transform: [{ scale: scale.value }] },
  );

  const handlePressIn = () => {
    if (day.isFuture) return;
    haptics.tap();
    if (reduced) opacity.value = withSpring(0.7, spring.press);
    else scale.value = withSpring(0.94, spring.press);
  };

  const handlePressOut = () => {
    if (reduced) opacity.value = withSpring(1, spring.press);
    else scale.value = withSpring(1, spring.press);
  };

  const letterClass = day.isToday
    ? 'text-primary-deep'
    : day.isFuture
      ? 'text-text-subtle'
      : isSelected
        ? 'text-text'
        : 'text-text-muted';

  const numeralClass = day.isToday
    ? 'text-text font-semibold'
    : day.isFuture
      ? 'text-text-subtle font-sans'
      : day.stepCount > 0 || day.mood
        ? 'text-text font-medium'
        : 'text-text-muted font-sans';

  let glyph: React.ReactNode;
  if (day.isFuture) {
    glyph = (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderSubtle,
        }}
      />
    );
  } else if (day.mood) {
    glyph = (
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: MOOD_DOT[day.mood],
        }}
      />
    );
  } else if (day.stepCount > 0) {
    glyph = (
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.success,
        }}
      />
    );
  } else {
    glyph = (
      <Text className="text-text-subtle text-2xs leading-none">
        {'–'}
      </Text>
    );
  }

  const moodLabel = day.mood ? `, ${MOOD_LABEL[day.mood]}` : '';
  const stepLabel =
    day.stepCount > 0
      ? `, ${day.stepCount} ${day.stepCount === 1 ? 'step' : 'steps'}`
      : '';
  const a11y = `${format(day.date, 'EEEE, MMMM d')}${day.isToday ? ', today' : ''}${
    day.isFuture ? ', upcoming' : ''
  }${stepLabel}${moodLabel}`;

  return (
    <AnimatedPressable
      onLayout={onLayout}
      onPress={day.isFuture ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={day.isFuture}
      hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
      style={[
        { flex: 1, opacity: day.isFuture ? 0.38 : 1 },
        animStyle,
      ]}
      accessible
      accessibilityLabel={a11y}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: day.isFuture }}
    >
      <View className="items-center py-1 gap-0.5">
        <Text className={`text-sm font-medium ${letterClass}`}>{day.letter}</Text>
        <Text
          className={`text-2xs ${numeralClass}`}
          style={TABULAR}
        >
          {day.numeral}
        </Text>
        <View className="h-2 items-center justify-center mt-0.5">
          {glyph}
        </View>
      </View>
    </AnimatedPressable>
  );
}
