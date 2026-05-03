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
    useReducedMotion,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlameLogo } from '@/components/animations/flame-logo';
import { useCompanionAlertStore } from '@/lib/companion-alerts-store';
import {
    type ChatMessage,
    type CompanionContext,
    makeSeedMessage,
    sendCompanionMessage,
} from '@/lib/companion-chat';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const STRUGGLING_OPENER =
  "Hey. You said you were struggling. Are you okay? What happened? Anything I can help with?";

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const profile = useStore((s) => s.profile);
  const streak = useStore((s) => s.streak);

  const context: CompanionContext = {
    firstName: profile.firstName ?? '',
    streakCurrent: streak.current ?? 0,
    profile,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeSeedMessage(context)]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Run-once on mount: if the user was flagged as struggling, prepend a
  // companion opener and clear the alert so the tab indicator stops pulsing.
  // We read directly from the store via getState() (not the hook) so this
  // effect doesn't re-fire when the alert changes during the same visit.
  useEffect(() => {
    const alert = useCompanionAlertStore.getState().alert;
    if (alert !== null) {
      const openerMsg: ChatMessage = {
        id: `c-opener-${Date.now()}`,
        role: 'companion',
        content: STRUGGLING_OPENER,
        timestamp: Date.now(),
      };
      setMessages((prev) => [openerMsg, ...prev]);
      useCompanionAlertStore.getState().clearAlert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <FlameLogo size={28} loop={true} />
            <Text style={styles.title}>Your companion</Text>
          </View>
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
              <View style={{ transform: [{ translateX: -2 }, { translateY: 1 }] }}>
                <Send size={16} color={colors.textInverse} strokeWidth={2.25} />
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Companion: spring entry from the avatar side, avatar wakes (scale + dim)
//   80ms before the bubble lands.
// User: decisive Apple "snappy" cubic-bezier, no spring — user-initiated
//   actions shouldn't hesitate or bounce.
// Reduced motion: plain 180ms fade.
function MessageBubble({ message }: { message: ChatMessage }) {
  const isCompanion = message.role === 'companion';
  const reduced = useReducedMotion();

  // Bubble shared values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(isCompanion ? 0.92 : 0.94);
  const tx = useSharedValue(isCompanion ? -4 : 6);
  const ty = useSharedValue(isCompanion ? 8 : 14);

  // Avatar shared values (only used when isCompanion)
  const avatarOpacity = useSharedValue(0.7);
  const avatarScale = useSharedValue(0.96);

  useEffect(() => {
    if (reduced) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = 1;
      tx.value = 0;
      ty.value = 0;
      avatarOpacity.value = 1;
      avatarScale.value = 1;
      return;
    }

    if (isCompanion) {
      // Avatar leads by 80ms — calm "I'm awake" beat.
      const easeOutQuart = Easing.bezier(0.22, 1, 0.36, 1);
      avatarOpacity.value = withTiming(1, { duration: 180, easing: easeOutQuart });
      avatarScale.value = withTiming(1, { duration: 180, easing: easeOutQuart });

      // Bubble — spring with no perceivable overshoot.
      const springCfg = { damping: 18, stiffness: 180, mass: 0.9 };
      opacity.value = withDelay(80, withTiming(1, { duration: 240, easing: easeOutQuart }));
      scale.value = withDelay(80, withSpring(1, springCfg));
      tx.value = withDelay(80, withSpring(0, springCfg));
      ty.value = withDelay(80, withSpring(0, springCfg));
    } else {
      // User — Apple "decisive ease" cubic-bezier, 220ms, no spring.
      const decisive = Easing.bezier(0.32, 0.72, 0, 1);
      opacity.value = withTiming(1, { duration: 220, easing: decisive });
      scale.value = withTiming(1, { duration: 220, easing: decisive });
      tx.value = withTiming(0, { duration: 220, easing: decisive });
      ty.value = withTiming(0, { duration: 220, easing: decisive });
    }
  }, [reduced, isCompanion, opacity, scale, tx, ty, avatarOpacity, avatarScale]);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <View
      style={[
        styles.msgRow,
        { justifyContent: isCompanion ? 'flex-start' : 'flex-end' },
      ]}
    >
      {isCompanion ? (
        <Animated.View style={avatarStyle}>
          <CompanionAvatar />
        </Animated.View>
      ) : null}
      <Animated.View
        style={[
          bubbleStyle,
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
      </Animated.View>
    </View>
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
