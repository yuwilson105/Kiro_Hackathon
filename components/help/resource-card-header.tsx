import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { RESOURCE_CATEGORY_VISUAL, imageUrlFor } from '@/lib/help-visuals';
import { colors } from '@/lib/theme';
import type { Resource } from '@/types/resource';

type Props = {
  resource: Pick<Resource, 'id' | 'category' | 'felonFriendly'>;
};

export function ResourceCardHeader({ resource }: Props) {
  const visual = RESOURCE_CATEGORY_VISUAL[resource.category];
  const PrimaryIcon = visual.primary;
  const imageUrl = imageUrlFor(resource);

  return (
    <View
      style={{
        width: '100%',
        height: 180,
        // Radius lives on the header itself - iOS won't reliably clip an
        // absolutely-positioned Image to an ancestor's borderRadius mask.
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        backgroundColor: visual.gradientFrom,
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        transition={220}
        cachePolicy="memory-disk"
        recyclingKey={resource.id}
      />

      {/* Subtle dark overlay so the badge stays readable on bright photos */}
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

      {/* Category icon chip — bottom-left. Kept because Picsum photos are
          random; the chip is the only at-a-glance category cue. */}
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

      {/* Felon-friendly chip — top-right, white pill, no green block */}
      {resource.felonFriendly ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.successDeep,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'Onest_500Medium',
              color: colors.text,
              letterSpacing: 0.2,
            }}
          >
            Felon-friendly
          </Text>
        </View>
      ) : null}
    </View>
  );
}
