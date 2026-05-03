import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type ChatMessage,
  type CompanionContext,
  makeSeedMessage,
  sendCompanionMessage,
} from '@/lib/companion-chat';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const profile = useStore((s) => s.profile);
  const streak = useStore((s) => s.streak);

  const context: CompanionContext = {
    firstName: profile.firstName ?? '',
    streakCurrent: streak.current ?? 0,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeSeedMessage(context)]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const canSend = input.trim().length > 0 && !sending;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const reply = await sendCompanionMessage(text, context, [...messages, userMsg]);
      const compMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        role: 'companion',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, compMsg]);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, context]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages, sending]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.title}>Your companion</Text>
          {__DEV__ && (
            <Pressable
              onPress={() => router.push('/dev')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open developer menu"
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Onest_500Medium',
                  color: colors.textMuted,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                ⚙ Dev
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.subtitle}>Knows your story. Around when you need it.</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {sending && <TypingIndicator />}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Tell me what's on your mind..."
              placeholderTextColor={colors.textSubtle}
              multiline
              style={styles.input}
              accessibilityLabel="Message your companion"
              returnKeyType="default"
            />
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Send"
              accessibilityState={{ disabled: !canSend }}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: canSend ? colors.primary : colors.surfaceDeep,
                  opacity: canSend ? 1 : 0.6,
                },
              ]}
            >
              <Send size={16} color={colors.textInverse} strokeWidth={2.25} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isCompanion = message.role === 'companion';
  return (
    <Animated.View
      entering={FadeIn.duration(280).easing(Easing.out(Easing.cubic))}
      style={[
        styles.msgRow,
        { justifyContent: isCompanion ? 'flex-start' : 'flex-end' },
      ]}
    >
      {isCompanion ? <CompanionAvatar /> : null}
      <View
        style={[
          styles.bubble,
          isCompanion ? styles.bubbleCompanion : styles.bubbleUser,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isCompanion ? colors.text : colors.textInverse },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

function CompanionAvatar() {
  return (
    <View style={styles.avatar}>
      <View style={styles.avatarDot} />
    </View>
  );
}

function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.typingRow}>
      <CompanionAvatar />
      <View style={styles.typingBubble}>
        <TypingDot delay={0} />
        <TypingDot delay={160} />
        <TypingDot delay={320} />
      </View>
    </Animated.View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 420, easing: Easing.inOut(Easing.cubic) })),
        withTiming(0.3, { duration: 420, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleCompanion: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primaryDeep,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    maxHeight: 120,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
