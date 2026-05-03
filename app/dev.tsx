import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { useStore } from '@/lib/store';
import { generatePlan } from '@/lib/plan-generator';
import { colors } from '@/lib/theme';
import { ChevronLeft } from 'lucide-react-native';

const SECTIONS: { eyebrow: string; rows: { label: string; onPress: () => void }[] }[] = [];

export default function DevScreen() {
  const insets = useSafeAreaInsets();
  const profile = useStore((s) => s.profile);
  const setPlan = useStore((s) => s.setPlan);
  const finishOnboarding = useStore((s) => s.finishOnboarding);
  const resetOnboarding = useStore((s) => s.resetOnboarding);
  const setProfile = useStore((s) => s.setProfile);
  const setMilestoneUnlocked = useStore((s) => s.setMilestoneUnlocked);
  const completeStep = useStore((s) => s.completeStep);
  const setStreak = useStore((s) => s.setStreak);

  // Build the Marcus profile + plan once and bump the streak to a target value.
  // Lets us preview the dashboard at different streak tiers (flame palette,
  // hero subline, stat block) without grinding daily check-ins.
  const previewWithStreak = (days: number) => {
    const fakeProfile = {
      firstName: 'Marcus',
      gapStart: '2018-03-01',
      gapEnd: '2026-04-01',
      city: { city: 'San Francisco', state: 'CA' },
      conviction: 'non-violent' as const,
      convictionDetails: '',
      education: 'high-school-diploma' as const,
      educationOther: '',
      workHistory: ['warehouse', 'construction'] as const,
      workOther: '',
      housing: 'halfway-house' as const,
      housingOther: '',
      idStatus: 'no' as const,
      priorities: ['getting-id', 'finding-job', 'finding-housing'] as const,
      interests: ['tech', 'finance', 'criminal-justice', 'mental-health-awareness'] as const,
    };
    setProfile({ ...fakeProfile, workHistory: [...fakeProfile.workHistory], priorities: [...fakeProfile.priorities], interests: [...fakeProfile.interests] });
    setPlan(generatePlan({
      ...fakeProfile,
      workHistory: [...fakeProfile.workHistory],
      priorities: [...fakeProfile.priorities],
      interests: [...fakeProfile.interests],
    }));
    setStreak(days);
    finishOnboarding();
    router.replace('/(tabs)');
  };

  const goOnboarding = () => {
    resetOnboarding();
    router.push('/(onboarding)/name');
  };

  const skipOnboardingWithFakeProfile = () => {
    setProfile({
      firstName: 'Marcus',
      gapStart: '2018-03-01',
      gapEnd: '2026-04-01',
      city: { city: 'San Francisco', state: 'CA' },
      conviction: 'non-violent',
      education: 'high-school-diploma',
      workHistory: ['warehouse', 'construction'],
      housing: 'halfway-house',
      idStatus: 'no',
      priorities: ['getting-id', 'finding-job', 'finding-housing'],
      interests: ['tech', 'finance', 'criminal-justice', 'mental-health-awareness'],
    });
    const plan = generatePlan({
      firstName: 'Marcus',
      gapStart: '2018-03-01',
      gapEnd: '2026-04-01',
      city: { city: 'San Francisco', state: 'CA' },
      conviction: 'non-violent',
      convictionDetails: '',
      education: 'high-school-diploma',
      educationOther: '',
      workHistory: ['warehouse', 'construction'],
      workOther: '',
      housing: 'halfway-house',
      housingOther: '',
      idStatus: 'no',
      priorities: ['getting-id', 'finding-job', 'finding-housing'],
      interests: ['tech', 'finance', 'criminal-justice', 'mental-health-awareness'],
    });
    setPlan(plan);
    finishOnboarding();
    router.replace('/(tabs)');
  };

  const triggerMilestone = () => {
    setMilestoneUnlocked('get-state-id');
    completeStep('get-state-id');
    router.push('/milestone');
  };

  const goWellness = () => router.push('/wellness');
  const goReader = () => router.push({ pathname: '/reader', params: { id: 'tech-payment-apps' } });

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-2 pb-4 flex-row items-center gap-3">
        <IconButton
          icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          size={36}
        />
        <Text className="font-medium text-xl text-text">Dev menu</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 24 }}>
        <Card variant="surface" padding="md">
          <Text className="font-medium text-base text-text mb-1">Current state</Text>
          <Text className="font-sans text-sm text-text-muted">
            firstName: {profile.firstName || '-'}
          </Text>
          <Text className="font-sans text-sm text-text-muted">
            city: {profile.city ? `${profile.city.city}, ${profile.city.state}` : '-'}
          </Text>
          <Text className="font-sans text-sm text-text-muted">
            priorities: {profile.priorities.length}
          </Text>
          <Text className="font-sans text-sm text-text-muted">
            interests: {profile.interests.length}
          </Text>
        </Card>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Onboarding
          </Text>
          <Button label="Restart onboarding" variant="primary" fullWidth onPress={goOnboarding} />
          <Button
            label="Skip onboarding (fake Marcus profile)"
            variant="outline"
            fullWidth
            onPress={skipOnboardingWithFakeProfile}
          />
        </View>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Streak preview (Marcus profile)
          </Text>
          <Button label="After 30 days" variant="outline" fullWidth onPress={() => previewWithStreak(30)} />
          <Button label="After 50 days" variant="outline" fullWidth onPress={() => previewWithStreak(50)} />
          <Button label="After 100 days" variant="outline" fullWidth onPress={() => previewWithStreak(100)} />
          <Button label="After 3 years (1095 days)" variant="outline" fullWidth onPress={() => previewWithStreak(1095)} />
        </View>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Modals & moments
          </Text>
          <Button label="Open Wellness" variant="outline" fullWidth onPress={goWellness} />
          <Button label="Open Reader (Tech card)" variant="outline" fullWidth onPress={goReader} />
          <Button label="Trigger Milestone celebration" variant="primary" fullWidth onPress={triggerMilestone} />
        </View>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Demo
          </Text>
          <Button
            label="Demo: Dashboard scene"
            variant="primary"
            fullWidth
            onPress={() => router.push('/demo-dashboard')}
          />
          <Button
            label="Demo: Welcome flow"
            variant="outline"
            fullWidth
            onPress={() => router.push('/demo-welcome')}
          />
          <Button
            label="Preview: Flame palette (0–30 streak)"
            variant="outline"
            fullWidth
            onPress={() => router.push('/dev-flame-palette')}
          />
        </View>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Learning
          </Text>
          <Button
            label="Apple Pay & contactless"
            variant="outline"
            fullWidth
            onPress={() => router.push('/learning')}
          />
        </View>

        <View className="gap-3">
          <Text className="font-medium text-2xs uppercase tracking-wider text-text-muted">
            Reset
          </Text>
          <Button
            label="Wipe everything (back to splash)"
            variant="outline"
            fullWidth
            onPress={() => {
              resetOnboarding();
              router.replace('/');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
