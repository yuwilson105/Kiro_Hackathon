import { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Search, X } from 'lucide-react-native';

import { CategoryFilter, type CategoryOption } from '@/components/help/category-filter';
import { ResourceCard } from '@/components/help/resource-card';
import { Button } from '@/components/ui/button';
import { resources } from '@/lib/mock/resources';
import { enter } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Resource } from '@/types/resource';

export default function HelpScreen() {
  const city = useStore((s) => s.profile.city);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryOption>('all');
  const reduced = useReducedMotion();

  const filtered = useMemo<Resource[]>(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesCat = category === 'all' || r.category === category;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

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

  const titleText = city?.city ? `Help near ${city.city}` : 'Help near you';

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
              fontFamily: 'HankenGrotesk_400Regular',
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

      {/* D. RESOURCE LIST */}
      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <Text className="text-base font-medium text-text text-center">
            We're having trouble finding resources right now.
          </Text>
          <Text className="text-sm text-text-muted text-center leading-5">
            Try calling 211 — they can connect you to anything in your area.
          </Text>
          <Button
            label="Call 211"
            variant="outline"
            size="md"
            onPress={() => Linking.openURL('tel:211')}
          />
        </View>
      ) : (
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
      )}
    </View>
  );
}
