import { Minus, Plus, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as RNTextInput,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import * as haptics from '@/lib/haptics';
import { duration as motionDuration, ease, enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAX_YEARS = 40;
const MAX_MONTHS_IN_SEGMENT = 11;

type Props = {
  onContinue: (data: { name: string; durationMonths: number }) => void;
};

// ── Stepper ──────────────────────────────────────────────────────────────────

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  reduced: boolean;
  unit: string;
};

function Stepper({ label, value, min, max, onChange, reduced, unit }: StepperProps) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  const valueScale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      if (!reduced) {
        valueScale.value = withSpring(1.08, spring.bouncy, () => {
          valueScale.value = withSpring(1, spring.press);
        });
      }
    }
  }, [value, reduced, valueScale]);

  const valueAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: valueScale.value }],
  }));

  const step = (delta: number) => {
    const next = Math.max(min, Math.min(max, value + delta));
    if (next === value) return;
    haptics.select();
    onChange(next);
  };

  return (
    <View className="flex-row items-center justify-between py-3">
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontFamily: 'Onest_500Medium',
        }}
      >
        {label}
      </Text>

      <View className="flex-row items-center gap-3">
        <StepperButton
          icon="minus"
          onPress={() => step(-1)}
          disabled={decDisabled}
          reduced={reduced}
          accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        />

        <View className="min-w-[72px] items-center">
          <Animated.Text
            style={[
              valueAnimStyle,
              {
                color: colors.text,
                fontSize: 28,
                lineHeight: 32,
                fontFamily: 'Onest_600SemiBold',
                letterSpacing: -0.5,
                fontVariant: ['tabular-nums'],
              },
            ]}
            accessibilityLiveRegion="polite"
          >
            {value}
          </Animated.Text>
          <Text
            style={{
              color: colors.textSubtle,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginTop: 2,
              fontFamily: 'Onest_500Medium',
            }}
          >
            {unit}
          </Text>
        </View>

        <StepperButton
          icon="plus"
          onPress={() => step(1)}
          disabled={incDisabled}
          reduced={reduced}
          accessibilityLabel={`Increase ${label.toLowerCase()}`}
        />
      </View>
    </View>
  );
}

// ── StepperButton ────────────────────────────────────────────────────────────

type StepperButtonProps = {
  icon: 'plus' | 'minus';
  onPress: () => void;
  disabled: boolean;
  reduced: boolean;
  accessibilityLabel: string;
};

function StepperButton({
  icon,
  onPress,
  disabled,
  reduced,
  accessibilityLabel,
}: StepperButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    if (disabled || reduced) return;
    scale.value = withSpring(0.9, spring.press);
  };
  const onPressOut = () => {
    if (reduced) return;
    scale.value = withSpring(1, spring.press);
  };

  const Icon = icon === 'plus' ? Plus : Minus;
  const tint = disabled ? colors.textSubtle : colors.primaryDeep;
  const bg = disabled ? colors.borderSubtle : colors.surface;
  const borderColor = disabled ? colors.borderSubtle : colors.borderSurface;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={8}
      style={[
        animStyle,
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Icon size={18} color={tint} strokeWidth={2.25} />
    </AnimatedPressable>
  );
}

// ── ContinueButton ───────────────────────────────────────────────────────────

type ContinueButtonProps = {
  enabled: boolean;
  onPress: () => void;
  reduced: boolean;
};

function ContinueButton({ enabled, onPress, reduced }: ContinueButtonProps) {
  const enabledV = useSharedValue(enabled ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      enabledV.value = enabled ? 1 : 0;
      return;
    }
    enabledV.value = withTiming(enabled ? 1 : 0, {
      duration: 200,
      easing: ease.out,
    });
    if (enabled) {
      pressScale.value = withSpring(1.02, spring.bouncy, () => {
        pressScale.value = withSpring(1, spring.press);
      });
    }
  }, [enabled, reduced, enabledV, pressScale]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      enabledV.value,
      [0, 1],
      [colors.bg, colors.primary],
    ),
    borderColor: interpolateColor(
      enabledV.value,
      [0, 1],
      [colors.border, colors.primary],
    ),
    transform: [{ scale: pressScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      enabledV.value,
      [0, 1],
      [colors.textSubtle, colors.textInverse],
    ),
  }));

  const onPressIn = () => {
    if (!enabled || reduced) return;
    pressScale.value = withSpring(0.97, spring.press);
  };
  const onPressOut = () => {
    if (reduced) return;
    pressScale.value = withSpring(1, spring.press);
  };

  const handlePress = () => {
    if (!enabled) return;
    haptics.tap();
    onPress();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Continue"
      accessibilityState={{ disabled: !enabled }}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={!enabled}
      style={[
        containerStyle,
        {
          height: 56,
          borderRadius: 999,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
      ]}
    >
      <Animated.Text
        style={[
          labelStyle,
          {
            fontSize: 16,
            fontFamily: 'Onest_500Medium',
          },
        ]}
      >
        Continue
      </Animated.Text>
    </AnimatedPressable>
  );
}

// ── StepNameDuration ─────────────────────────────────────────────────────────

