import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { eachDayOfInterval, format, subDays } from 'date-fns';

import { colors } from '@/lib/theme';
import type { Mood, MoodEntry } from '@/types/check-in';

// 35-cell grid: 5 rows × 7 cols, oldest → newest, left-to-right, top-to-bottom
const COLS = 7;
const TOTAL = COLS * 5;

const MOOD_META: Record<Mood, { bg: string; label: string }> = {
  good:         { bg: colors.success,      label: 'Good' },
  okay:         { bg: colors.accentSoft,   label: 'Okay' },
  struggling:   { bg: '#EFC5C5',           label: 'Struggling' },
  'need-talk':  { bg: colors.primarySoft,  label: 'Needed to talk' },
};

type Props = {
  moodHistory: MoodEntry[];
};

export function MoodCalendar({ moodHistory }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const today = new Date();
  const start = subDays(today, TOTAL - 1);

  const days = eachDayOfInterval({ start, end: today });
  // Pad to exactly TOTAL cells — days should already equal TOTAL
  const cells = days.slice(-TOTAL);

  const moodMap = new Map<string, Mood>();
  for (const entry of moodHistory) {
    moodMap.set(entry.date, entry.mood);
  }

  const todayStr = format(today, 'yyyy-MM-dd');

  const handleCellPress = useCallback((dateStr: string, mood: Mood | undefined) => {
    if (!mood) return;
    const label = format(new Date(dateStr + 'T12:00:00'), 'MMM d');
    setTooltip(`${label}: ${MOOD_META[mood].label.toLowerCase()}`);
    setTimeout(() => setTooltip(null), 2000);
  }, []);

  return (
    <View>
      {/* Grid */}
      <View className="flex-row flex-wrap gap-1">
        {cells.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const mood = moodMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const bgColor = mood ? MOOD_META[mood].bg : colors.borderSubtle;
          const a11yDate = format(day, 'MMMM d');
          const a11yLabel = mood
            ? `${a11yDate}, mood: ${MOOD_META[mood].label.toLowerCase()}`
            : `${a11yDate}, no check-in`;

          return (
            <Pressable
              key={dateStr}
              onPress={() => handleCellPress(dateStr, mood)}
              accessibilityLabel={a11yLabel}
              accessibilityRole="button"
              hitSlop={2}
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
                }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Tooltip */}
      {tooltip ? (
        <View className="mt-3 px-3 py-2 bg-surface rounded-xl self-start">
          <Text className="font-medium text-sm text-text">{tooltip}</Text>
        </View>
      ) : null}

      {/* Legend */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4">
        {(Object.entries(MOOD_META) as [Mood, { bg: string; label: string }][]).map(([mood, meta]) => (
          <View key={mood} className="flex-row items-center gap-1.5">
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: meta.bg }} />
            <Text className="font-sans text-xs text-text-muted">{meta.label}</Text>
          </View>
        ))}
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.borderSubtle, borderWidth: 1, borderColor: colors.border }} />
          <Text className="font-sans text-xs text-text-muted">No check-in</Text>
        </View>
      </View>
    </View>
  );
}
