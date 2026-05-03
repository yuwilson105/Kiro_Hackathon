// INTEGRATION: import CheckinSheetMount and render at root layout (will be wired by integration agent).

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import * as Linking from 'expo-linking';
import { AlertCircle, Phone } from 'lucide-react-native';
import { createRef, useCallback, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FlameLogo } from '@/components/animations/flame-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  detectCrisis,
  getCompanionResponse,
  type CompanionResponse,
} from '@/lib/companion-voice';
import * as haptics from '@/lib/haptics';
import { enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { useStore } from '@/lib/store';
import type { Mood } from '@/types/check-in';

// ── Module-scoped ref so any component can open the sheet ─────────────────

const sheetRef = createRef<BottomSheetModal>();

export function useCheckinSheet() {
  return {
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────

type SheetState = 'mood' | 'follow-up' | 'crisis';

type MoodOption = {
  key: Mood;
  label: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'good', label: 'Good. I\'m on track.' },
  { key: 'okay', label: 'Okay. Taking it one step at a time.' },
  { key: 'struggling', label: 'Struggling. It\'s been hard.' },
  { key: 'need-talk', label: 'I need to talk about something' },
];

// ── Animated mood card ────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MoodCard({
  option,
  selected,
  onPress,
  enterDelay,
}: {
  option: MoodOption;
  selected: boolean;
  onPress: () => void;
  enterDelay: number;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const entering = reduced ? enter.fade(enterDelay) : enter.fadeUp(enterDelay);

  return (
    <Animated.View entering={entering} className="flex-1">
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96, spring.press);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring.press);
        }}
        style={animatedStyle}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected }}
        hitSlop={4}
        className={`h-24 rounded-2xl p-3 justify-between border ${
          selected
            ? 'bg-surface border-primary-soft'
            : 'bg-bg border-border'
        }`}
      >
        <Text className="text-sm font-medium text-text leading-5">
          {option.label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ── Main sheet component ──────────────────────────────────────────────────

export function CheckinSheet() {
  const { streak, registerMood, markCheckinShown } = useStore();
  const reduced = useReducedMotion();

  const [sheetState, setSheetState] = useState<SheetState>('mood');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [companionResponse, setCompanionResponse] =
    useState<CompanionResponse | null>(null);
  const [sending, setSending] = useState(false);

  // Stable per-render - new Date() only re-computes when sheetState changes (which
  // implies the sheet was just opened or advanced, so the date is always current).
  const today = useMemo(() => new Date(), [sheetState]); // eslint-disable-line react-hooks/exhaustive-deps
  const todayISO = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const dayOfWeek = useMemo(() => format(today, 'EEEE'), [today]);
  const monthDay = useMemo(() => format(today, 'MMMM d'), [today]);

  const snapPoints =
    sheetState === 'mood' ? ['65%'] : ['85%'];

  // ── Backdrop ──────────────────────────────────────────────────────────

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.4}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  // ── Dismiss helper ────────────────────────────────────────────────────

  const handleDismiss = () => {
    // Reset state when sheet is dismissed
    setSheetState('mood');
    setSelectedMood(null);
    setNote('');
    setCompanionResponse(null);
    setSending(false);
  };

  // ── Mood selection ────────────────────────────────────────────────────

  const handleMoodSelect = (mood: Mood) => {
    haptics.select();
    setSelectedMood(mood);
  };

  const handleMoodConfirm = () => {
    if (!selectedMood) return;
    if (selectedMood === 'struggling' || selectedMood === 'need-talk') {
      setSheetState('follow-up');
    } else {
      registerMood({ date: todayISO, mood: selectedMood });
      markCheckinShown(todayISO);
      sheetRef.current?.dismiss();
    }
  };

  // ── Follow-up send ────────────────────────────────────────────────────

  const handleSend = () => {
    if (note.trim().length < 2 || !selectedMood) return;
    setSending(true);

    const isCrisis = detectCrisis(note);
    if (isCrisis) {
      const response = getCompanionResponse(note, {
        hour: today.getHours(),
        streakDays: streak.current,
        daysSinceCheckin: 0,
      });
      setCompanionResponse(response);
      setSheetState('crisis');
      setSending(false);
      return;
    }

    const response = getCompanionResponse(note, {
      hour: today.getHours(),
      streakDays: streak.current,
      daysSinceCheckin: 0,
    });
    setCompanionResponse(response);
    setSending(false);
  };

  const handleGotIt = () => {
    if (!selectedMood) return;
    registerMood({ date: todayISO, mood: selectedMood, note });
    markCheckinShown(todayISO);
    sheetRef.current?.dismiss();
  };

  const handleCrisisClose = () => {
    markCheckinShown(todayISO);
    sheetRef.current?.dismiss();
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backgroundStyle={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36, height: 4 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sheetState === 'mood' && (
          <MoodState
            streak={streak.current}
            dayOfWeek={dayOfWeek}
            monthDay={monthDay}
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            onConfirm={handleMoodConfirm}
            reduced={reduced}
          />
        )}

        {sheetState === 'follow-up' && (
          <FollowUpState
            note={note}
            onNoteChange={setNote}
            companionResponse={companionResponse}
            sending={sending}
            onSend={handleSend}
            onGotIt={handleGotIt}
          />
        )}

        {sheetState === 'crisis' && companionResponse && (
          <CrisisState
            responseText={companionResponse.text}
            onClose={handleCrisisClose}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ── Mount component for root layout ──────────────────────────────────────

export function CheckinSheetMount() {
  return <CheckinSheet />;
}

// ── Mood state ────────────────────────────────────────────────────────────

function MoodState({
  streak,
  dayOfWeek,
  monthDay,
  selectedMood,
  onMoodSelect,
  onConfirm,
  reduced,
}: {
  streak: number;
  dayOfWeek: string;
  monthDay: string;
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  onConfirm: () => void;
  reduced: boolean | null;
}) {
  // Stable per-mood handlers - avoids new function refs on every render.
  const handleGood = useCallback(() => onMoodSelect('good'), [onMoodSelect]);
  const handleOkay = useCallback(() => onMoodSelect('okay'), [onMoodSelect]);
  const handleStruggling = useCallback(() => onMoodSelect('struggling'), [onMoodSelect]);
  const handleNeedTalk = useCallback(() => onMoodSelect('need-talk'), [onMoodSelect]);

  const moodHandlers: Record<Mood, () => void> = useMemo(
    () => ({ good: handleGood, okay: handleOkay, struggling: handleStruggling, 'need-talk': handleNeedTalk }),
    [handleGood, handleOkay, handleStruggling, handleNeedTalk]
  );

  const ctaLabel =
    selectedMood === 'good' || selectedMood === 'okay'
      ? "Let's go"
      : selectedMood === 'struggling' || selectedMood === 'need-talk'
        ? 'Tell me more'
        : null;

  return (
    <View className="flex-1 pb-8">
      {/* Question */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(60)}
      >
        <Text className="text-2xl font-medium text-text text-center mt-6 px-6">
          How are you feeling today?
        </Text>
      </Animated.View>

      {/* Mood grid - 2x2 */}
      <View className="mt-6 px-6 gap-3">
        <View className="flex-row gap-3">
          {MOOD_OPTIONS.slice(0, 2).map((option, i) => (
            <MoodCard
              key={option.key}
              option={option}
              selected={selectedMood === option.key}
              onPress={moodHandlers[option.key]}
              enterDelay={stagger(i, 40)}
            />
          ))}
        </View>
        <View className="flex-row gap-3">
          {MOOD_OPTIONS.slice(2, 4).map((option, i) => (
            <MoodCard
              key={option.key}
              option={option}
              selected={selectedMood === option.key}
              onPress={moodHandlers[option.key]}
              enterDelay={stagger(i + 2, 40)}
            />
          ))}
        </View>
      </View>

      {/* CTA - appears once mood is selected */}
      {ctaLabel !== null && (
        <Animated.View
          entering={reduced ? enter.fade(0) : enter.fadeUp(0)}
          className="mt-6 px-6"
        >
          <Button
            label={ctaLabel}
            onPress={onConfirm}
            variant="primary"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

// ── Follow-up state ───────────────────────────────────────────────────────

function FollowUpState({
  note,
  onNoteChange,
  companionResponse,
  sending,
  onSend,
  onGotIt,
}: {
  note: string;
  onNoteChange: (text: string) => void;
  companionResponse: CompanionResponse | null;
  sending: boolean;
  onSend: () => void;
  onGotIt: () => void;
}) {
  const canSend = note.trim().length >= 2;

  return (
    <View className="flex-1 pb-8">
      <Animated.View entering={enter.fade(0)} className="px-6 pt-6">
        <Text className="text-base font-medium text-text leading-6">
          I hear you. What's going on? You don't have to share everything. Just whatever feels right.
        </Text>
      </Animated.View>

      <Animated.View entering={enter.fadeUp(80)} className="mt-6 px-6">
        <Card variant="plain" padding="none">
          <TextInput
            accessibilityLabel="Tell us how you're feeling"
            accessibilityHint="Your entry is private and saved only on this device"
            multiline
            style={{
              height: 128,
              padding: 12,
              fontFamily: 'Onest_400Regular',
              fontSize: 16,
              color: colors.text,
              textAlignVertical: 'top',
            }}
            placeholder="Type whatever feels right..."
            placeholderTextColor={colors.textSubtle}
            value={note}
            onChangeText={onNoteChange}
            returnKeyType="default"
          />
        </Card>
      </Animated.View>

      {!companionResponse && (
        <Animated.View entering={enter.fade(0)} className="mt-4 px-6">
          <Button
            label="Send"
            onPress={onSend}
            variant="primary"
            fullWidth
            disabled={!canSend || sending}
            accessibilityLabel="Send your message"
          />
        </Animated.View>
      )}

      {companionResponse && (
        <Animated.View entering={enter.fadeUp(0)} className="mt-6 px-6 gap-4">
          <Card variant="surface" padding="md">
            <Text className="font-sans text-base text-text leading-6">
              {companionResponse.text}
            </Text>
          </Card>
          <Button
            label="Got it"
            onPress={onGotIt}
            variant="primary"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

// ── Crisis state ──────────────────────────────────────────────────────────

function CrisisState({
  responseText,
  onClose,
}: {
  responseText: string;
  onClose: () => void;
}) {
  return (
    <View className="flex-1 pb-8 px-6 pt-6">
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLabel="Crisis support card. The 988 Lifeline is available now."
        className="rounded-2xl bg-bg border border-danger p-5"
      >
        {/* Header row */}
        <View
          className="flex-row items-center"
          importantForAccessibility="no"
        >
          <AlertCircle size={24} color={colors.danger} strokeWidth={2} />
          <Text className="text-lg font-medium text-text ml-3">
            Crisis support, anytime.
          </Text>
        </View>

        {/* Body */}
        <Text className="text-lg font-sans text-text leading-6 mt-4">
          {responseText}
        </Text>

        {/* Call button */}
        <Button
          label="Call 988"
          onPress={() => {
            Linking.openURL('tel:988');
            haptics.tap();
          }}
          variant="primary"
          fullWidth
          leadingIcon={
            <Phone size={16} color={colors.textInverse} strokeWidth={2} />
          }
          style={{ marginTop: 16 }}
          accessibilityLabel="Call 988 Suicide and Crisis Lifeline. Free and confidential."
          accessibilityHint="Calls 988 directly to speak with a crisis counselor. Free and confidential."
        />

        {/* Text option */}
        <Pressable
          onPress={() => Linking.openURL('sms:988')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Text 988 instead"
          accessibilityHint="Opens a text message to 988. For when you can't speak out loud."
          className="mt-3 items-center py-2"
        >
          <Text className="text-sm font-sans text-primary-deep">
            Or text 988
          </Text>
        </Pressable>

        {/* Footer */}
        <Text className="text-xs font-sans text-text-muted text-center mt-4">
          Free, confidential, 24/7.
        </Text>
      </View>

      {/* Close link */}
      <Pressable
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close check-in"
        className="mt-6 items-center py-2"
      >
        <Text className="text-sm font-sans text-text-muted">Close</Text>
      </Pressable>
    </View>
  );
}
