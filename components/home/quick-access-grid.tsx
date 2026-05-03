import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BookOpen, Calendar, Heart, MapPin } from 'lucide-react-native';

import * as haptics from '@/lib/haptics';
import { feedCards } from '@/lib/mock/feed';
import { resources } from '@/lib/mock/resources';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { useStore } from '@/lib/store';
import type { PriorityKey } from '@/types/profile';
import type { ResourceCategory } from '@/types/resource';

export type Props = {
  onCatchUp: () => void;
  onFindHelp: () => void;
  onWellness: () => void;
  onPlan?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressKind = 'book' | 'pin' | 'heart' | 'calendar';

type Stat = { number: string; label: string };

// Stacked stat: a fraction like "0/19" gets a typographic stack with an
// offset diagonal dash. Singular numbers get a colored number with a left
// rail accent bar — no pill background, no drop shadow.
function StatBlock({ stat }: { stat: Stat }) {
  const fraction = stat.number.match(/^(\d+)\/(\d+)$/);

  if (fraction) {
    const numerator = fraction[1];
    const denominator = fraction[2];
    // Total stack width is fixed so the diagonal slash lands in a consistent spot.
    return (
      <View style={{ width: 52 }}>
        {/* Numerator — top-left, primaryDeep colored */}
        <Text
          style={{
            fontSize: 28,
            lineHeight: 28,
            fontFamily: 'Onest_600SemiBold',
            fontWeight: '600',
            color: colors.primaryDeep,
            letterSpacing: -0.8,
            alignSelf: 'flex-start',
          }}
        >
          {numerator}
        </Text>
        {/* Diagonal slash — rotated View, off-center toward the right */}
        <View
          style={{
            width: 18,
            height: 2,
            backgroundColor: colors.primarySoft,
            borderRadius: 1,
            transform: [{ rotate: '-13deg' }],
            alignSelf: 'flex-end',
            marginRight: 4,
            marginTop: 1,
            marginBottom: 1,
          }}
        />
        {/* Denominator — bottom-right, smaller, muted */}
        <Text
          style={{
            fontSize: 13,
            lineHeight: 15,
            fontFamily: 'Onest_500Medium',
            fontWeight: '500',
            color: colors.textMuted,
            alignSelf: 'flex-end',
          }}
        >
          {denominator}
        </Text>
        {/* DONE / etc. label */}
        <Text
          style={{
            fontSize: 9,
            lineHeight: 11,
            fontFamily: 'Onest_500Medium',
            fontWeight: '500',
            color: colors.textMuted,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
            marginTop: 4,
            alignSelf: 'flex-end',
          }}
        >
          {stat.label}
        </Text>
      </View>
    );
  }

  // Singular number: colored numeral with a short vertical left-rail bar
  // that echoes the card's left edge — not a pill, not a background.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
      {/* Left-rail accent: a 3×22px bar in primarySoft */}
      <View
        style={{
          width: 3,
          height: 22,
          backgroundColor: colors.primarySoft,
          borderRadius: 2,
          marginTop: 3,
        }}
      />
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 28,
            lineHeight: 28,
            fontFamily: 'Onest_600SemiBold',
            fontWeight: '600',
            color: colors.primaryDeep,
            letterSpacing: -0.8,
          }}
          numberOfLines={1}
        >
          {stat.number}
        </Text>
        <Text
          style={{
            fontSize: 9,
            lineHeight: 11,
            fontFamily: 'Onest_500Medium',
            fontWeight: '500',
            color: colors.textMuted,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
            marginTop: 3,
          }}
          numberOfLines={1}
        >
          {stat.label}
        </Text>
      </View>
    </View>
  );
}

