import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { CategoryFilter, type CategoryOption } from '@/components/help/category-filter';
import { ResourceCard } from '@/components/help/resource-card';
import { Button } from '@/components/ui/button';
import { findResourcesFromAPI } from '@/lib/api';
import { resources } from '@/lib/mock/resources';
import { ease, enter } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Resource } from '@/types/resource';

// ---------------------------------------------------------------------------
// Skeleton card — shown while resources are loading
// ---------------------------------------------------------------------------
function SkeletonCard() {
  const reduced = useReducedMotion();
  const shimmer = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700, easing: ease.snap }),
        withTiming(1, { duration: 700, easing: ease.snap }),
      ),
      -1,
      false,
    );
  }, [reduced, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <View className="bg-surface rounded-xl p-4 gap-3">
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-4 w-3/4" />
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-3 w-full" />
      <Animated.View style={shimmerStyle} className="bg-surfaceDeep rounded h-3 w-5/6" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function HelpScreen() {
  const profile = useStore((s) => s.profile);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryOption>('all');
  const [resourceList, setResourceList] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    findResourcesFromAPI(profile).then((result) => {
      setResourceList(result.length > 0 ? result : resources);
      setLoading(false);
    });
  }, []); // only on mount

  const filtered = useMemo<Resource[]>(() => {
    const q = query.trim().toLowerCase();
    return resourceList.filter((r) => {
      const matchesCat = category === 'all' || r.category === category;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [query, category, resourceList]);

  const renderItem = useCallback<ListRenderItem<Resource>>(({ item }) => {
    return <ResourceCard item={item} />;
  }, []);

  const keyExtractor = useCallback((item: Resource) => item.id, []);

  const CellRendererComponent = useCallback(
    ({ children, index, style, ...rest }: { children: React.ReactNode; index: number; style?: object }) => {
      const entering = reduced ? enter.fade(0) : enter.fadeUp(0);
      return (
        <Animated.View entering={entering} style={style} {...rest}>
          {children}
        </Animated.View>
      );
    },
    [reduced],
  );

  const ItemSeparatorComponent = useCallback(
    () => <View style={{ height: 12 }} />,
    [],
  );

  const titleText = profile.city?.city ? `Help near ${profile.city.city}` : 'Help near you';

  return (
    <View className="flex-1 bg-bg">
      {/* A. PAGE HEADER */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(0)}
        className="px-6 pt-16 pb-3"
      >
        <Text className="text-3xl font-medium text-text">{titleText}</Text>
        <Text className="text-sm text-text-muted mt-1">
          Real places, real hours, real people.
        </Text>
      </Animated.View>

      {/* B. SEARCH BAR */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(40)}
        className="mx-6 mb-3"
      >
        <View
          style={{
            height: 48,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <Search size={16} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or service..."
            placeholderTextColor={colors.textSubtle}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search resources by name or service"
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              fontFamily: 'Onest_400Regular',
            }}
          />
          {query.length > 0 ? (
            <Animated.View entering={enter.fade(0)}>
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={{ padding: 4 }}
              >
                <X size={16} color={colors.textMuted} strokeWidth={2} />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>

      {/* C. CATEGORY FILTER */}
      <Animated.View
        entering={reduced ? enter.fade(0) : enter.fadeUp(80)}
        className="mb-2"
      >
        <CategoryFilter selected={category} onSelect={setCategory} />
      </Animated.View>

      {/* D. SKELETON LOADING */}
      {loading && (
        <View className="flex-1 px-6 pt-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}

      {/* E. RESOURCE LIST */}
      {!loading && filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <Text className="text-base font-medium text-text text-center">
            We're having trouble finding resources right now.
          </Text>
          <Text className="text-sm text-text-muted text-center leading-5">
            Try calling 211. They can connect you to anything in your area.
          </Text>
          <Button
            label="Call 211"
            variant="outline"
            size="md"
            onPress={() => Linking.openURL('tel:211')}
          />
        </View>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <FlashList
          {...({
            data: filtered,
            renderItem,
            keyExtractor,
            estimatedItemSize: 180,
            contentContainerStyle: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 },
            ItemSeparatorComponent,
            CellRendererComponent,
            keyboardShouldPersistTaps: 'handled',
            keyboardDismissMode: 'on-drag',
          } as any)}
        />
      ) : null}
    </View>
  );
}
