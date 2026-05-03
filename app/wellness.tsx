import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { X, MapPin, Phone } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/screen-container';
import { IconButton } from '@/components/ui/icon-button';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { CrisisCard } from '@/components/wellness/crisis-card';
import { MoodCalendar } from '@/components/wellness/mood-calendar';
import { GuidedPrompt } from '@/components/wellness/guided-prompt';

import { useStore } from '@/lib/store';
import { resources } from '@/lib/mock/resources';
import { enter, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

const MENTAL_HEALTH_RESOURCES = resources
  .filter((r) => r.category === 'mental-health')
  .slice(0, 4);

export default function WellnessScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const moodHistory = useStore((s) => s.moodHistory);

  return (
    <ScreenContainer edges={['bottom']} contentClassName="px-4 pb-10">
      {/* Header row */}
      <View className="flex-row items-center pt-6 pb-5">
        <IconButton
          icon={<X size={20} color={colors.text} strokeWidth={2} />}
          onPress={() => router.back()}
          accessibilityLabel="Close wellness screen"
          variant="plain"
          size={44}
        />
        <Text className="font-medium text-xl text-text ml-3">Wellness</Text>
      </View>

      {/* A - Crisis card: no animation, immediate, present */}
      <CrisisCard />

      {/* B - Mood calendar */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fade(120)}
        className="mt-8"
      >
        <SectionHeader eyebrow="HOW YOU'VE BEEN" className="mb-4" />
        <MoodCalendar moodHistory={moodHistory} />
      </Animated.View>

      {/* C - Guided prompt */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(200)}
        className="mt-8"
      >
        <SectionHeader eyebrow="A QUESTION FOR TODAY" className="mb-4" />
        <GuidedPrompt />
      </Animated.View>

      {/* D - Support resources */}
      <View className="mt-8">
        <SectionHeader eyebrow="SUPPORT NEAR YOU" className="mb-4" />
        {MENTAL_HEALTH_RESOURCES.map((resource, i) => {
          const delay = 320 + stagger(Math.min(i, 7), 40);
          return (
            <Animated.View
              key={resource.id}
              entering={reduced ? enter.fade(0) : enter.fadeUp(delay)}
              className="mb-3"
            >
              <Card variant="plain" padding="md">
                <Text className="font-medium text-base text-text">{resource.name}</Text>
                <Text className="font-sans text-sm text-text-muted leading-5 mt-1">
                  {resource.description}
                </Text>
                <View className="flex-row gap-4 mt-3">
                  {resource.address ? (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(
                          `maps:?q=${encodeURIComponent(resource.name + ' ' + resource.address)}`
                        )
                      }
                      accessibilityRole="link"
                      accessibilityLabel={`Get directions to ${resource.name}`}
                      hitSlop={8}
                      className="flex-row items-center gap-1"
                    >
                      <MapPin size={14} color={colors.textMuted} strokeWidth={2} />
                      <Text className="font-sans text-xs text-text-muted">
                        {resource.address}
                      </Text>
                    </Pressable>
                  ) : null}
                  {resource.phone ? (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`tel:${resource.phone.replace(/\D/g, '')}`)
                      }
                      accessibilityRole="link"
                      accessibilityLabel={`Call ${resource.name} at ${resource.phone}`}
                      hitSlop={8}
                      className="flex-row items-center gap-1"
                    >
                      <Phone size={14} color={colors.textMuted} strokeWidth={2} />
                      <Text className="font-sans text-xs text-text-muted">{resource.phone}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </Card>
            </Animated.View>
          );
        })}

        <Pressable
          onPress={() => {
            // Dismiss the Wellness modal first so the Find Help tab isn't stacked on top.
            // The dismiss animation plays, then the tab switch happens.
            router.dismiss();
            requestAnimationFrame(() => router.navigate('/(tabs)/help'));
          }}
          accessibilityRole="link"
          accessibilityLabel="See all mental health resources in Find Help"
          hitSlop={8}
          className="mt-1 self-start"
        >
          <Text style={{ color: colors.primaryDeep }} className="font-medium text-sm">
            See all in Find Help →
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
