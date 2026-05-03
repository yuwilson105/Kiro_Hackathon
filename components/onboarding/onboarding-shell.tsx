import { router } from 'expo-router';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react-native';
import { ReactNode, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import * as haptics from '@/lib/haptics';
import { enter, spring } from '@/lib/motion';
import { colors } from '@/lib/theme';

const TOTAL_STEPS = 5;

type Props = {
  step: 1 | 2 | 3 | 4 | 5;
  header: string;
  headerClassName?: string;
  subtext?: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
  children: ReactNode;
  scroll?: boolean;
  /** When true, the bottom CTA renders the "featured" build-plan style:
   * deeper-blue pill with a leading Sparkles icon and a trailing ArrowRight
   * that nudges right on press. Use on the final onboarding step. */
  featuredCta?: boolean;
};

export function OnboardingShell({
  step,
  header,
  headerClassName,
  subtext,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  hideBack = false,
  children,
  scroll = true,
  featuredCta = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        contentContainerStyle: { paddingHorizontal: 24, paddingBottom: 24 },
        keyboardShouldPersistTaps: 'handled' as const,
        showsVerticalScrollIndicator: false,
      }
    : { style: { paddingHorizontal: 24, paddingBottom: 24, flex: 1 } };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="pt-2 pb-4 flex-row items-center">
        <View style={{ width: 48, paddingLeft: 12 }}>
          {hideBack ? null : (
            <IconButton
              icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/(tabs)');
              }}
              accessibilityLabel="Go back"
              size={36}
            />
          )}
        </View>
        <View className="flex-1">
          <ProgressBar segments={TOTAL_STEPS} current={step} />
        </View>
        <View style={{ width: 48 }} />
      </View>

      <Body {...bodyProps}>
        <Animated.View entering={enter.fadeUp(40)} className="mt-6">
          <Text className={headerClassName ?? 'font-medium text-3xl text-text leading-9'}>{header}</Text>
          {subtext ? (
            <Text className="font-sans text-base text-text-muted leading-6 mt-3">
              {subtext}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={enter.fadeUp(160)} className="mt-8">
          {children}
        </Animated.View>
      </Body>

      {onContinue ? (
        <View
          className="px-6 pt-3 border-t border-border-subtle bg-bg"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {featuredCta ? (
            <FeaturedCta
              label={continueLabel}
              onPress={onContinue}
              disabled={continueDisabled}
            />
          ) : (
            <Button
              label={continueLabel}
              onPress={onContinue}
              disabled={continueDisabled}
              fullWidth
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

// ── Featured CTA — used on the final onboarding step ────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeaturedCta({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const arrowX = useSharedValue(0);
  const glow = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ scale: scale.value }] },
  );
  const arrowStyle = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ translateX: arrowX.value }] },
  );
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.6 }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    haptics.tap();
    if (!reduced) {
      scale.value = withSpring(0.97, spring.press);
      arrowX.value = withSpring(4, spring.press);
      glow.value = withSpring(1, spring.gentle);
    }
  }, [reduced, disabled, scale, arrowX, glow]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    if (!reduced) {
      scale.value = withSpring(1, spring.press);
      arrowX.value = withSpring(0, spring.press);
      glow.value = withSpring(0, spring.gentle);
    }
  }, [reduced, disabled, scale, arrowX, glow]);

  return (
    <View style={{ position: 'relative' }}>
      {/* Soft halo glow behind the pill on press */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -10,
            bottom: -10,
            left: -10,
            right: -10,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
          },
          glowStyle,
        ]}
      />
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={[
          containerStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
            paddingHorizontal: 24,
            gap: 12,
            borderRadius: 999,
            backgroundColor: disabled ? colors.primarySoft : colors.primaryDeep,
            opacity: disabled ? 0.7 : 1,
          },
        ]}
      >
        <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Onest_500Medium',
            color: '#FFFFFF',
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
        <Animated.View style={arrowStyle}>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.25} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}