function AccessCard({
  icon,
  label,
  sub,
  stat,
  onPress,
  accessLabel,
  pressKind,
}: {
  icon: React.ReactNode;
  label: string;
  /** Plain text sublabel (e.g. "Tap to check in"). Used when there's no number to feature. */
  sub?: string | null;
  /** Prominent stat — number prominently displayed, small label below. */
  stat?: Stat | null;
  onPress: () => void;
  accessLabel: string;
  pressKind: PressKind;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const iconTranslateY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: opacity.value };
    return { transform: [{ scale: scale.value }] };
  });

  const iconAnimStyle = useAnimatedStyle(() => {
    if (reduced) return {};
    return {
      transform: [
        { translateY: iconTranslateY.value },
        { rotate: `${iconRotate.value}deg` },
        { scale: iconScale.value },
      ],
    };
  });

  const handlePressIn = () => {
    haptics.tap();
    if (reduced) {
      opacity.value = withSpring(0.75, spring.press);
      return;
    }
    scale.value = withSpring(0.97, spring.press);

    switch (pressKind) {
      case 'book':
        iconScale.value = withSpring(1.15, spring.press);
        iconRotate.value = withSpring(-6, spring.press);
        break;
      case 'pin':
        iconTranslateY.value = withSpring(4, spring.bouncy);
        break;
      case 'heart':
        iconScale.value = withSpring(1.2, spring.bouncy);
        break;
      case 'calendar':
        iconRotate.value = withSpring(-10, spring.press);
        iconScale.value = withSpring(1.06, spring.press);
        break;
    }
  };

  const handlePressOut = () => {
    if (reduced) {
      opacity.value = withSpring(1, spring.press);
      return;
    }
    scale.value = withSpring(1, spring.press);
    iconScale.value = withSpring(1, spring.gentle);
    iconRotate.value = withSpring(0, spring.gentle);
    iconTranslateY.value = withSpring(0, spring.gentle);
  };

  return (
    <AnimatedPressable
      style={[animStyle, { flex: 1 }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessLabel}
      className="bg-bg border border-border rounded-2xl p-3 h-28 justify-between"
    >
      {/* Top row: icon (left) + featured stat OR plain sublabel (right) */}
      <View className="flex-row items-start justify-between">
        <Animated.View style={iconAnimStyle}>{icon}</Animated.View>
        {stat ? (
          <StatBlock stat={stat} />
        ) : sub ? (
          <Text
            className="text-2xs font-medium uppercase tracking-wider text-text-muted text-right"
            style={{ maxWidth: 90 }}
            numberOfLines={1}
          >
            {sub}
          </Text>
        ) : null}
      </View>

      {/* Bottom: label */}
      <Text className="text-base font-medium text-text">{label}</Text>
    </AnimatedPressable>
  );
}

// Map onboarding priorities → resource categories so we can count what's
// actually relevant for the user.
const PRIORITY_TO_CATEGORY: Record<PriorityKey, ResourceCategory> = {
  'finding-job': 'jobs',
  'getting-id': 'documents',
  'finding-housing': 'housing',
  'reconnecting-family': 'mental-health',
  'mental-health': 'mental-health',
  'building-finances': 'financial',
  'learning-missed': 'jobs',
  'staying-out': 'legal',
};

export function QuickAccessGrid({ onCatchUp, onFindHelp, onWellness, onPlan }: Props) {
  const readFeedIds = useStore((s) => s.readFeedIds);
  const priorities = useStore((s) => s.profile.priorities);
  const moodHistory = useStore((s) => s.moodHistory);
  const completedSteps = useStore((s) => s.completedSteps);
  const plan = useStore((s) => s.plan);

  // Card 1 — Catch up: featured stat (unread count)
  const unread = feedCards.length - readFeedIds.length;
  const catchUpStat: Stat | null = unread > 0
    ? { number: String(unread), label: 'unread' }
    : null;

  // Card 2 — Find help: count resources matching the user's TOP priority only
  // (was summing all 3 priorities — that gave a meaninglessly large number).
  let findHelpStat: Stat;
  if (priorities.length > 0) {
    const topCategory = PRIORITY_TO_CATEGORY[priorities[0]];
    const matching = resources.filter((r) => r.category === topCategory).length;
    findHelpStat = { number: String(matching), label: 'for you' };
  } else {
    findHelpStat = { number: String(resources.length), label: 'nearby' };
  }

  // Card 3 — Wellness: text only (no number to feature when un-logged)
  const todayISO = new Date().toISOString().slice(0, 10);
  const loggedToday = moodHistory.some((m) => m.date === todayISO);
  const wellnessSub = loggedToday ? 'Logged today' : 'Tap to check in';

  // Card 4 — My plan: featured stat ("0/19" + "done")
  let planStat: Stat;
  let planSub: string | null = null;
  if (!plan) {
    planStat = { number: '0', label: 'no plan yet' };
    planSub = null;
  } else {
    const total = plan.totalSteps;
    const done = Object.keys(completedSteps).length;
    planStat = { number: `${done}/${total}`, label: 'done' };
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <AccessCard
          icon={<BookOpen size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Catch up"
          stat={catchUpStat}
          onPress={onCatchUp}
          accessLabel={catchUpStat ? `Catch up. ${catchUpStat.number} ${catchUpStat.label}.` : 'Catch up.'}
          pressKind="book"
        />
        <AccessCard
          icon={<MapPin size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Find help"
          stat={findHelpStat}
          onPress={onFindHelp}
          accessLabel={`Find help. ${findHelpStat.number} ${findHelpStat.label}.`}
          pressKind="pin"
        />
      </View>

      <View className="flex-row gap-3">
        <AccessCard
          icon={<Heart size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Wellness"
          sub={wellnessSub}
          onPress={onWellness}
          accessLabel={`Wellness. ${wellnessSub}.`}
          pressKind="heart"
        />
        <AccessCard
          icon={<Calendar size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="My plan"
          stat={planStat}
          sub={planSub}
          onPress={onPlan ?? (() => {})}
          accessLabel={`My plan. ${planStat.number} ${planStat.label}.`}
          pressKind="calendar"
        />
      </View>
    </View>
  );
}
