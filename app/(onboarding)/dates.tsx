import { router } from 'expo-router';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import * as haptics from '@/lib/haptics';
import { enter, spring, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = CURRENT_YEAR; y >= 1990; y--) YEARS.push(y);

function todayMonthYear(): { month: number; year: number } {
  const d = new Date();
  return { month: d.getMonth(), year: d.getFullYear() };
}

function toISO(month: number, year: number): string {
  const mm = String(month + 1).padStart(2, '0');
  return `${year}-${mm}-01`;
}

function formatLabel(month: number, year: number): string {
  return `${MONTHS[month]} ${year}`;
}

// ── MonthYearPickerModal ──────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 800;

type PickerModalProps = {
  visible: boolean;
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  onClose: () => void;
};

function MonthYearPickerModal({
  visible,
  month,
  year,
  onChange,
  onClose,
}: PickerModalProps) {
  const insets = useSafeAreaInsets();
  const [localMonth, setLocalMonth] = useState(month);
  const [localYear, setLocalYear] = useState(year);

  const translateY = useSharedValue(0);

  const dismissGesture = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(
          600,
          { duration: 200 },
          (finished) => {
            if (finished) runOnJS(onClose)();
          },
        );
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 200, mass: 1 });
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleConfirm = () => {
    haptics.tap();
    onChange(localMonth, localYear);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, sheetAnimStyle, { paddingBottom: insets.bottom + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle — pan down to dismiss */}
          <GestureDetector gesture={dismissGesture}>
            <View style={styles.handleArea}>
              <View style={styles.handle} accessibilityElementsHidden importantForAccessibility="no" />
            </View>
          </GestureDetector>

          {/* Columns */}
          <View style={styles.columns}>
            {/* Month column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.columnScroll}
              >
                {MONTHS.map((name, i) => {
                  const selected = i === localMonth;
                  return (
                    <Pressable
                      key={name}
                      onPress={() => {
                        haptics.select();
                        setLocalMonth(i);
                      }}
                      style={[styles.row, selected && styles.rowSelected]}
                      accessibilityRole="button"
                      accessibilityLabel={name}
                      accessibilityState={{ selected }}
                      hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
                    >
                      <Text
                        style={[styles.rowText, selected && styles.rowTextSelected]}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      {selected && (
                        <ChevronRight
                          size={14}
                          color={colors.primaryDeep}
                          strokeWidth={2}
                          accessibilityElementsHidden
                          importantForAccessibility="no"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Divider */}
            <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no" />

            {/* Year column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.columnScroll}
              >
                {YEARS.map((y) => {
                  const selected = y === localYear;
                  return (
                    <Pressable
                      key={y}
                      onPress={() => {
                        haptics.select();
                        setLocalYear(y);
                      }}
                      style={[styles.row, selected && styles.rowSelected]}
                      accessibilityRole="button"
                      accessibilityLabel={String(y)}
                      accessibilityState={{ selected }}
                      hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
                    >
                      <Text
                        style={[styles.rowText, selected && styles.rowTextSelected]}
                      >
                        {y}
                      </Text>
                      {selected && (
                        <ChevronRight
                          size={14}
                          color={colors.primaryDeep}
                          strokeWidth={2}
                          accessibilityElementsHidden
                          importantForAccessibility="no"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Confirm */}
          <Pressable
            onPress={handleConfirm}
            style={styles.confirmBtn}
            accessibilityRole="button"
            accessibilityLabel={`Confirm ${MONTHS[localMonth]} ${localYear}`}
          >
            <Text style={styles.confirmLabel}>Set date</Text>
          </Pressable>
        </AnimatedPressable>
      </Pressable>
    </Modal>
  );
}

// ── DateCard ──────────────────────────────────────────────────────────────────

type DateCardProps = {
  eyebrow: string;
  month: number | null;
  year: number | null;
  onPress: () => void;
  entering: ReturnType<typeof enter.fadeUp>;
  accessLabel: string;
};

