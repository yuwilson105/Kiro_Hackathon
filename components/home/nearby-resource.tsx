import { Linking, Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin, Phone } from 'lucide-react-native';

import { useStore } from '@/lib/store';
import { spring } from '@/lib/motion';
import { colors, radii } from '@/lib/theme';
import * as haptics from '@/lib/haptics';
import { resources } from '@/lib/mock/resources';
import type { PriorityKey } from '@/types/profile';
import type { Resource, ResourceCategory } from '@/types/resource';

// Priority → category mapping per spec
const PRIORITY_TO_CATEGORY: Record<PriorityKey, ResourceCategory> = {
  'finding-job': 'jobs',
  'getting-id': 'documents',
  'finding-housing': 'housing',
  'reconnecting-family': 'mental-health',
  'mental-health': 'mental-health',
  'building-finances': 'financial',
  'learning-missed': 'jobs',
  'staying-out': 'legal',
};

// Category label display
const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  housing: 'Housing',
  food: 'Food',
  jobs: 'Jobs',
  legal: 'Legal',
  'mental-health': 'Mental health',
  healthcare: 'Healthcare',
  documents: 'Documents',
  financial: 'Financial',
};

// Pill text color per Leader 06 § 9
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

// Pill background — very light tint, not a full fill
const CATEGORY_BG: Record<ResourceCategory, string> = {
  housing: colors.surfaceDeep,
  food: colors.accentSoft,
  jobs: '#DFF0D8',
  legal: '#F7E5E5',
  'mental-health': '#D6E9F8',
  healthcare: colors.surfaceDeep,
  documents: '#F2F4F6',
  financial: colors.accentSoft,
};

/** Deterministic index by day-of-year (stable per day) */
function pickByDay(list: Resource[]): Resource {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return list[dayOfYear % list.length]!;
}

function openMaps(resource: Resource): void {
  const q = encodeURIComponent(`${resource.address}, ${resource.city}, ${resource.state}`);
  const url = Platform.OS === 'android' ? `geo:0,0?q=${q}` : `maps:?q=${q}`;
  haptics.tap();
  void Linking.openURL(url);
}

function openPhone(resource: Resource): void {
  const digits = resource.phone.replace(/[^0-9]/g, '');
  haptics.tap();
  void Linking.openURL(`tel:${digits}`);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NearbyResource() {
  const priorities = useStore((s) => s.profile.priorities);

  // Resolve target categories from priorities
  const targetCategories = new Set<ResourceCategory>(
    priorities.map((p) => PRIORITY_TO_CATEGORY[p])
  );

  // Filter resources; fall back to all if no match
  const candidates = targetCategories.size > 0
    ? resources.filter((r) => targetCategories.has(r.category))
    : resources;

  if (candidates.length === 0) return null;

  const resource = pickByDay(candidates);

  return <NearbyResourceCard resource={resource} />;
}

type CardProps = { resource: Resource };

function NearbyResourceCard({ resource }: CardProps) {
  const mapsScale = useSharedValue(1);
  const phoneScale = useSharedValue(1);

  const mapsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mapsScale.value }],
  }));

  const phoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phoneScale.value }],
  }));

  const categoryText = CATEGORY_TEXT[resource.category];
  const categoryBg = CATEGORY_BG[resource.category];
  const categoryLabel = CATEGORY_LABEL[resource.category];

  return (
    <View
      className="bg-surface border border-border-surface rounded-2xl p-4 w-full"
      accessible={true}
      accessibilityLabel={`${resource.name}. ${resource.description}`}
    >
      {/* Top row: eyebrow + category pill */}
      <View className="flex-row items-center justify-between">
        <Text
          className="text-2xs font-medium uppercase tracking-wider text-text-muted"
          importantForAccessibility="no"
        >
          NEAR YOU
        </Text>

        <View
          style={{
            backgroundColor: categoryBg,
            borderRadius: radii.pill,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
          importantForAccessibility="no"
        >
          <Text
            style={{
              color: categoryText,
              fontSize: 10,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Org name */}
      <Text
        className="text-base font-medium text-text leading-tight mt-2"
        importantForAccessibility="no"
      >
        {resource.name}
      </Text>

      {/* Description */}
      <Text
        className="text-sm font-sans text-text-muted leading-5 mt-1"
        importantForAccessibility="no"
      >
        {resource.description}
      </Text>

      {/* Action chips row */}
      <View className="flex-row gap-2 mt-3">
        {/* Address chip */}
        <AnimatedPressable
          style={[
            mapsStyle,
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 8,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: colors.bg,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              flex: 1,
              minWidth: 0,
            },
          ]}
          onPressIn={() => { mapsScale.value = withSpring(0.95, spring.press); }}
          onPressOut={() => { mapsScale.value = withSpring(1, spring.press); }}
          onPress={() => openMaps(resource)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Get directions to ${resource.name}`}
        >
          <MapPin size={14} color={colors.primaryDeep} strokeWidth={2} />
          <Text
            style={{ color: colors.primaryDeep, fontSize: 14, fontWeight: '500', flex: 1 }}
            numberOfLines={1}
          >
            {resource.address}, {resource.city}
          </Text>
        </AnimatedPressable>

        {/* Phone chip */}
        <AnimatedPressable
          style={[
            phoneStyle,
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 8,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: colors.bg,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            },
          ]}
          onPressIn={() => { phoneScale.value = withSpring(0.95, spring.press); }}
          onPressOut={() => { phoneScale.value = withSpring(1, spring.press); }}
          onPress={() => openPhone(resource)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Call ${resource.name} at ${resource.phone}`}
        >
          <Phone size={14} color={colors.primaryDeep} strokeWidth={2} />
          <Text
            style={{ color: colors.primaryDeep, fontSize: 14, fontWeight: '500' }}
          >
            {resource.phone}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
