import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

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

  const handleTryAnother = () => {
    setIndex((prev) => pickRandom(prev));
  };

  return (
    <Card variant="surface" padding="lg">
      <Text className="font-medium text-lg text-text leading-7">{PROMPTS[index]}</Text>
      <Text className="font-sans text-sm text-text-muted leading-5 mt-3">
        Just sit with it. No need to answer.
      </Text>
      <View className="mt-4">
        <Pressable
          onPress={handleTryAnother}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Try another prompt"
        >
          <Text style={{ color: '#4A7DB0' }} className="font-medium text-sm">
            Try another
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
