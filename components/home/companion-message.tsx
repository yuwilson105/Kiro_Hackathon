import { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useStore } from '@/lib/store';

// ── Messages ─────────────────────────────────────────────────────────────────
// 14 one-liners rotated by dayOfYear % 14.
// Slots 2, 6, 11 accept a first-name token ({name}) when available.

const MESSAGES: string[] = [
  "Mornings are quieter than you think. Use that.",
  "You don't have to have it figured out today.",
  "{name}, today is yours. That's enough to start.",
  "One thing done is more than nothing. Start there.",
  "Hard things get easier the second time around.",
  "Your past doesn't get a vote on what you do next.",
  "Hey — you showed up. That's the first move.",
  "Nobody figures this out all at once. That's normal.",
  "The next thing is small. Do the next thing.",
  "You're not behind. You're just at the hard part.",
  "It makes sense that this is difficult. It is difficult.",
  "{name}, the fact that you're here says something.",
  "Most people don't even get this far. You did.",
  "Something changed when you walked out. Build from there.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function resolveMessage(messages: string[], day: number, firstName: string): string {
  const raw = messages[day % messages.length];
  if (!raw.includes('{name}') || !firstName.trim()) {
    return raw.replace('{name}, ', '').replace('{name} ', '');
  }
  return raw.replace('{name}', firstName.trim());
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CompanionMessage() {
  const firstName = useStore((s) => s.profile.firstName);
  const day = dayOfYear(new Date());
  const message = resolveMessage(MESSAGES, day, firstName ?? '');

  const opacity = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      accessible
      accessibilityLabel={`Companion message: ${message}`}
      className="flex-row items-center py-3 px-1"
    >
      {/* Avatar */}
      <View className="w-8 h-8 rounded-full bg-primary-soft items-center justify-center mr-3 shrink-0">
        <View className="w-3 h-3 rounded-full bg-accent" />
      </View>

      {/* Message */}
      <View className="flex-1">
        <Text className="text-base font-sans text-text leading-6">
          {message}
        </Text>
        <Text className="text-2xs font-medium uppercase tracking-wider text-text-muted mt-2">
          your companion
        </Text>
      </View>
    </Animated.View>
  );
}
