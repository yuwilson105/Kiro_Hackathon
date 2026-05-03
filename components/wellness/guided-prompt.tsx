import { RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme';

const PROMPTS = [
  "What's one thing that went better than expected today?",
  "What's one thing you're still carrying from inside that you haven't talked about yet?",
  'Who in your life right now makes things feel more possible?',
  "What's one small win from this week?",
  "What's the next thing you can do today, even if it's tiny?",
  'If you could send a note to yourself a year ago, what would it say?',
] as const;

function pickRandom(exclude?: number): number {
  let next: number;
  do {
    next = Math.floor(Math.random() * PROMPTS.length);
  } while (next === exclude && PROMPTS.length > 1);
  return next;
}

export function GuidedPrompt() {
  const [index, setIndex] = useState(() => pickRandom());

  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const handleTryAnother = () => {
    setIndex((prev) => pickRandom(prev));
    // Reset to 0 instantly, then animate one full revolution.
    spin.value = 0;
    spin.value = withTiming(360, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', paddingVertical: 4 }}>
      {/* Hairline rule — anchors the question without re-templating it as a card. */}
      <Animated.View
        key={`rule-${index}`}
        entering={FadeIn.delay(200).duration(800).easing(Easing.out(Easing.cubic))}
        style={{
          width: 1,
          backgroundColor: colors.border,
          marginRight: 16,
        }}
      />

      <View style={{ flex: 1, paddingTop: 18, paddingBottom: 8 }}>
        {/* Opening quote ornament — sits ABOVE the question text in its own
            row so it never overlaps glyphs. Lifted via negative margin so it
            still feels like it's hugging the top-left of the block. */}
        <Animated.View
          key={`quote-${index}`}
          entering={FadeIn.duration(500).easing(Easing.out(Easing.cubic))}
          style={{ marginLeft: -6, marginBottom: -10 }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontFamily: 'Fraunces_300Light_Italic',
              fontSize: 32,
              lineHeight: 32,
              color: colors.primary,
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {'“'}
          </Text>
        </Animated.View>

        <Animated.View
          key={`q-${index}`}
          entering={FadeIn.duration(600).easing(Easing.out(Easing.cubic))}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_300Light_Italic',
              fontSize: 24,
              lineHeight: 32,
              letterSpacing: -0.3,
              color: colors.text,
            }}
          >
            {PROMPTS[index]}
          </Text>
        </Animated.View>

        <Pressable
          onPress={handleTryAnother}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Show another prompt"
          style={{
            marginTop: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
          }}
        >
          <Animated.View style={spinStyle}>
            <RefreshCw size={10} color={colors.textMuted} strokeWidth={2} />
          </Animated.View>
          <Text
            style={{
              fontFamily: 'Onest_500Medium',
              fontSize: 12,
              letterSpacing: 0.8,
              color: colors.textMuted,
              textTransform: 'uppercase',
            }}
          >
            Try another
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
