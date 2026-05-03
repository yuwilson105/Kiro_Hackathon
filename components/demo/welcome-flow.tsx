import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepInterests } from '@/components/demo/step-interests';
import { StepLocation } from '@/components/demo/step-location';
import { StepNameDuration } from '@/components/demo/step-name-duration';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import * as haptics from '@/lib/haptics';
import { duration, ease } from '@/lib/motion';
import { colors } from '@/lib/theme';

type Phase = 'steps' | 'celebrate';

type FlowData = {
  name?: string;
  durationMonths?: number;
  city?: string;
  usedGeo?: boolean;
  interests?: string[];
};

const TOTAL_STEPS = 3;

export function WelcomeFlow({ onExit }: { onExit: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('steps');
  const [data, setData] = useState<FlowData>({});

  const handleBack = () => {
    haptics.tap();
    if (step === 0) onExit();
    else setStep((s) => s - 1);
  };

  const advance = (patch: Partial<FlowData>) => {
    setData((d) => ({ ...d, ...patch }));
    haptics.select();
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      haptics.success();
      setPhase('celebrate');
    }
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {phase === 'steps' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="px-4 pt-2 pb-5 flex-row items-center gap-4">
            <IconButton
              icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
              onPress={handleBack}
              accessibilityLabel={step === 0 ? 'Exit welcome flow' : 'Previous step'}
              size={36}
            />
            <View className="flex-1 flex-row gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <Segment key={i} state={i < step ? 'done' : i === step ? 'active' : 'idle'} />
              ))}
            </View>
          </View>

          <View className="flex-1">
            <StepSwitcher step={step}>
              {step === 0 && (
                <StepNameDuration
                  onContinue={(d) => advance({ name: d.name, durationMonths: d.durationMonths })}
                />
              )}
              {step === 1 && (
                <StepLocation
                  onContinue={(d) => advance({ city: d.city, usedGeo: d.usedGeo })}
                />
              )}
              {step === 2 && (
                <StepInterests
                  onContinue={(d) => advance({ interests: d.interests })}
                />
              )}
            </StepSwitcher>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <Celebration name={data.name} onDone={onExit} />
      )}
    </View>
  );
}

function Segment({ state }: { state: 'idle' | 'active' | 'done' }) {
  const fill = useSharedValue(state === 'done' ? 1 : state === 'active' ? 1 : 0);

  useEffect(() => {
    if (state === 'done') {
      fill.value = withTiming(1, { duration: duration.short, easing: ease.out });
    } else if (state === 'active') {
      fill.value = withTiming(1, { duration: duration.medium, easing: ease.out });
    } else {
      fill.value = withTiming(0, { duration: duration.short, easing: ease.snap });
    }
  }, [state, fill]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: fill.value > 0.5 ? colors.primary : colors.borderSubtle,
    opacity: 0.5 + 0.5 * fill.value,
  }));

  return <Animated.View className="flex-1 h-1 rounded-full" style={style} />;
}

function StepSwitcher({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <Animated.View
      key={step}
      entering={FadeIn.duration(duration.medium).easing(ease.out)}
      exiting={FadeOut.duration(duration.short).easing(ease.snap)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
}

function Celebration({ name, onDone }: { name?: string; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(0.6);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(0.6, { duration: 900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      ),
      -1,
      true,
    );
    const t = setTimeout(() => setCanDismiss(true), 1500);
    return () => clearTimeout(t);
  }, [pulse]);

  const flameStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.25 }],
  }));

  const headline = name ? `Nice work, ${name.split(' ')[0]}.` : 'Nice. You\'re set.';

  return (
    <Animated.View
      entering={FadeIn.duration(duration.long).easing(ease.out)}
      style={{ flex: 1, backgroundColor: colors.surface }}
      className="px-8"
    >
      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={[
            flameStyle,
            {
              width: 56,
              height: 56,
              borderRadius: 999,
              backgroundColor: colors.accent,
              marginBottom: 28,
            },
          ]}
        />
        <Animated.Text
          entering={FadeIn.delay(200).duration(duration.medium).easing(ease.out)}
          className="font-medium text-3xl text-text text-center leading-9"
        >
          {headline}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(360).duration(duration.medium).easing(ease.out)}
          className="font-sans text-base text-text-muted text-center mt-3 leading-6"
        >
          Three small things, captured. We'll build the rest with you.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.delay(700).duration(duration.medium).easing(ease.out)}
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <Button
          label="Done"
          onPress={() => {
            haptics.tap();
            onDone();
          }}
          disabled={!canDismiss}
          fullWidth
        />
      </Animated.View>
    </Animated.View>
  );
}
