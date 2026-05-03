import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { enter, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const setProfile = useStore((s) => s.setProfile);

  const [name, setName] = useState('');
  const trimmed = name.trim();

  const fade = (delay: number) =>
    reduced ? enter.fade(0) : enter.fadeUp(delay);

  const goNext = (firstName: string) => {
    setProfile({ firstName });
    router.push('/(onboarding)/dates');
  };

  const handleContinue = () => {
    if (trimmed.length === 0) return;
    goNext(trimmed);
  };

  const handleSkip = () => {
    goNext('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 28,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Animated.Text entering={fade(stagger(0))} style={styles.header}>
            What's your name?
          </Animated.Text>

          <Animated.View entering={fade(stagger(1, 80))} style={{ marginTop: 32 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your first name"
              placeholderTextColor={colors.textSubtle}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              maxLength={40}
              style={styles.input}
              accessibilityLabel="Your first name"
            />
          </Animated.View>
        </View>

        <Animated.View entering={fade(stagger(2, 100))}>
          <Button
            label="Continue"
            variant="primary"
            fullWidth
            onPress={handleContinue}
            disabled={trimmed.length === 0}
          />
          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip. I'd rather not say"
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>I'd rather not say</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  header: {
    marginTop: 14,
    fontFamily: 'Fraunces_400Regular',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtext: {
    marginTop: 14,
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  input: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    fontFamily: 'Onest_500Medium',
    fontSize: 18,
    color: colors.text,
  },
  skipBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    color: colors.textMuted,
  },
});
