import { Linking, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { AlertCircle, MessageCircle, Phone } from 'lucide-react-native';

import { colors } from '@/lib/theme';
import { spring } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CallButton() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={style}
      onPressIn={() => { scale.value = withSpring(0.96, spring.press); }}
      onPressOut={() => { scale.value = withSpring(1, spring.press); }}
      onPress={() => Linking.openURL('tel:988')}
      accessibilityRole="button"
      accessibilityLabel="Call 988"
      accessibilityHint="Calls 988 directly to speak with a crisis counselor. Free and confidential."
      className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-2xl py-4"
    >
      <Phone size={18} color={colors.textInverse} strokeWidth={2} />
      <Text className="font-medium text-base text-text-inverse">Call 988</Text>
    </AnimatedPressable>
  );
}

function TextButton() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={style}
      onPressIn={() => { scale.value = withSpring(0.96, spring.press); }}
      onPressOut={() => { scale.value = withSpring(1, spring.press); }}
      onPress={() => Linking.openURL('sms:988')}
      accessibilityRole="button"
      accessibilityLabel="Text 988"
      accessibilityHint="Opens a text message to 988. For when you can't speak out loud. Free and confidential."
      className="flex-1 flex-row items-center justify-center gap-2 bg-bg border border-border rounded-2xl py-4"
    >
      <MessageCircle size={18} color={colors.text} strokeWidth={2} />
      <Text className="font-medium text-base text-text">Text 988</Text>
    </AnimatedPressable>
  );
}

export function CrisisCard() {
  return (
    <View
      className="bg-bg rounded-2xl border border-danger p-5"
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="Crisis support card. You can call or text 988 for free, confidential support, any time."
    >
      <View
        className="flex-row items-center"
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
      >
        <AlertCircle size={22} color={colors.danger} strokeWidth={2} />
        <Text
          className="font-medium text-lg text-text ml-3"
          accessibilityLiveRegion="assertive"
        >
          Crisis support, anytime.
        </Text>
      </View>

      <Text
        className="font-sans text-sm text-text-muted leading-5 mt-2"
        importantForAccessibility="no"
      >
        Free, confidential, 24/7. The 988 Lifeline is for moments when things feel like too much.
      </Text>

      <View className="flex-row gap-3 mt-4">
        <CallButton />
        <TextButton />
      </View>
    </View>
  );
}
