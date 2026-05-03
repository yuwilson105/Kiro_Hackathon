import { useRouter } from 'expo-router';
import { Check, Circle, Lock, MapPin, Phone } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { LearnAccordion } from '@/components/plan/learn-accordion';
import { StepCardHeader } from '@/components/plan/step-card-header';
import { StepStatusSlider } from '@/components/plan/step-status-slider';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { PlanStep, StepStatus } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.View;

type Props = {
  step: PlanStep;
  status: StepStatus;
  prereqTitle?: string;
};

function StatusDot({ status }: { status: StepStatus }) {
  if (status === 'locked') {
    return <Lock size={18} color={colors.textSubtle} strokeWidth={2} />;
  }
  if (status === 'complete') {
    return (
      <View
        style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success }}
        className="items-center justify-center"
      >
        <Check size={13} color={colors.textInverse} strokeWidth={2.5} />
      </View>
    );
  }
  if (status === 'in-progress') {
    return (
      <View
        style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent }}
        className="items-center justify-center"
      >
        <View
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentDeep }}
        />
      </View>
    );
  }
  // pending
  return <Circle size={22} color={colors.border} strokeWidth={2} />;
}

export function StepCard({ step, status, prereqTitle }: Props) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const setStepStatus = useStore((s) => s.setStepStatus);
  const setMilestoneUnlocked = useStore((s) => s.setMilestoneUnlocked);

  const scale = useSharedValue(1);
  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  const lockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (lockedTimer.current) clearTimeout(lockedTimer.current);
    };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (status === 'locked') return;
    haptics.tap();
    scale.value = withSpring(0.97, spring.press);
  }

  function handlePressOut() {
    scale.value = withSpring(1, spring.press);
  }

  function handlePress() {
    if (status === 'locked') {
      const msg = prereqTitle
        ? `Complete "${prereqTitle}" first to unlock this.`
        : 'Complete the previous step first to unlock this.';
      setLockedMsg(msg);
      if (lockedTimer.current) clearTimeout(lockedTimer.current);
      lockedTimer.current = setTimeout(() => setLockedMsg(null), 3000);
    }
  }

  function handleStatusChange(next: 'pending' | 'in-progress' | 'complete') {
    setStepStatus(step.id, next);
    if (next === 'complete' && step.isMilestone) {
      setMilestoneUnlocked(step.id);
      router.push('/milestone');
    }
  }

  function openMaps() {
    if (!step.resourceAddress) return;
    Linking.openURL(`maps:?q=${encodeURIComponent(step.resourceAddress)}`);
  }

  function openPhone() {
    if (!step.resourcePhone) return;
    Linking.openURL(`tel:${step.resourcePhone.replace(/[^0-9]/g, '')}`);
  }

  const isComplete = status === 'complete';
  const isLocked = status === 'locked';

  const combinedA11yLabel = `Step: ${step.title}, ${status}, ${step.description}`;

  const cardContent = (
    <View
      className="rounded-2xl border border-border bg-bg overflow-hidden"
      style={[
        isComplete && {
          borderLeftWidth: 3,
          borderLeftColor: colors.success,
          opacity: 0.9,
        },
      ]}
    >
      {/* Category header banner — replaces the small AI sparkle iconography */}
      {!isLocked && (
        <StepCardHeader
          stepId={step.id}
          category={step.category}
          isMilestone={step.isMilestone}
        />
      )}

      <View className="px-4 pt-3 pb-4 gap-3">
        {/* Top row: status indicator + title */}
        <View className="flex-row items-start gap-3" importantForAccessibility="no">
          <View className="mt-0.5" accessibilityElementsHidden importantForAccessibility="no">
            <StatusDot status={status} />
          </View>
          <Text className="flex-1 text-base font-medium text-text leading-6" importantForAccessibility="no">
            {step.title}
          </Text>
        </View>

        {/* Description */}
        <Text
          className="text-sm font-sans text-text-muted leading-5"
          importantForAccessibility="no"
        >
          {step.description}
        </Text>

        {/* Why now — without the sparkle icon */}
        {!!step.whyNow && (
          <Text
            className="text-xs font-sans text-text-muted leading-5"
            importantForAccessibility="no"
          >
            {step.whyNow}
          </Text>
        )}

        {/* Resource card */}
        {!!step.resourceName && (
          <View className="rounded-xl border border-border-subtle bg-surface p-3 gap-1.5 mt-1">
            <Text className="text-sm font-medium text-text">{step.resourceName}</Text>
            {!!step.resourceAddress && (
              <Pressable
                onPress={openMaps}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={`Directions to ${step.resourceName}`}
                className="flex-row items-center gap-1.5"
              >
                <MapPin size={13} color={colors.primaryDeep} strokeWidth={2} />
                <Text className="text-sm font-sans flex-1" style={{ color: colors.primaryDeep }}>
                  {step.resourceAddress}
                </Text>
              </Pressable>
            )}
            {!!step.resourcePhone && (
              <Pressable
                onPress={openPhone}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={`Call ${step.resourceName} at ${step.resourcePhone}`}
                className="flex-row items-center gap-1.5"
              >
                <Phone size={13} color={colors.primaryDeep} strokeWidth={2} />
                <Text className="text-sm font-sans" style={{ color: colors.primaryDeep }}>
                  {step.resourcePhone}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Learn accordion */}
        {!!step.learnCard && <LearnAccordion learnCard={step.learnCard} />}

        {/* Locked tooltip */}
        {!!lockedMsg && (
          <View
            className="rounded-xl bg-surface border border-border-subtle px-3 py-2 mt-1"
            accessibilityLiveRegion="polite"
            accessible
            accessibilityLabel={lockedMsg}
          >
            <Text className="text-xs font-sans text-text-muted">{lockedMsg}</Text>
          </View>
        )}

        {/* Status slider (free movement between Pending / In progress / Done).
            Locked steps render a static label instead. */}
        <View className="mt-1">
          {status === 'locked' ? (
            <View className="flex-row items-center gap-1.5 self-end px-3 py-2 rounded-pill">
              <Lock size={13} color={colors.textSubtle} strokeWidth={2} />
              <Text className="text-sm font-sans text-text-subtle">Locked</Text>
            </View>
          ) : (
            <StepStatusSlider
              value={status}
              onChange={handleStatusChange}
              stepTitle={step.title}
            />
          )}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <AnimatedView
        style={animStyle}
        accessible
        accessibilityLabel={combinedA11yLabel}
      >
        {cardContent}
      </AnimatedView>
    );
  }

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessible
      accessibilityLabel={combinedA11yLabel}
      accessibilityState={{ disabled: isLocked }}
      hitSlop={4}
    >
      {cardContent}
    </AnimatedPressable>
  );
}
