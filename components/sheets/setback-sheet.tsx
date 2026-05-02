/**
 * setback-sheet.tsx
 *
 * Triggered when a step is significantly overdue (3+ days past target).
 *
 * TODO (integration agent):
 *   1. Mount <SetbackSheetMount /> inside app/_layout.tsx (sibling to other sheet mounts).
 *   2. Call useSetbackSheet().open() from the plan screen when overdue condition is detected.
 *   3. Pass currentInProgressStepId from the plan store to the sheet trigger if available.
 */

'use strict';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { AlertCircle, Heart, Phone } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { generatePlan, regeneratePlanFromStep } from '@/lib/plan-generator';
import * as haptics from '@/lib/haptics';
import { enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';
import { useStore } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type SheetState = 'reason' | 'context' | 'rebuild' | 'done' | 'support';

type ReasonAction = 'context' | 'support' | 'forgot' | 'major';

interface ReasonOption {
  label: string;
  action: ReasonAction;
  contextFlag?: 'major';
}

// ─── Module-scoped ref (same pattern as check-in sheet) ──────────────────────

const sheetRef = React.createRef<BottomSheetModal>();

let _currentStepId: string | null = null;

export function useSetbackSheet() {
  return {
    open: (currentInProgressStepId?: string) => {
      _currentStepId = currentInProgressStepId ?? null;
      sheetRef.current?.present();
    },
    close: () => {
      sheetRef.current?.dismiss();
    },
  };
}

// ─── Reason options ───────────────────────────────────────────────────────────

const REASON_OPTIONS: ReasonOption[] = [
  {
    label: 'Something came up — I need to adjust the plan',
    action: 'context',
  },
  {
    label: "I've been struggling — I need support",
    action: 'support',
  },
  {
    label: "I'm fine — just forgot to mark things done",
    action: 'forgot',
  },
  {
    label: 'I lost my job / housing situation changed',
    action: 'major',
    contextFlag: 'major',
  },
];

const QUICK_CHIPS = ['Lost a job', 'Lost housing', 'Got sick', 'Family emergency', 'Other'];

// ─── Animated option card ─────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OptionCard({
  label,
  onPress,
  index,
}: {
  label: string;
  onPress: () => void;
  index: number;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const delay = reduced ? 0 : stagger(index, 40);
  const entering = reduced ? enter.fade(delay) : enter.fadeUp(delay);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={entering}>
      <AnimatedPressable
        style={animStyle}
        onPressIn={() => {
          haptics.select();
          scale.value = withSpring(0.97, spring.press);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring.press);
        }}
        onPress={onPress}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="bg-bg border border-border rounded-2xl px-4 py-4"
      >
        <Animated.Text
          style={animStyle}
          className="text-base font-medium text-text leading-6"
        >
          {label}
        </Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Chip button ──────────────────────────────────────────────────────────────

function ChipButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`px-4 py-2 rounded-full border ${
        selected
          ? 'bg-primary border-primary'
          : 'bg-bg border-border'
      }`}
    >
      <Animated.Text
        className={`text-sm font-medium ${selected ? 'text-text-inverse' : 'text-text'}`}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

// ─── Pulsing dot (rebuild animation) ─────────────────────────────────────────

