import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { Card } from '@/components/ui/card';
import { PillButton } from '@/components/ui/pill-button';
import { enter, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
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
  { label: 'Other', value: 'other' },
  { label: "I'd rather not say", value: 'rather-not-say' },
];

const Q2: Q2Option[] = [
  { label: 'Less than high school', value: 'less-than-high-school' },
  { label: 'Some high school', value: 'some-high-school' },
  { label: 'High school / GED', value: 'high-school-diploma' },
  { label: 'Some college', value: 'some-college' },
  { label: 'College degree or higher', value: 'college-degree' },
  { label: 'Other', value: 'other' },
];

const Q3: Q3Option[] = [
  { label: 'Manual labor', value: 'manual-labor' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Retail', value: 'retail' },
  { label: 'Food service', value: 'food-service' },
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
  { label: 'Other', value: 'other' },
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

  // Seed each field from the persisted profile so navigating Back -> Forward
  // doesn't wipe the user's answers. Lazy initializer reads the store once
  // on mount; the useEffect below keeps the store in sync on every edit.
  const [conviction, setConviction] = useState<ConvictionType | null>(
    () => useStore.getState().profile.conviction,
  );
  const [convictionOther, setConvictionOther] = useState(
    () => useStore.getState().profile.convictionDetails ?? '',
  );

  const [education, setEducation] = useState<EducationLevel | null>(
    () => useStore.getState().profile.education,
  );
  const [educationOther, setEducationOther] = useState(
    () => useStore.getState().profile.educationOther ?? '',
  );

  const [workHistory, setWorkHistory] = useState<WorkType[]>(
    () => useStore.getState().profile.workHistory ?? [],
  );
  const [workOther, setWorkOther] = useState(
    () => useStore.getState().profile.workOther ?? '',
  );

  const [housing, setHousing] = useState<HousingStatus | null>(
    () => useStore.getState().profile.housing,
  );
  const [housingOther, setHousingOther] = useState(
    () => useStore.getState().profile.housingOther ?? '',
  );

  const [idStatus, setIdStatus] = useState<IdStatus | null>(
    () => useStore.getState().profile.idStatus,
  );

  const [skipEducation, setSkipEducation] = useState(false);
  const [skipWork, setSkipWork] = useState(false);
  const [skipHousing, setSkipHousing] = useState(false);
  const [skipId, setSkipId] = useState(false);

  const toggleSkip = (
    setter: (updater: (prev: boolean) => boolean) => void,
    clear: () => void,
  ) => {
    setter((prev) => {
      const next = !prev;
      if (next) clear();
      return next;
    });
  };

  const toggleWork = (value: WorkType) => {
    setWorkHistory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // Persist every edit to the store so Back/Forward navigation never loses work.
  // Continue handler can rely on the store being current.
  useEffect(() => {
    setProfile({
      conviction,
      convictionDetails: conviction === 'other' ? convictionOther.trim() : '',
      education,
      educationOther: education === 'other' ? educationOther.trim() : '',
      workHistory,
      workOther: workHistory.includes('other') ? workOther.trim() : '',
      housing,
      housingOther: housing === 'other' ? housingOther.trim() : '',
      idStatus,
    });
  }, [
    conviction,
    convictionOther,
    education,
    educationOther,
    workHistory,
    workOther,
    housing,
    housingOther,
    idStatus,
    setProfile,
  ]);

  // Validation: every question except conviction is mandatory.
  // "I'd rather not say" (skip*) counts as a complete answer - it intentionally
  // clears the question's selection state.
  const educationValid =
    skipEducation ||
    (education !== null && (education !== 'other' || educationOther.trim().length > 0));
  const workValid =
    skipWork ||
    (workHistory.length > 0 && (!workHistory.includes('other') || workOther.trim().length > 0));
  const housingValid =
    skipHousing ||
    (housing !== null && (housing !== 'other' || housingOther.trim().length > 0));
  const idValid = skipId || idStatus !== null;
  const canContinue = educationValid && workValid && housingValid && idValid;

  const handleContinue = () => {
    setProfile({
      conviction,
      convictionDetails: conviction === 'other' ? convictionOther.trim() : '',
      education,
      educationOther: education === 'other' ? educationOther.trim() : '',
      workHistory,
      workOther: workHistory.includes('other') ? workOther.trim() : '',
      housing,
      housingOther: housing === 'other' ? housingOther.trim() : '',
      idStatus,
    });
    router.push('/(onboarding)/priorities');
  };

  const cardEntering = (i: number) =>
    reduced ? enter.fade(0) : enter.fadeUp(stagger(i, 60));

  return (
    <OnboardingShell
      step={3}
      header={'Tell us a little\nabout yourself.'}
      subtext="This shapes your plan. Be as honest as you can. There's no wrong answer here."
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      {/* Q1 - Conviction (the only optional question) */}
      <Animated.View entering={cardEntering(0)}>
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="What were you convicted of?"
          >
            <Text className="font-medium text-base text-text mb-3">
              What were you convicted of?
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
            {conviction === 'other' ? (
              <OtherInput
                value={convictionOther}
                onChangeText={setConvictionOther}
                placeholder="In your own words"
                accessibilityLabel="Other conviction detail"
              />
            ) : null}
            <Text style={styles.helperNote}>
              Used only to tailor your plan to you.
            </Text>
          </View>
        </Card>
      </Animated.View>

      {/* Q2 - Education */}
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
                  selected={education === opt.value && !skipEducation}
                  onPress={() => {
                    setEducation(opt.value);
                    setSkipEducation(false);
                  }}
                  accessibilityLabel={opt.label}
                />
              ))}
              <PillButton
                label="I'd rather not say"
                selected={skipEducation}
                onPress={() => toggleSkip(setSkipEducation, () => setEducation(null))}
                accessibilityLabel="I'd rather not say about education"
              />
            </View>
            {education === 'other' ? (
              <OtherInput
                value={educationOther}
                onChangeText={setEducationOther}
                placeholder="Tell us about your education"
                accessibilityLabel="Other education detail"
              />
            ) : null}
          </View>
        </Card>
      </Animated.View>

      {/* Q3 - Work history (multi-select) */}
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
                  selected={workHistory.includes(opt.value) && !skipWork}
                  onPress={() => {
                    toggleWork(opt.value);
                    setSkipWork(false);
                  }}
                  accessibilityLabel={opt.label}
                />
              ))}
              <PillButton
                label="I'd rather not say"
                selected={skipWork}
                onPress={() => toggleSkip(setSkipWork, () => setWorkHistory([]))}
                accessibilityLabel="I'd rather not say about work history"
              />
            </View>
            {workHistory.includes('other') ? (
              <OtherInput
                value={workOther}
                onChangeText={setWorkOther}
                placeholder="What kind of work?"
                accessibilityLabel="Other work detail"
              />
            ) : null}
          </View>
        </Card>
      </Animated.View>

      {/* Q4 - Housing */}
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
              {/* Skip pill injected after "I have my own place" so it pairs
                  with that medium-width pill instead of orphaning on its
                  own row at the bottom. */}
              {Q4.slice(0, 3).map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={housing === opt.value && !skipHousing}
                  onPress={() => {
                    setHousing(opt.value);
                    setSkipHousing(false);
                  }}
                  accessibilityLabel={opt.label}
                />
              ))}
              <PillButton
                label="I'd rather not say"
                selected={skipHousing}
                onPress={() => toggleSkip(setSkipHousing, () => setHousing(null))}
                accessibilityLabel="I'd rather not say about housing"
              />
              {Q4.slice(3).map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={housing === opt.value && !skipHousing}
                  onPress={() => {
                    setHousing(opt.value);
                    setSkipHousing(false);
                  }}
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
            {housing === 'other' ? (
              <OtherInput
                value={housingOther}
                onChangeText={setHousingOther}
                placeholder="Tell us about it"
                accessibilityLabel="Other housing detail"
              />
            ) : null}
          </View>
        </Card>
      </Animated.View>

      {/* Q5 - ID status */}
      <Animated.View entering={cardEntering(4)} className="mt-4">
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="Do you have a valid ID right now?"
          >
            <Text className="font-medium text-base text-text mb-3">
              Do you have a valid ID right now?
            </Text>
            <View className="flex-row flex-wrap items-center" style={{ gap: 6 }}>
              {Q5.map((opt) => (
                <PillButton
                  key={opt.value}
                  label={opt.label}
                  selected={idStatus === opt.value && !skipId}
                  size="sm"
                  onPress={() => {
                    setIdStatus(opt.value);
                    setSkipId(false);
                  }}
                  accessibilityLabel={opt.label}
                />
              ))}
              {/* ml-auto pushes the skip pill to the right end of the row.
                  Label shortened to "Skip" so all four pills fit comfortably
                  on a single line at iPhone widths. */}
              <View style={{ marginLeft: 'auto' }}>
                <PillButton
                  label="Skip"
                  selected={skipId}
                  size="sm"
                  onPress={() => toggleSkip(setSkipId, () => setIdStatus(null))}
                  accessibilityLabel="I'd rather not say about ID"
                />
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    </OnboardingShell>
  );
}

// ── OtherInput - inline text input shown when "Other" is selected ─────────────

function OtherInput({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.otherWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={styles.otherInput}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  helperNote: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 12,
  },
  otherWrap: {
    marginTop: 12,
  },
  otherInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    color: colors.text,
  },
});
