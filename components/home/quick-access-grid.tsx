import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BookOpen, MapPin, Heart } from 'lucide-react-native';

import * as haptics from '@/lib/haptics';
import { enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

type Props = {
  onCatchUp: () => void;
  onFindHelp: () => void;
  onWellness: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AccessCard({
  icon,
  label,
  sub,
  enterDelay,
  onPress,
  accessLabel,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  enterDelay: number;
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
      scale.value = withSpring(0.96, spring.press);
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
    <Animated.View
      entering={reduced ? enter.fade(enterDelay) : enter.fadeUp(enterDelay)}
      className="flex-1"
    >
      <AnimatedPressable
        style={animStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessLabel}
        className="bg-bg border border-border rounded-2xl p-4 h-28 justify-between"
      >
        <View>{icon}</View>
        <View className="gap-0.5">
          <Text className="text-base font-medium text-text">{label}</Text>
          <Text className="text-xs font-sans text-text-muted" numberOfLines={1}>
            {sub}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export function QuickAccessGrid({ onCatchUp, onFindHelp, onWellness }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <AccessCard
          icon={<BookOpen size={20} strokeWidth={2} color={colors.primaryDeep} />}
          label="Catch up"
          sub="12 unread"
          enterDelay={stagger(0, 50) + 720}
          onPress={onCatchUp}
          accessLabel="Catch up. 12 unread items."
        />
        <AccessCard
          icon={<MapPin size={20} strokeWidth={2} color={colors.primaryDeep} />}
          label="Find help near you"
          sub="Resources in your city"
          enterDelay={stagger(1, 50) + 720}
          onPress={onFindHelp}
          accessLabel="Find help near you. Resources in your city."
        />
      </View>

      <Animated.View
        entering={
          // same delay logic but full-width row
          // reduced handled inside AccessCard — here we just use the same enter
          enter.fadeUp(stagger(2, 50) + 720)
        }
      >
        <Pressable
          onPress={onWellness}
          accessibilityRole="button"
          accessibilityLabel="Wellness"
          className="bg-bg border border-border rounded-2xl px-4 py-4 flex-row items-center gap-3"
        >
          <Heart size={20} strokeWidth={2} color={colors.primaryDeep} />
          <Text className="text-base font-medium text-text">Wellness</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