function PulsingDot() {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className="w-3 h-3 rounded-full bg-primary"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

// ─── Main sheet component ─────────────────────────────────────────────────────

function SetbackSheetContent({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<SheetState>('reason');
  const [isMajorEvent, setIsMajorEvent] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [contextText, setContextText] = useState('');

  const { profile, plan, completedSteps, setPlan } = useStore((s) => ({
    profile: s.profile,
    plan: s.plan,
    completedSteps: s.completedSteps,
    setPlan: s.setPlan,
  }));

  // ── Reason handler ──────────────────────────────────────────────────────────

  const handleReason = useCallback(
    (option: ReasonOption) => {
      if (option.action === 'forgot') {
        onDismiss();
        return;
      }
      if (option.action === 'major') {
        setIsMajorEvent(true);
        setState('context');
        return;
      }
      if (option.action === 'support') {
        setState('support');
        return;
      }
      // 'context'
      setState('context');
    },
    [onDismiss],
  );

  // ── Rebuild handler ─────────────────────────────────────────────────────────

  const handleRebuild = useCallback(() => {
    haptics.tap();
    setState('rebuild');

    setTimeout(() => {
      const stepId = _currentStepId;
      const newPlan =
        stepId && plan
          ? regeneratePlanFromStep(profile, stepId, completedSteps)
          : generatePlan(profile);
      setPlan(newPlan);
      setState('done');
    }, 1500);
  }, [profile, plan, completedSteps, setPlan]);

  // ── Toggle chip ─────────────────────────────────────────────────────────────

  const toggleChip = useCallback((chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  }, []);

  // ── Render by state ─────────────────────────────────────────────────────────

  if (state === 'reason') {
    return (
      <View className="pb-8">
        <Animated.Text
          entering={enter.fade(0)}
          className="text-base font-medium text-text leading-6 px-6 pt-6 pb-5"
          accessibilityLiveRegion="polite"
          accessibilityRole="header"
        >
          Hey — I noticed you haven't marked anything done in a few days. That's okay. Can you tell
          me what's going on?
        </Animated.Text>

        <View className="px-6 gap-3">
          {REASON_OPTIONS.map((option, i) => (
            <OptionCard
              key={option.action + String(i)}
              label={option.label}
              index={i}
              onPress={() => handleReason(option)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (state === 'context') {
    return (
      <Animated.View entering={enter.fade(0)} className="pb-8">
        <View className="px-6 pt-4 pb-2">
          <Animated.Text
            entering={enter.fadeUp(0)}
            className="text-2xl font-medium text-text"
          >
            What changed?
          </Animated.Text>
          <Animated.Text
            entering={enter.fadeUp(40)}
            className="text-sm font-sans text-text-muted mt-1"
          >
            Just a few words is enough.
          </Animated.Text>
          {isMajorEvent && (
            <Animated.View
              entering={enter.fadeUp(60)}
              className="mt-3 flex-row items-center gap-2"
            >
              <AlertCircle
                size={14}
                color={colors.warning}
                strokeWidth={2}
                accessibilityElementsHidden
              />
              <Animated.Text className="text-xs font-sans text-text-muted leading-5 flex-1 flex-shrink">
                Major changes like job or housing loss can shift your priorities. We'll adjust.
              </Animated.Text>
            </Animated.View>
          )}
        </View>

        {/* Quick-pick chips */}
        <Animated.View entering={enter.fadeUp(60)} className="px-6 mt-2">
          <View className="flex-row flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                label={chip}
                selected={selectedChips.includes(chip)}
                onPress={() => toggleChip(chip)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Free-text input */}
        <Animated.View entering={enter.fadeUp(80)} className="px-6 mt-3">
          <View className="bg-bg border border-border rounded-2xl px-4 py-3">
            <TextInput
              multiline
              value={contextText}
              onChangeText={setContextText}
              placeholder="Tell me more if you want."
              placeholderTextColor={colors.textSubtle}
              style={{ height: 96, textAlignVertical: 'top', fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, color: colors.text }}
              accessibilityLabel="Describe what changed"
              accessibilityHint="Optional. Whatever feels right to share."
              returnKeyType="default"
            />
          </View>
        </Animated.View>

        {/* Rebuild CTA */}
        <Animated.View entering={enter.fadeUp(100)} className="px-6 mt-4">
          <RebuildButton onPress={handleRebuild} />
        </Animated.View>
      </Animated.View>
    );
  }

  if (state === 'rebuild') {
    return (
      <Animated.View
        entering={enter.fade(0)}
        className="px-6 py-10 items-center gap-4"
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel="Rebuilding your plan"
      >
        <PulsingDot />
        <Animated.Text className="text-base font-medium text-text">
          Rebuilding from where you are…
        </Animated.Text>
      </Animated.View>
    );
  }

  if (state === 'done') {
    return (
      <Animated.View entering={enter.fadeUp(0)} className="px-6 pb-8 pt-4 gap-4">
        <View className="bg-surface border border-border-surface rounded-2xl px-5 py-5 gap-2">
          <Animated.Text className="text-lg font-medium text-text">
            Here's your updated plan.
          </Animated.Text>
          <Animated.Text className="text-sm font-sans text-text-muted leading-5">
            You haven't lost any progress — we just adjusted the path.
          </Animated.Text>
        </View>
        <RebuildButton label="Got it" onPress={onDismiss} />
      </Animated.View>
    );
  }

  if (state === 'support') {
    return (
      <Animated.View entering={enter.fade(0)} className="pb-8">
        <Animated.Text
          entering={enter.fadeUp(0)}
          className="text-base font-medium text-text px-6 pt-4 pb-1"
        >
          I hear you.
        </Animated.Text>
        <Animated.Text
          entering={enter.fadeUp(40)}
          className="text-sm font-sans text-text-muted leading-5 px-6 pb-4"
        >
          Sometimes the hardest part is naming what's heavy. You don't have to figure it out alone.
        </Animated.Text>

        <View className="px-6 gap-3">
          {/* Wellness tab */}
          <Animated.View entering={enter.fadeUp(60)}>
            <SupportCard
              icon={<Heart size={16} color={colors.primary} strokeWidth={2} accessibilityElementsHidden />}
              label="Open Wellness tab"
              onPress={() => {
                onDismiss();
                router.push('/wellness' as never);
              }}
              accessibilityLabel="Open the Wellness tab"
            />
          </Animated.View>

          {/* Local mental health */}
          <Animated.View entering={enter.fadeUp(100)}>
            <SupportCard
              icon={<AlertCircle size={16} color={colors.textMuted} strokeWidth={2} accessibilityElementsHidden />}
              label="Find local mental health support"
              onPress={() => {
                onDismiss();
                router.push({ pathname: '/help', params: { category: 'mental-health' } } as never);
              }}
              accessibilityLabel="Find local mental health support near you"
            />
          </Animated.View>

          {/* 988 */}
          <Animated.View entering={enter.fadeUp(140)}>
            <SupportCard
              icon={<Phone size={16} color={colors.danger} strokeWidth={2} accessibilityElementsHidden />}
              label="Talk to 988 right now"
              onPress={() => Linking.openURL('tel:988')}
              accessibilityLabel="Call 988 crisis lifeline"
              accessibilityHint="Calls 988 directly. Free and confidential, available 24/7."
              isDanger
            />
          </Animated.View>
        </View>

        {/* Maybe later */}
        <Animated.View entering={enter.fade(180)} className="items-center mt-5">
          <Pressable
            onPress={onDismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Dismiss — maybe later"
          >
            <Animated.Text className="text-sm font-sans text-text-muted">
              Maybe later
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  }

  return null;
}

// ─── Rebuild/primary button ───────────────────────────────────────────────────

function RebuildButton({
  label = 'Rebuild my plan',
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => {
        haptics.tap();
        scale.value = withSpring(0.96, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.press);
      }}
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-primary rounded-2xl px-6 py-4 items-center"
    >
      <Animated.Text className="text-base font-medium text-text-inverse">{label}</Animated.Text>
    </AnimatedPressable>
  );
}

// ─── Support resource card ────────────────────────────────────────────────────

function SupportCard({
  icon,
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  isDanger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  isDanger?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => {
        haptics.tap();
        scale.value = withSpring(0.97, spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.press);
      }}
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      className={`bg-surface rounded-2xl px-4 py-4 flex-row items-center gap-3 ${
        isDanger ? 'border border-danger' : 'border border-border-surface'
      }`}
    >
      <View accessibilityElementsHidden importantForAccessibility="no">
        {icon}
      </View>
      <Animated.Text className="text-base font-medium text-text flex-1 flex-shrink">
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

// ─── SetbackSheetMount ────────────────────────────────────────────────────────

export function SetbackSheetMount() {
  const snapPoints = React.useMemo(() => ['70%', '90%'], []);

  const handleDismiss = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.borderSubtle, width: 36 }}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SetbackSheetContent onDismiss={handleDismiss} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
