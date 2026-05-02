import { Linking, Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin, Phone, ArrowRight } from 'lucide-react-native';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { Resource, ResourceCategory } from '@/types/resource';

// Category label + soft-bg color mapping per Leader 06 § 9
const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  housing: 'Housing',
  food: 'Food',
  jobs: 'Jobs',
  legal: 'Legal aid',
  'mental-health': 'Mental health',
  healthcare: 'Healthcare',
  documents: 'Documents',
  financial: 'Financial',
};

// Text color token for each category label eyebrow
const CATEGORY_TEXT: Record<ResourceCategory, string> = {
  housing: colors.primaryDeep,
  food: colors.accentDeep,
  jobs: colors.successDeep,
  legal: colors.danger,
  'mental-health': colors.primary,
  healthcare: colors.primaryDeep,
  documents: colors.textMuted,
  financial: colors.accent,
};

// Very-light tint behind the label pill
const CATEGORY_BG: Record<ResourceCategory, string> = {
  housing: colors.surfaceDeep,
  food: colors.accentSoft,
  jobs: '#DFF0D8',
  legal: '#F7E5E5',
  'mental-health': '#EAF2FB',
  healthcare: colors.surfaceDeep,
  documents: '#F2F4F6',
  financial: colors.accentSoft,
};

function openMaps(resource: Resource) {
  const q = encodeURIComponent(`${resource.address}, ${resource.city}, ${resource.state}`);
  const url =
    Platform.OS === 'android'
      ? `geo:0,0?q=${q}`
      : `maps:?q=${q}`;
  haptics.tap();
  Linking.openURL(url);
}

function openPhone(resource: Resource) {
  const digits = resource.phone.replace(/[^0-9]/g, '');
  haptics.tap();
  Linking.openURL(`tel:${digits}`);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { item: Resource };

export function ResourceCard({ item }: Props) {
  const mapsScale = useSharedValue(1);
  const phoneScale = useSharedValue(1);

  const mapsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mapsScale.value }],
  }));

  const phoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phoneScale.value }],
  }));

  const accessLabel = `${item.name}, ${CATEGORY_LABEL[item.category]}, ${item.description}`;

  return (
    <Card
      variant="plain"
      padding="md"
      className="rounded-2xl"
      accessible={true}
      accessibilityLabel={accessLabel}
    >
      {/* Top row: name + felon-friendly badge */}
      <View className="flex-row items-start justify-between gap-3">
        <Text
          className="text-base font-medium text-text flex-1 flex-shrink leading-6"
          importantForAccessibility="no"
        >
          {item.name}
        </Text>
        {item.felonFriendly ? (
          <View
            style={{ backgroundColor: '#DFF0D8', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}
            importantForAccessibility="no"
          >
            <Text style={{ color: colors.successDeep, fontSize: 10, fontWeight: '500', letterSpacing: 0.3 }}>
              Felon-friendly
            </Text>
          </View>
        ) : null}
      </View>

      {/* Category pill */}
      <View
        style={{
          alignSelf: 'flex-start',
          marginTop: 6,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 2,
          backgroundColor: CATEGORY_BG[item.category],
        }}
        importantForAccessibility="no"
      >
        <Text
          style={{
            color: CATEGORY_TEXT[item.category],
            fontSize: 10,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {CATEGORY_LABEL[item.category]}
        </Text>
      </View>

      {/* Description */}
      <Text
        className="text-sm text-text-muted leading-5 mt-2"
        importantForAccessibility="no"
      >
        {item.description}
      </Text>

      {/* Address row */}
      <AnimatedPressable
        style={mapsStyle}
        onPressIn={() => { mapsScale.value = withSpring(0.97, spring.press); }}
        onPressOut={() => { mapsScale.value = withSpring(1, spring.press); }}
        onPress={() => openMaps(item)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Get directions to ${item.name} at ${item.address}`}
        className="flex-row items-start gap-2 mt-3"
      >
        <MapPin size={14} color={colors.primaryDeep} strokeWidth={2} style={{ marginTop: 2 }} />
        <Text className="text-sm flex-1 flex-shrink leading-5" style={{ color: colors.primaryDeep }}>
          {item.address}, {item.city}, {item.state}
        </Text>
      </AnimatedPressable>

      {/* Phone row */}
      <AnimatedPressable
        style={phoneStyle}
        onPressIn={() => { phoneScale.value = withSpring(0.97, spring.press); }}
        onPressOut={() => { phoneScale.value = withSpring(1, spring.press); }}
        onPress={() => openPhone(item)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Call ${item.name} at ${item.phone}`}
        className="flex-row items-center gap-2 mt-2"
      >
        <Phone size={14} color={colors.primaryDeep} strokeWidth={2} />
        <Text className="text-sm" style={{ color: colors.primaryDeep }}>
          {item.phone}
        </Text>
      </AnimatedPressable>

      {/* Hours */}
      {item.hours ? (
        <Text className="text-xs text-text-muted mt-2" importantForAccessibility="no">
          {item.hours}
        </Text>
      ) : null}

      {/* Sliding scale note */}
      {item.slidingScale ? (
        <Text className="text-xs text-text-muted mt-1" importantForAccessibility="no">
          Sliding scale fees
        </Text>
      ) : null}

      {/* Get directions button */}
      <View className="mt-3">
        <Button
          label="Get directions"
          variant="outline"
          size="sm"
          onPress={() => openMaps(item)}
          trailingIcon={<ArrowRight size={14} color={colors.text} strokeWidth={2} />}
          accessibilityLabel={`Get directions to ${item.name} at ${item.address}`}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>
    </Card>
  );
}
