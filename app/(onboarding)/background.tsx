import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { Card } from '@/components/ui/card';
import { PillButton } from '@/components/ui/pill-button';
import { enter, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import type {
  ConvictionType,
  EducationLevel,
  HousingStatus,
  IdStatus,
  WorkType,
} from '@/types/profile';

// ── Question definitions ──────────────────────────────────────────────────────

type Q1Option = { label: string; value: ConvictionType };
type Q2Option = { label: string; value: EducationLevel };
type Q3Option = { label: string; value: WorkType };
type Q4Option = { label: string; value: HousingStatus };
type Q5Option = { label: string; value: IdStatus };

const Q1: Q1Option[] = [
  { label: 'Non-violent', value: 'non-violent' },
  { label: 'Drug-related', value: 'drug-related' },
  { label: 'Violent', value: 'violent' },
  { label: "I'd rather not say", value: 'rather-not-say' },
];

const Q2: Q2Option[] = [
  { label: 'Some high school', value: 'some-high-school' },
  { label: 'High school / GED', value: 'high-school-diploma' },
  { label: 'Some college', value: 'some-college' },
  { label: 'College degree or higher', value: 'college-degree' },
];

const Q3: Q3Option[] = [
  { label: 'Manual labor', value: 'manual-labor' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Food service', value: 'food-service' },
  { label: 'Retail', value: 'retail' },
  { label: 'Construction', value: 'construction' },
  { label: 'Office work', value: 'office' },
  { label: 'Driving', value: 'driving' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Other', value: 'other' },
];

const Q4: Q4Option[] = [
  { label: 'Halfway house', value: 'halfway-house' },
  { label: 'With family or friends', value: 'family-friends' },
  { label: 'I have my own place', value: 'own-place' },
  { label: "I don't have housing yet", value: 'no-housing' },
];

const Q5: Q5Option[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: "It's expired", value: 'expired' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BackgroundScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const reduced = useReducedMotion();

  const [conviction, setConviction] = useState<ConvictionType | null>(null);
  const [education, setEducation] = useState<EducationLevel | null>(null);
  const [workHistory, setWorkHistory] = useState<WorkType[]>([]);
  const [housing, setHousing] = useState<HousingStatus | null>(null);
  const [idStatus, setIdStatus] = useState<IdStatus | null>(null);

  const toggleWork = (value: WorkType) => {
    setWorkHistory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const canContinue =
    conviction !== null &&
    education !== null &&
    workHistory.length > 0 &&
    housing !== null &&
    idStatus !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    setProfile({ conviction, education, workHistory, housing, idStatus });
    router.push('/(onboarding)/priorities');
  };

  const cardEntering = (i: number) =>
    reduced ? enter.fade(0) : enter.fadeUp(stagger(i, 60));

  return (
    <OnboardingShell
      step={3}
      header="Tell us a little about yourself."
      subtext="This shapes your plan. Be as honest as you can — there's no wrong answer here."
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      {/* Q1 — Conviction */}
      <Animated.View entering={cardEntering(0)}>
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="What best describes your conviction?"
          >
            <Text className="font-medium text-base text-text mb-3">
              What best describes your conviction?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Q1.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={conviction === opt.value}
                  onPress={() => setConviction(opt.value)}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Q2 — Education */}
      <Animated.View entering={cardEntering(1)} className="mt-4">
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="What's your highest level of education?"
          >
            <Text className="font-medium text-base text-text mb-3">
              What's your highest level of education?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Q2.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={education === opt.value}
                  onPress={() => setEducation(opt.value)}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Q3 — Work history (multi-select) */}
      <Animated.View entering={cardEntering(2)} className="mt-4">
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="What kind of work have you done before? Select all that apply."
          >
            <Text className="font-medium text-base text-text mb-3">
              What kind of work have you done before?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Q3.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={workHistory.includes(opt.value)}
                  onPress={() => toggleWork(opt.value)}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Q4 — Housing */}
      <Animated.View entering={cardEntering(3)} className="mt-4">
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="What's your housing situation right now?"
          >
            <Text className="font-medium text-base text-text mb-3">
              What's your housing situation right now?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Q4.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={housing === opt.value}
                  onPress={() => setHousing(opt.value)}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Q5 — ID status */}
      <Animated.View entering={cardEntering(4)} className="mt-4">
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="Do you have a valid ID right now?"
          >
            <Text className="font-medium text-base text-text mb-3">
              Do you have a valid ID right now?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Q5.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={idStatus === opt.value}
                  onPress={() => setIdStatus(opt.value)}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>
    </OnboardingShell>
  );
}