export function StepNameDuration({ onContinue }: Props) {
  const reduced = useReducedMotion();
  const inputRef = useRef<RNTextInput>(null);

  const [name, setName] = useState('');
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [focused, setFocused] = useState(false);

  // Auto-focus on mount, respecting reduced motion (skip the slide-in distraction)
  useEffect(() => {
    const t = setTimeout(
      () => inputRef.current?.focus(),
      reduced ? 0 : motionDuration.medium,
    );
    return () => clearTimeout(t);
  }, [reduced]);

  const trimmedName = name.trim();
  const durationMonths = years * 12 + months;
  const valid = trimmedName.length >= 1 && durationMonths > 0;

  // Animated border for name input on focus
  const focusV = useSharedValue(0);
  useEffect(() => {
    focusV.value = withTiming(focused ? 1 : 0, {
      duration: 200,
      easing: ease.out,
    });
  }, [focused, focusV]);

  const inputBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusV.value,
      [0, 1],
      [colors.border, colors.primary],
    ),
  }));

  const handleContinue = useCallback(() => {
    if (!valid) return;
    haptics.success();
    onContinue({ name: trimmedName, durationMonths });
  }, [valid, trimmedName, durationMonths, onContinue]);

  const clearName = () => {
    haptics.select();
    setName('');
    inputRef.current?.focus();
  };

  const entering0 = reduced ? enter.fade(0) : enter.fadeUp(stagger(0, 70));
  const entering1 = reduced ? enter.fade(0) : enter.fadeUp(stagger(1, 70));
  const entering2 = reduced ? enter.fade(0) : enter.fadeUp(stagger(2, 70));
  const entering3 = reduced ? enter.fade(0) : enter.fadeUp(stagger(3, 70));

  const durationSummary = useMemo(() => {
    if (durationMonths === 0) return null;
    if (years === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
    if (months === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years} ${years === 1 ? 'yr' : 'yrs'}, ${months} ${months === 1 ? 'mo' : 'mos'}`;
  }, [years, months, durationMonths]);

  return (
    <View className="flex-1 justify-between">
      <View>
        {/* Header */}
        <Animated.View entering={entering0}>
          <Text
            style={{
              color: colors.text,
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: -0.6,
              fontFamily: 'Onest_600SemiBold',
            }}
          >
            Tell us who you are.
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 15,
              lineHeight: 22,
              marginTop: 8,
              fontFamily: 'Onest_400Regular',
            }}
          >
            Two quick things, then we&apos;re moving.
          </Text>
        </Animated.View>

        {/* Name field */}
        <Animated.View entering={entering1} style={{ marginTop: 32 }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 8,
              fontFamily: 'Onest_500Medium',
            }}
          >
            Your name
          </Text>
          <Animated.View
            style={[
              inputBorderStyle,
              {
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 16,
                backgroundColor: colors.bg,
                paddingHorizontal: 16,
                height: 56,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              accessibilityLabel="Your name"
              accessibilityHint="Enter your first name. This is how we'll greet you."
              selectionColor={colors.primary}
              style={{
                flex: 1,
                fontSize: 17,
                color: colors.text,
                fontFamily: 'Onest_500Medium',
                paddingVertical: 0,
              }}
            />
            {name.length > 0 && (
              <Pressable
                onPress={clearName}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear name"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.borderSubtle,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                }}
              >
                <X size={14} color={colors.textMuted} strokeWidth={2.25} />
              </Pressable>
            )}
          </Animated.View>
        </Animated.View>

        {/* Duration field */}
        <Animated.View entering={entering2} style={{ marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontFamily: 'Onest_500Medium',
              }}
            >
              Time away
            </Text>
            {durationSummary && (
              <Animated.Text
                entering={enter.fade(0)}
                style={{
                  color: colors.primaryDeep,
                  fontSize: 12,
                  fontFamily: 'Onest_500Medium',
                  fontVariant: ['tabular-nums'],
                }}
                accessibilityLiveRegion="polite"
              >
                {durationSummary}
              </Animated.Text>
            )}
          </View>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              backgroundColor: colors.bg,
              paddingHorizontal: 20,
              paddingVertical: 4,
            }}
          >
            <Stepper
              label="Years"
              value={years}
              min={0}
              max={MAX_YEARS}
              onChange={setYears}
              reduced={reduced}
              unit={years === 1 ? 'year' : 'years'}
            />
            <View
              style={{
                height: 1,
                backgroundColor: colors.borderSubtle,
              }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Stepper
              label="Months"
              value={months}
              min={0}
              max={MAX_MONTHS_IN_SEGMENT}
              onChange={setMonths}
              reduced={reduced}
              unit={months === 1 ? 'month' : 'months'}
            />
          </View>

          <Text
            style={{
              color: colors.textSubtle,
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              fontFamily: 'Onest_400Regular',
            }}
          >
            Round numbers are fine. We&apos;ll fine-tune later.
          </Text>
        </Animated.View>
      </View>

      {/* Continue */}
      <Animated.View entering={entering3} style={{ paddingTop: 24 }}>
        <ContinueButton enabled={valid} onPress={handleContinue} reduced={reduced} />
      </Animated.View>
    </View>
  );
}
