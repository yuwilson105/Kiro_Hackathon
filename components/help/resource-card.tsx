import { Linking, Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin, Phone, ArrowRight } from 'lucide-react-native';

import { ResourceCardHeader } from '@/components/help/resource-card-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as haptics from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { colors } from '@/lib/theme';
import type { Resource, ResourceCategory } from '@/types/resource';

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

  const metaLine = [item.hours, item.slidingScale ? 'Sliding scale' : null]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Card
      variant="plain"
      padding="none"
      className="rounded-2xl overflow-hidden"
      accessible={true}
      accessibilityLabel={accessLabel}
    >
      <ResourceCardHeader resource={item} />

      <View className="p-4">
        {/* Title — eyebrow dropped now that the image carries category meaning */}
        <Text
          className="text-lg font-medium text-text leading-6"
          importantForAccessibility="no"
        >
          {item.name}
        </Text>

        {/* Description */}
        <Text
          className="text-sm text-text-muted leading-5 mt-2"
          importantForAccessibility="no"
        >
          {item.description}
        </Text>

        {/* Address row — stays linked (primary action) */}
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

        {/* Phone row — de-linked: muted icon + body text, still tappable */}
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
          <Phone size={14} color={colors.textMuted} strokeWidth={2} />
          <Text className="text-sm text-text">
            {item.phone}
          </Text>
        </AnimatedPressable>

        {/* Meta line — hours + sliding-scale combined with middot */}
        {metaLine ? (
          <Text className="text-xs text-text-muted mt-3" importantForAccessibility="no">
            {metaLine}
          </Text>
        ) : null}

        {/* Get directions button — full-width terminal action */}
        <View className="mt-4">
          <Button
            label="Get directions"
            variant="outline"
            size="sm"
            onPress={() => openMaps(item)}
            trailingIcon={<ArrowRight size={14} color={colors.text} strokeWidth={2} />}
            accessibilityLabel={`Get directions to ${item.name} at ${item.address}`}
          />
        </View>
      </View>
    </Card>
  );
}
