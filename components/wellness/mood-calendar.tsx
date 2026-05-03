import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isAfter,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme';
import type { Mood, MoodEntry } from '@/types/check-in';

const COLS = 7;

// Sunday-first row to match the date-fns weekStartsOn: 0 default
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MOOD_META: Record<Mood, { bg: string; label: string }> = {
  good: { bg: colors.success, label: 'Good' },
  okay: { bg: colors.accentSoft, label: 'Okay' },
  struggling: { bg: '#EFC5C5', label: 'Struggling' },
  'need-talk': { bg: colors.primarySoft, label: 'Needed to talk' },
};

const SWIPE_THRESHOLD = 50;

type Props = {
  moodHistory: MoodEntry[];
};

export function MoodCalendar({ moodHistory }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  // 0 = current calendar month; -1 = last month; +1 = future (capped to 0)
  const [monthOffset, setMonthOffset] = useState(0);

  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, 'yyyy-MM-dd');

  const viewedMonth = useMemo(
    () => startOfMonth(addMonths(today, monthOffset)),
    [today, monthOffset],
  );

  // Pad to full weeks so the grid edges are clean.
  const gridStart = startOfWeek(viewedMonth, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(viewedMonth), { weekStartsOn: 0 });
  const cells = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  const moodMap = useMemo(() => {
    const m = new Map<string, Mood>();
    for (const entry of moodHistory) m.set(entry.date, entry.mood);
    return m;
  }, [moodHistory]);

  const handleCellPress = useCallback(
    (dateStr: string, mood: Mood | undefined, isFuture: boolean) => {
      if (isFuture) return;
      const label = format(new Date(dateStr + 'T12:00:00'), 'MMM d');
      const text = mood
        ? `${label}: ${MOOD_META[mood].label.toLowerCase()}`
        : `${label}: no check-in`;
      setTooltip(text);
      setTimeout(() => setTooltip(null), 2000);
    },
    [],
  );

  const goPrev = useCallback(() => {
    setMonthOffset((prev) => prev - 1);
  }, []);

  const goNext = useCallback(() => {
    // Cap at 0 — can't navigate past the current month.
    setMonthOffset((prev) => Math.min(prev + 1, 0));
  }, []);

  // Swipe drag feedback.
  const translateX = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-15, 15])
        .onUpdate((e) => {
          'worklet';
          // Resist swiping forward when at current month — feels rubbery, signals the cap.
          translateX.value =
            monthOffset >= 0 && e.translationX < 0 ? e.translationX * 0.35 : e.translationX;
        })
        .onEnd((e) => {
          'worklet';
          if (e.translationX > SWIPE_THRESHOLD) {
            runOnJS(goPrev)();
          } else if (e.translationX < -SWIPE_THRESHOLD && monthOffset < 0) {
            runOnJS(goNext)();
          }
          translateX.value = withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
        }),
    [monthOffset, translateX, goPrev, goNext],
  );

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const monthLabel = format(viewedMonth, 'MMMM yyyy');
  const atCurrentMonth = monthOffset >= 0;

  return (
    <View>
      {/* Header row: chevron prev + month label + chevron next */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={goPrev}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={{ padding: 4 }}
        >
          <ChevronLeft size={18} color={colors.textMuted} strokeWidth={2} />
        </Pressable>

        <Text
          style={{
            fontFamily: 'Onest_500Medium',
            fontSize: 11,
            letterSpacing: 1.2,
            color: colors.textSubtle,
            textTransform: 'uppercase',
          }}
        >
          {monthLabel}
        </Text>

        <Pressable
          onPress={goNext}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityState={{ disabled: atCurrentMonth }}
          disabled={atCurrentMonth}
          style={{ padding: 4, opacity: atCurrentMonth ? 0.3 : 1 }}
        >
          <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className="flex-row mb-1">
        {WEEKDAY_LABELS.map((d, i) => (
          <View key={i} style={{ width: `${100 / COLS}%`, paddingHorizontal: 1 }}>
            <Text className="font-sans text-2xs uppercase tracking-wider text-text-subtle text-center">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Swipeable grid */}
      <GestureDetector gesture={pan}>
        <Animated.View style={dragStyle}>
          <Animated.View
            key={`grid-${monthOffset}`}
            entering={FadeIn.duration(220).easing(Easing.out(Easing.cubic))}
            className="flex-row flex-wrap gap-y-1"
          >
            {cells.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const mood = moodMap.get(dateStr);
              const isToday = dateStr === todayStr;
              const isFuture = isAfter(day, today);
              const inMonth = isSameMonth(day, viewedMonth);
              const dayNum = getDate(day);
              const bgColor = isFuture
                ? 'transparent'
                : !inMonth
                  ? 'transparent'
                  : mood
                    ? MOOD_META[mood].bg
                    : colors.borderSubtle;

              const a11yDate = format(day, 'MMMM d');
              const a11yLabel = isFuture
                ? `${a11yDate}, upcoming`
                : !inMonth
                  ? `${a11yDate}, outside this month`
                  : mood
                    ? `${a11yDate}, mood: ${MOOD_META[mood].label.toLowerCase()}`
                    : `${a11yDate}, no check-in`;

              return (
                <Pressable
                  key={dateStr}
                  onPress={() => handleCellPress(dateStr, mood, isFuture || !inMonth)}
                  accessibilityLabel={a11yLabel}
                  accessibilityRole="button"
                  hitSlop={2}
                  disabled={isFuture || !inMonth}
                  style={{
                    width: `${100 / COLS}%`,
                    aspectRatio: 1,
                    paddingHorizontal: 1,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 6,
                      backgroundColor: bgColor,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: isToday ? colors.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isFuture || !inMonth ? 0.3 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Onest_400Regular',
                        fontSize: 11,
                        color: mood ? colors.text : colors.textSubtle,
                        fontWeight: isToday ? '600' : '400',
                      }}
                    >
                      {dayNum}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Tooltip */}
      {tooltip ? (
        <View className="mt-3 px-3 py-2 bg-surface rounded-xl self-start">
          <Text className="font-medium text-sm text-text">{tooltip}</Text>
        </View>
      ) : null}

      {/* Legend */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4">
        {(Object.entries(MOOD_META) as [Mood, { bg: string; label: string }][]).map(
          ([mood, meta]) => (
            <View key={mood} className="flex-row items-center gap-1.5">
              <View
                style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: meta.bg }}
              />
              <Text className="font-sans text-xs text-text-muted">{meta.label}</Text>
            </View>
          ),
        )}
        <View className="flex-row items-center gap-1.5">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              backgroundColor: colors.borderSubtle,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <Text className="font-sans text-xs text-text-muted">No check-in</Text>
        </View>
      </View>
    </View>
  );
}
