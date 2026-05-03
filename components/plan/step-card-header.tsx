import { Image } from 'expo-image';
import { View } from 'react-native';

import { CATEGORY_VISUAL, MILESTONE_ACCENT, STEP_IMAGE } from '@/lib/plan-visuals';
import type { StepCategory } from '@/types/plan';

type Props = {
  stepId: string;
  category: StepCategory;
  isMilestone?: boolean;
};

export function StepCardHeader({ stepId, category, isMilestone = false }: Props) {
  const visual = CATEGORY_VISUAL[category];
  const PrimaryIcon = visual.primary;

  // Per-step photo if registered, else fall back to the category default.
  const imageUrl = STEP_IMAGE[stepId] ?? visual.imageUrl;

  return (
    <View
      style={{
        width: '100%',
        height: 180,
        // Radius lives on the parent card via overflow-hidden, so this header
        // doesn't carry its own borderRadius. width 100% + fixed height avoids
        // the aspectRatio + maxHeight bug that was shrinking width on phones.
        overflow: 'hidden',
        backgroundColor: visual.gradientFrom,
      }}
    >
      {/* Fallback glyph: sits behind the Image and shows only if the Unsplash
          URL fails. With contentFit:cover, a successful load fully covers it. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PrimaryIcon
          size={48}
          strokeWidth={1.5}
          color={visual.primaryColor}
          style={{ opacity: 0.28 }}
        />
      </View>

      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        contentPosition={{ left: '50%', top: '30%' }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        transition={220}
      />

      {/* Bottom hairline */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isMilestone ? 2 : 1,
          backgroundColor: isMilestone ? MILESTONE_ACCENT : 'rgba(0,0,0,0.06)',
        }}
      />
    </View>
  );
}
