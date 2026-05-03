import { Image } from 'expo-image';
import { View } from 'react-native';

import {
  CATEGORY_VISUAL,
  MILESTONE_ACCENT,
  MILESTONE_GHOST_ICON,
  STEP_IMAGE,
} from '@/lib/plan-visuals';
import type { StepCategory } from '@/types/plan';

type Props = {
  stepId: string;
  category: StepCategory;
  isMilestone?: boolean;
};

export function StepCardHeader({ stepId, category, isMilestone = false }: Props) {
  const visual = CATEGORY_VISUAL[category];
  const PrimaryIcon = visual.primary;
  const MilestoneIcon = MILESTONE_GHOST_ICON;

  // Per-step photo if registered, else fall back to the category default.
  const imageUrl = STEP_IMAGE[stepId] ?? visual.imageUrl;

  return (
    <View
      style={{
        aspectRatio: 16 / 9,
        maxHeight: 180,
        // No own border-radius: the parent card has rounded-2xl + overflow-hidden,
        // so we let it clip cleanly. Inner radii were creating misalignment with
        // the parent and a visible gap at the top corners.
        overflow: 'hidden',
        backgroundColor: visual.gradientFrom,
      }}
    >
      {/* Fallback glyph: shows if the Unsplash URL fails to load. The Image
          renders on top with contentFit:cover, so when the photo arrives it
          completely covers this layer. */}
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
        contentPosition="50% 30%"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        transition={220}
      />

      {/* Subtle dark overlay so the category badge stays readable */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(31,45,61,0.18)',
        }}
      />

      {/* Category badge — small white chip with the lucide icon */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.92)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PrimaryIcon size={16} strokeWidth={1.75} color={visual.primaryColor} />
      </View>

      {/* Milestone sparkle — top-right, subtle */}
      {isMilestone ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MilestoneIcon size={14} strokeWidth={1.75} color={MILESTONE_ACCENT} />
        </View>
      ) : null}

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
