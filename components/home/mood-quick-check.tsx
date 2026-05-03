import { format } from 'date-fns';
import { Cloud, CloudSun, MessageCircle, SunMedium, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useCompanionAlertStore } from '@/lib/companion-alerts-store';
import * as haptics from '@/lib/haptics';
import { ease, spring } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Mood } from '@/types/check-in';

// ── Pill definitions ──────────────────────────────────────────────────────

type PillDef = {
  mood: Mood;
  label: string;
  Icon: typeof SunMedium;
};

const PILLS: PillDef[] = [
  { mood: 'good',       label: 'Good',        Icon: SunMedium     },
  { mood: 'okay',       label: 'Okay',        Icon: CloudSun      },
  { mood: 'struggling', label: 'Struggling',  Icon: Cloud         },
  { mood: 'need-talk',  label: 'Talk it out', Icon: MessageCircle },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Mood pill ─────────────────────────────────────────────────────────────

function MoodPill({
  def,
  active,
  onPress,
}: {
  def: PillDef;
  active: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ scale: scale.value }] },
  );

  const handlePressIn = useCallback(() => {
    haptics.select();
    if (!reduced) scale.value = withSpring(0.96, spring.press);
  }, [reduced, scale]);

  const handlePressOut = useCallback(() => {
    if (!reduced) scale.value = withSpring(1, spring.press);
  }, [reduced, scale]);

  const iconColor = active ? colors.primaryDeep : colors.textMuted;

  return (
    <AnimatedPressable
      style={[
        animStyle,
        {
          flex: 1,
          height: 48,
          borderRadius: 16,
          borderWidth: active ? 1.5 : 1,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.surface : colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={def.mood === 'need-talk' ? 'Open text input to talk it out' : `Log mood: ${def.label}`}
      accessibilityState={{ selected: active }}
    >
      <def.Icon size={16} strokeWidth={2} color={iconColor} />
      <Text
        style={{
          fontSize: 10,
          fontFamily: 'Onest_500Medium',
          color: active ? colors.primaryDeep : colors.textMuted,
          lineHeight: 13,
        }}
      >
        {def.label}
      </Text>
    </AnimatedPressable>
  );
}

// ── Animated close button (X) ─────────────────────────────────────────────

function CloseButton({ onPress }: { onPress: () => void }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ scale: scale.value }] },
  );

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        haptics.tap();
        if (!reduced) {
          scale.value = withSpring(0.82, spring.press);
          bgOpacity.value = withTiming(1, { duration: 120, easing: ease.snap });
        }
      }}
      onPressOut={() => {
        if (!reduced) {
          scale.value = withSpring(1, spring.press);
          bgOpacity.value = withTiming(0, { duration: 220, easing: ease.out });
        }
      }}
      style={[
        containerStyle,
        {
          position: 'absolute',
          top: 4,
          left: 4,
          width: 32,
          height: 32,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        },
      ]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Dismiss today's pulse"
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: colors.surfaceDeep,
          },
          bgStyle,
        ]}
        pointerEvents="none"
      />
      <X size={16} color={colors.textMuted} strokeWidth={2} />
    </AnimatedPressable>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function MoodQuickCheck() {
  const moodHistory = useStore((s) => s.moodHistory);
  const moodCheckDismissedDate = useStore((s) => s.moodCheckDismissedDate);
  const dismissMoodCheck = useStore((s) => s.dismissMoodCheck);
  const registerMood = useStore((s) => s.registerMood);
  const setAlert = useCompanionAlertStore((s) => s.setAlert);

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const todayEntry = moodHistory.find((m) => m.date === today);

  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [hidden, setHidden] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(t);
  }, []);

  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  // Constraint for the collapse-on-dismiss animation. Starts large so it doesn't
  // clip the natural content height, then animates to 0 to make siblings slide
  // up smoothly per-frame as the flex column re-lays out.
  const maxHeight = useSharedValue(600);
  const marginCollapse = useSharedValue(1);

  // Run the exit animation, then commit store updates after it finishes.
  const dismissWithAnimation = (afterAnim?: () => void) => {
    if (animating) return;
    setAnimating(true);

    if (reduced) {
      setHidden(true);
      if (afterAnim) afterAnim();
      dismissMoodCheck();
      return;
    }

    // UI-thread animation, no completion callback (the runOnJS bridge crash
    // here was reloading the bundle and snapping the user back to the splash).
    opacity.value = withTiming(0, { duration: 220, easing: ease.snap });
    scale.value = withTiming(0.96, { duration: 220, easing: ease.out });
    translateY.value = withTiming(-6, { duration: 220, easing: ease.out });
    // Collapse the card's height + outer margin slightly later so the fade leads
    // and the reflow follows — feels intentional, not jumpy.
    maxHeight.value = withTiming(0, { duration: 360, easing: ease.out });
    marginCollapse.value = withTiming(0, { duration: 360, easing: ease.out });

    // Commit store + state changes from the JS thread on its own timer.
    setTimeout(() => {
      setHidden(true);
      if (afterAnim) afterAnim();
      dismissMoodCheck();
    }, 380);
  };

  const logQuickMood = (mood: Mood) => {
    dismissWithAnimation(() => registerMood({ date: today, mood }));
    if (mood === 'struggling') setAlert('struggling-mood');
    setDismissed(true);
  };

  const handleTalkItOut = () => {
    haptics.select();
    setExpanded(true);
    setDismissed(true);
  };

  const handleSend = () => {
    const note = noteText.trim();
    if (note.length < 2) return;
    haptics.select();
    dismissWithAnimation(() => registerMood({ date: today, mood: 'need-talk', note }));
    setDismissed(true);
  };

  const handleClose = () => {
    dismissWithAnimation();
  };

  const handlePillPress = (mood: Mood) => {
    if (mood === 'need-talk') handleTalkItOut();
    else logQuickMood(mood);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    maxHeight: maxHeight.value,
    // Collapse the bottom margin in lockstep with maxHeight so the
    // gap-5 between siblings doesn't leave a residual stripe of empty space.
    marginBottom: -20 * (1 - marginCollapse.value),
  }));

  const sendDisabled = noteText.trim().length < 2;

  // Hide if dismissed for today, mood already logged, or local hidden flag set.
  // Must come AFTER all hooks above to satisfy the Rules of Hooks.
  if (!visible || dismissed) return null;
  if (hidden || moodCheckDismissedDate === today || todayEntry) return null;

  return (
    <Animated.View
      style={[
        cardAnimStyle,
        {
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 16,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        },
      ]}
    >
      <CloseButton onPress={handleClose} />

      {/* Eyebrow + question (left padding to clear the X) */}
      <View
        accessible
        accessibilityLabel="Today's pulse. How are you feeling?"
        style={{ paddingLeft: 32 }}
      >
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Onest_500Medium',
            color: colors.textMuted,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
          importantForAccessibility="no"
        >
          TODAY'S PULSE
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Onest_500Medium',
            color: colors.text,
            marginTop: 4,
          }}
          importantForAccessibility="no"
        >
          How are you?
        </Text>
      </View>

      {/* Mood pills */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {PILLS.map((def) => (
          <MoodPill
            key={def.mood}
            def={def}
            active={def.mood === 'need-talk' && expanded}
            onPress={() => handlePillPress(def.mood)}
          />
        ))}
      </View>

      {/* Expanded text input - only when "Talk it out" tapped */}
      {expanded && (
        <Animated.View entering={FadeIn.duration(220)} style={{ marginTop: 12 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.bg,
            }}
          >
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="What's on your mind? Just a few words is enough."
              placeholderTextColor={colors.textSubtle}
              multiline
              autoFocus
              maxLength={400}
              style={{
                fontSize: 14,
                color: colors.text,
                fontFamily: 'Inter_400Regular',
                minHeight: 60,
                textAlignVertical: 'top',
                padding: 0,
              }}
              accessibilityLabel="Tell us how you're feeling"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 10,
              gap: 16,
            }}
          >
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Maybe later"
            >
              <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.textMuted }}>
                Maybe later
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSend}
              disabled={sendDisabled}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Send"
              accessibilityState={{ disabled: sendDisabled }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_500Medium',
                  color: sendDisabled ? colors.textSubtle : colors.primaryDeep,
                }}
              >
                Send
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}
