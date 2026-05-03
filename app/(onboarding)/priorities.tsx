import { router } from 'expo-router';
import {
  BookOpen,
  Briefcase,
  Check,
  FileText,
  Heart,
  Home,
  Shield,
  Users,
  Wallet,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import * as haptics from '@/lib/haptics';
import { enter, spring, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { PriorityKey } from '@/types/profile';

// ── Data ──────────────────────────────────────────────────────────────────────

type PriorityItem = {
  key: PriorityKey;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
};

const PRIORITIES: PriorityItem[] = [
  { key: 'finding-job',         label: 'Finding a job',               Icon: Briefcase },
  { key: 'getting-id',          label: 'Getting my ID and documents',  Icon: FileText  },
  { key: 'finding-housing',     label: 'Finding stable housing',       Icon: Home      },
  { key: 'reconnecting-family', label: 'Reconnecting with family',     Icon: Users     },
  { key: 'mental-health',       label: 'Mental health support',        Icon: Heart     },
  { key: 'building-finances',   label: 'Building my finances',         Icon: Wallet    },
  { key: 'learning-missed',     label: 'Learning what I missed',       Icon: BookOpen  },
  { key: 'staying-out',         label: 'Staying out of trouble',       Icon: Shield    },
];

const MAX = 3;

// ── PriorityCard ──────────────────────────────────────────────────────────────

type CardProps = {
  item: PriorityItem;
  selected: boolean;
  atMax: boolean;
  totalSelected: number;
  onToggle: (key: PriorityKey) => void;
  entering: ReturnType<typeof enter.fadeUp>;
};

function PriorityCard({ item, selected, atMax, totalSelected, onToggle, entering }: CardProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const bgProgress = useSharedValue(selected ? 1 : 0);
  const checkScale = useSharedValue(selected ? 1 : 0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bgProgress.value < 0.5 ? colors.bg : colors.surface,
    borderColor: bgProgress.value < 0.5 ? colors.border : colors.primary,
    borderWidth: bgProgress.value < 0.5 ? 1 : 2,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const isDisabled = atMax && !selected;

  const handlePressIn = () => {
    if (isDisabled) return;
    if (!reduced) scale.value = withSpring(0.97, spring.press);
  };

  const handlePressOut = () => {
    if (!reduced) scale.value = withSpring(1, spring.press);
  };

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    haptics.select();
    const nextSelected = !selected;
    bgProgress.value = withTiming(nextSelected ? 1 : 0, { duration: 220 });
    checkScale.value = nextSelected
      ? withSpring(1, spring.snap)
      : withTiming(0, { duration: 160 });
    onToggle(item.key);
  }, [isDisabled, selected, item.key, onToggle, bgProgress, checkScale]);

  return (
    <Animated.View entering={entering} style={styles.cardWrapper}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected, disabled: isDisabled }}
        accessibilityHint={`Pick up to 3 priorities. Currently selected: ${totalSelected} of 3.`}
        disabled={isDisabled}
      >
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Checkmark badge — top right */}
          <Animated.View
            style={[styles.checkBadge, checkStyle]}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <Check size={11} color={colors.successDeep} strokeWidth={2.5} />
          </Animated.View>

          {/* Icon — top left */}
          <View accessibilityElementsHidden importantForAccessibility="no">
            <item.Icon
              size={24}
              color={selected ? colors.primaryDeep : colors.textMuted}
              strokeWidth={1.75}
            />
          </View>

          {/* Label — bottom left */}
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ── PrioritiesScreen ──────────────────────────────────────────────────────────

export default function PrioritiesScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const reduced = useReducedMotion();

  const [selectedKeys, setSelectedKeys] = useState<PriorityKey[]>([]);

  const toggle = useCallback((key: PriorityKey) => {
    setSelectedKeys((prev) => {
      const has = prev.includes(key);
      return has ? prev.filter((k) => k !== key) : [...prev, key];
    });
  }, []);

  const atMax = selectedKeys.length >= MAX;
  const canContinue = selectedKeys.length >= 1;

  const handleContinue = useCallback(() => {
    setProfile({ priorities: selectedKeys });
    router.push('/(onboarding)/interests');
  }, [selectedKeys, setProfile]);

  return (
    <OnboardingShell
      step={4}
      header="What matters most to you right now?"
      subtext="Pick up to three. We'll focus your first weeks on these."
      onContinue={handleContinue}
      continueLabel="Build my plan"
      continueDisabled={!canContinue}
    >
      <View style={styles.grid}>
        {PRIORITIES.map((item, i) => {
          const delay = reduced ? 0 : stagger(Math.min(i, 7), 50);
          const anim = reduced ? enter.fade(delay) : enter.fadeUp(delay);
          return (
            <PriorityCard
              key={item.key}
              item={item}
              selected={selectedKeys.includes(item.key)}
              atMax={atMax}
              totalSelected={selectedKeys.length}
              onToggle={toggle}
              entering={anim}
            />
          );
        })}
      </View>
    </OnboardingShell>
  );
}

// ── StyleSheet ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    width: '47.5%',
  },
  card: {
    height: 128,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  label: {
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    flexShrink: 1,
  },
});
