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

// Big number, small uppercase label. Fractions render the numerator big and
// "out of N <label>" small underneath as plain text. No accent bars, no slashes.
function StatBlock({ stat }: { stat: Stat }) {
  const fraction = stat.number.match(/^(\d+)\/(\d+)$/);
  const numberText = fraction ? fraction[1] : stat.number;

  const labelStyle = {
    fontSize: 9,
    lineHeight: 11,
    fontFamily: 'Onest_500Medium',
    fontWeight: '500' as const,
    color: colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
    marginTop: 3,
    textAlign: 'right' as const,
  };

  return (
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
        {numberText}
      </Text>
      {fraction ? (
        <Text style={labelStyle} numberOfLines={1}>
          out of{' '}
          <Text style={{ color: colors.primaryDeep, fontFamily: 'Onest_600SemiBold' }}>
            {fraction[2]}
          </Text>{' '}
          {stat.label}
        </Text>
      ) : (
        <Text style={labelStyle} numberOfLines={1}>
          {stat.label}
        </Text>
      )}
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
            className="text-2xs font-medium uppercase tracking-wider text-text-muted text-right flex-shrink"
            numberOfLines={2}
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
