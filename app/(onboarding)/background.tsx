import { router } from 'expo-router';
import { useState } from 'react';
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

type Q2Option = { label: string; value: EducationLevel };
type Q3Option = { label: string; value: WorkType };
type Q4Option = { label: string; value: HousingStatus };
type Q5Option = { label: string; value: IdStatus };

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

  const [convictionText, setConvictionText] = useState('');
  const [skipConviction, setSkipConviction] = useState(false);

  const [education, setEducation] = useState<EducationLevel | null>(null);
  const [educationOther, setEducationOther] = useState('');

  const [workHistory, setWorkHistory] = useState<WorkType[]>([]);
  const [workOther, setWorkOther] = useState('');

  const [housing, setHousing] = useState<HousingStatus | null>(null);
  const [housingOther, setHousingOther] = useState('');

  const [idStatus, setIdStatus] = useState<IdStatus | null>(null);

  const toggleWork = (value: WorkType) => {
    setWorkHistory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleConvictionTextChange = (text: string) => {
    setConvictionText(text);
    if (text.length > 0 && skipConviction) setSkipConviction(false);
  };

  const handleSkipConviction = () => {
    setSkipConviction((prev) => {
      const next = !prev;
      if (next) setConvictionText('');
      return next;
    });
  };

  const handleContinue = () => {
    let conviction: ConvictionType | null = null;
    if (skipConviction) conviction = 'rather-not-say';

    setProfile({
      conviction,
      convictionDetails: skipConviction ? '' : convictionText.trim(),
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
      continueDisabled={false}
    >
      {/* Optional indicator */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(0)}
        style={styles.optionalRow}
        accessible
        accessibilityLabel="All questions are optional. Skip anything that isn't yours to share."
      >
        <View style={styles.optionalDot} />
        <Text style={styles.optionalText}>
          ALL OPTIONAL — SKIP WHAT YOU'D RATHER NOT SHARE
        </Text>
      </Animated.View>

      {/* Q1 — Conviction (free-form) */}
      <Animated.View entering={cardEntering(0)}>
        <Card variant="plain" padding="md">
          <View
            accessible
            accessibilityLabel="In your own words, what happened?"
          >
            <Text className="font-medium text-base text-text mb-3">
              In your own words, what happened?
            </Text>
            <TextInput
              value={convictionText}
              onChangeText={handleConvictionTextChange}
              placeholder="Whatever feels right to share. A sentence or two is plenty."
              placeholderTextColor={colors.textSubtle}
              multiline
              editable={!skipConviction}
              style={[
                styles.textArea,
                skipConviction && styles.textAreaDisabled,
              ]}
              accessibilityLabel="Describe what happened"
            />
            <View style={styles.skipRow}>
              <PillButton
                label="I'd rather not say"
                selected={skipConviction}
                onPress={handleSkipConviction}
                accessibilityLabel="I'd rather not say"
              />
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
            <View className="flex-row gap-2 justify-center">
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

// ── OtherInput — inline text input shown when "Other" is selected ─────────────

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
  optionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  optionalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  optionalText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  textArea: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  textAreaDisabled: {
    backgroundColor: colors.surface,
    color: colors.textMuted,
  },
  skipRow: {
    marginTop: 12,
    flexDirection: 'row',
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