function DateCard({ eyebrow, month, year, onPress, entering, accessLabel }: DateCardProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    haptics.tap();
    if (!reduced) scale.value = withSpring(0.97, spring.press);
  };
  const onPressOut = () => {
    if (!reduced) scale.value = withSpring(1, spring.press);
  };

  const hasValue = month !== null && year !== null;

  return (
    <Animated.View entering={entering}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={accessLabel}
        accessibilityHint="Tap to open the month and year picker"
      >
        <Animated.View style={animStyle} className="bg-bg border border-border rounded-2xl px-5 py-4">
          <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-1">
            {eyebrow}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-base font-medium ${hasValue ? 'text-text' : 'text-text-subtle'}`}
            >
              {hasValue ? formatLabel(month!, year!) : 'Select month and year'}
            </Text>
            <ChevronDown
              size={16}
              color={hasValue ? colors.text : colors.textSubtle}
              strokeWidth={1.75}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ── Gap math ──────────────────────────────────────────────────────────────────

type Gap = { years: number; months: number; lessThanMonth: boolean };

function computeGap(
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): Gap {
  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
  if (totalMonths <= 0) return { years: 0, months: 0, lessThanMonth: true };
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, lessThanMonth: false };
}

function gapParts(g: Gap): { value: string; unit: string } {
  if (g.lessThanMonth) return { value: 'Under', unit: 'a month' };
  if (g.years === 0) {
    return { value: String(g.months), unit: g.months === 1 ? 'month' : 'months' };
  }
  if (g.months === 0) {
    return { value: String(g.years), unit: g.years === 1 ? 'year' : 'years' };
  }
  return {
    value: String(g.years),
    unit: `${g.years === 1 ? 'year' : 'years'}, ${g.months} ${g.months === 1 ? 'month' : 'months'}`,
  };
}

// ── GapCard ───────────────────────────────────────────────────────────────────

type GapCardProps = {
  entering: ReturnType<typeof enter.fadeUp>;
  startMonth: number | null;
  startYear: number | null;
  endMonth: number | null;
  endYear: number | null;
  startSet: boolean;
  endSet: boolean;
  isOrderWrong: boolean;
  reduced: boolean;
};

function GapCard({
  entering,
  startMonth,
  startYear,
  endMonth,
  endYear,
  startSet,
  endSet,
  isOrderWrong,
  reduced,
}: GapCardProps) {
  const filled = startSet && endSet && !isOrderWrong;
  const target = filled ? 1 : 0;

  const emptyStyle = useAnimatedStyle(() => ({
    opacity: 1 - withTiming(target, { duration: reduced ? 0 : 280 }),
  }));

  const filledStyle = useAnimatedStyle(() => ({
    opacity: withTiming(target, { duration: reduced ? 0 : 280 }),
    transform: [
      {
        translateY: withSpring(filled ? 0 : 6, { damping: 18, stiffness: 200 }),
      },
    ],
  }));

  const gap = filled
    ? computeGap(startMonth!, startYear!, endMonth!, endYear!)
    : null;
  const parts = gap ? gapParts(gap) : null;

  return (
    <Animated.View
      entering={entering}
      className="rounded-2xl border border-border-subtle px-5 py-5 mt-1 overflow-hidden"
      style={{ backgroundColor: '#FBFAF7' }}
    >
      <Animated.View
        style={filledStyle}
        pointerEvents={filled ? 'auto' : 'none'}
        accessibilityLiveRegion="polite"
        accessibilityLabel={parts ? `Your gap: ${parts.value} ${parts.unit}` : undefined}
      >
        <Text
          className="text-2xs font-medium uppercase tracking-wider mb-2"
          style={{ color: colors.textMuted }}
        >
          Your gap
        </Text>

        <View className="flex-row items-baseline gap-2">
          <Text
            className="font-medium tracking-tight"
            style={{
              color: colors.text,
              fontSize: 40,
              lineHeight: 44,
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
            }}
          >
            {parts?.value ?? '0'}
          </Text>
          <Text className="text-base font-medium" style={{ color: colors.text }}>
            {parts?.unit ?? 'months'}
          </Text>
        </View>

        <Text className="text-sm leading-5 mt-2" style={{ color: colors.textMuted }}>
          That's what we'll catch you up on.
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          emptyStyle,
          { position: 'absolute', left: 20, right: 20, top: 20, bottom: 20 },
        ]}
        pointerEvents={filled ? 'none' : 'auto'}
      >
        <Text
          className="text-2xs font-medium uppercase tracking-wider mb-2"
          style={{ color: colors.textMuted }}
        >
          Your gap
        </Text>
        <Text className="text-base leading-6" style={{ color: colors.textMuted }}>
          {startSet
            ? "Pick when you came out to see how much time we'll catch you up on."
            : "The time between these two dates is what we'll catch you up on."}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── DatesScreen ───────────────────────────────────────────────────────────────

export default function DatesScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const reduced = useReducedMotion();

  const today = todayMonthYear();
  const [startMonth, setStartMonth] = useState<number | null>(null);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endMonth, setEndMonth] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const endSet = endMonth !== null && endYear !== null;

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  const startSet = startMonth !== null && startYear !== null;

  // Validation
  const gapStartISO = startSet ? toISO(startMonth!, startYear!) : null;
  const gapEndISO = endSet ? toISO(endMonth!, endYear!) : null;

  const isOrderWrong =
    startSet &&
    endSet &&
    gapStartISO !== null &&
    gapEndISO !== null &&
    gapStartISO >= gapEndISO;

  const canContinue = startSet && endSet && !isOrderWrong;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    setProfile({ gapStart: gapStartISO!, gapEnd: gapEndISO! });
    router.push('/(onboarding)/location');
  }, [canContinue, gapStartISO, gapEndISO, setProfile]);

  // Picker callbacks
  const handleStartChange = (m: number, y: number) => {
    setStartMonth(m);
    setStartYear(y);
  };
  const handleEndChange = (m: number, y: number) => {
    setEndMonth(m);
    setEndYear(y);
  };

  // Accessibility labels
  const startLabel = startSet
    ? `Date you went in: ${formatLabel(startMonth!, startYear!)}, tap to change`
    : 'Date you went in: not set, tap to select';
  const endLabel = endSet
    ? `Date you came out: ${formatLabel(endMonth!, endYear!)}, tap to change`
    : 'Date you came out: not set, tap to select';

  const entering0 = reduced ? enter.fade(0) : enter.fadeUp(stagger(0, 80));
  const entering1 = reduced ? enter.fade(0) : enter.fadeUp(stagger(1, 80));
  const entering2 = reduced ? enter.fade(0) : enter.fadeUp(stagger(2, 80));

  return (
    <>
      <OnboardingShell
        step={1}
        header="Let's start with when you were inside."
        subtext="This helps us understand what changed while you were away."
        onContinue={handleContinue}
        continueDisabled={!canContinue}
        hideBack={true}
      >
        <View className="gap-3">
          <DateCard
            eyebrow="Date you went in"
            month={startMonth}
            year={startYear}
            onPress={() => setOpenPicker('start')}
            entering={entering0}
            accessLabel={startLabel}
          />

          <DateCard
            eyebrow="Date you came out"
            month={endMonth}
            year={endYear}
            onPress={() => setOpenPicker('end')}
            entering={entering1}
            accessLabel={endLabel}
          />

          {isOrderWrong && (
            <Animated.View entering={enter.fade(0)}>
              <Text className="text-sm font-sans leading-5" style={{ color: colors.danger }}>
                The date you came out has to be after the date you went in.
              </Text>
            </Animated.View>
          )}

          <GapCard
            entering={entering2}
            startMonth={startMonth}
            startYear={startYear}
            endMonth={endMonth}
            endYear={endYear}
            startSet={startSet}
            endSet={endSet}
            isOrderWrong={isOrderWrong}
            reduced={reduced}
          />
        </View>
      </OnboardingShell>

      {openPicker === 'start' && (
        <MonthYearPickerModal
          visible
          month={startMonth ?? today.month}
          year={startYear ?? today.year}
          onChange={handleStartChange}
          onClose={() => setOpenPicker(null)}
        />
      )}

      {openPicker === 'end' && (
        <MonthYearPickerModal
          visible
          month={endMonth ?? today.month}
          year={endYear ?? today.year}
          onChange={handleEndChange}
          onClose={() => setOpenPicker(null)}
        />
      )}
    </>
  );
}

// ── StyleSheet ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 45, 61, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  handleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
  },
  columns: {
    flexDirection: 'row',
    gap: 0,
  },
  column: {
    flex: 1,
  },
  columnScroll: {
    height: 280,
  },
  columnLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 8,
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowSelected: {
    backgroundColor: colors.surfaceDeep,
  },
  rowText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 15,
    color: colors.textMuted,
    flex: 1,
  },
  rowTextSelected: {
    fontFamily: 'Onest_500Medium',
    color: colors.primaryDeep,
  },
  confirmBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 16,
    color: colors.textInverse,
  },
});
