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
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { useStore } from '@/lib/store';

export type Props = {
  onCatchUp: () => void;
  onFindHelp: () => void;
  onWellness: () => void;
  onPlan?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AccessCard({
  icon,
  label,
  sub,
  onPress,
  accessLabel,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string | null;
  onPress: () => void;
  accessLabel: string;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: opacity.value };
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    haptics.tap();
    if (reduced) {
      opacity.value = withSpring(0.75, spring.press);
    } else {
      scale.value = withSpring(0.97, spring.press);
    }
  };

  const handlePressOut = () => {
    if (reduced) {
      opacity.value = withSpring(1, spring.press);
    } else {
      scale.value = withSpring(1, spring.press);
    }
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
      <View>{icon}</View>
      <View className="gap-0.5">
        <Text className="text-base font-medium text-text">{label}</Text>
        {sub ? (
          <Text
            className="text-2xs font-medium uppercase tracking-wider text-text-muted"
            numberOfLines={1}
          >
            {sub}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

export function QuickAccessGrid({ onCatchUp, onFindHelp, onWellness, onPlan }: Props) {
  const readFeedIds = useStore((s) => s.readFeedIds);
  const city = useStore((s) => s.profile.city);
  const moodHistory = useStore((s) => s.moodHistory);
  const completedSteps = useStore((s) => s.completedSteps);
  const plan = useStore((s) => s.plan);

  // Card 1: unread count
  const unread = feedCards.length - readFeedIds.length;
  const catchUpSub = unread > 0 ? `${unread} unread` : null;

  // Card 2: city
  const findHelpSub = city ? `in ${city}` : 'near you';

  // Card 3: wellness today
  const todayISO = new Date().toISOString().slice(0, 10);
  const loggedToday = moodHistory.some((m) => m.date === todayISO);
  const wellnessSub = loggedToday ? 'Logged today' : 'Tap to check in';

  // Card 4: plan progress
  let planSub: string;
  if (!plan) {
    planSub = 'Building plan';
  } else {
    const total = plan.totalSteps;
    const done = Object.keys(completedSteps).length;
    planSub = `${done} of ${total} done`;
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <AccessCard
          icon={<BookOpen size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Catch up"
          sub={catchUpSub}
          onPress={onCatchUp}
          accessLabel={catchUpSub ? `Catch up. ${catchUpSub}.` : 'Catch up.'}
        />
        <AccessCard
          icon={<MapPin size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Find help"
          sub={findHelpSub}
          onPress={onFindHelp}
          accessLabel={`Find help. ${findHelpSub}.`}
        />
      </View>

      <View className="flex-row gap-3">
        <AccessCard
          icon={<Heart size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="Wellness"
          sub={wellnessSub}
          onPress={onWellness}
          accessLabel={`Wellness. ${wellnessSub}.`}
        />
        <AccessCard
          icon={<Calendar size={22} strokeWidth={1.75} color={colors.primaryDeep} />}
          label="My plan"
          sub={planSub}
          onPress={onPlan ?? (() => {})}
          accessLabel={`My plan. ${planSub}.`}
        />
      </View>
    </View>
  );
}
