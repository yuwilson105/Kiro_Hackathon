import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { enter } from '@/lib/motion';
import { colors } from '@/lib/theme';

const TOTAL_STEPS = 5;

type Props = {
  step: 1 | 2 | 3 | 4 | 5;
  header: string;
  subtext?: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
  children: ReactNode;
  scroll?: boolean;
};

export function OnboardingShell({
  step,
  header,
  subtext,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  hideBack = false,
  children,
  scroll = true,
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
      <View className="px-6 pt-2 pb-4 flex-row items-center gap-3">
        {hideBack ? (
          <View style={{ width: 36 }} />
        ) : (
          <IconButton
            icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            size={36}
          />
        )}
        <View className="flex-1">
          <ProgressBar segments={TOTAL_STEPS} current={step} />
        </View>
      </View>

      <Body {...bodyProps}>
        <Animated.View entering={enter.fadeUp(40)} className="mt-6">
          <Text className="font-medium text-3xl text-text leading-9">{header}</Text>
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
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}
