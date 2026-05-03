import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlameLogo } from '@/components/animations/flame-logo';
import { IconButton } from '@/components/ui/icon-button';
import { paletteForStreak } from '@/lib/streak-palette';
import { colors } from '@/lib/theme';

const STOPS = [0, 5, 10, 15, 20, 25, 30];
const INTERPOLATED = [3, 8, 12, 18, 22, 27];

function FlameCell({ days, label }: { days: number; label?: string }) {
  const palette = paletteForStreak(days);
  return (
    <View className="items-center gap-2" style={{ width: 96 }}>
      <View pointerEvents="none">
        <FlameLogo
          size={56}
          loop={true}
          outerColors={palette.outer}
          innerColors={palette.inner}
          haloHue={palette.halo}
        />
      </View>
      <Text className="font-serif text-2xl text-text leading-none">{days}</Text>
      <Text
        className="font-medium text-2xs uppercase tracking-wider"
        style={{ color: colors.textMuted }}
      >
        {label ?? `day ${days === 1 ? '' : 's'}`}
      </Text>
    </View>
  );
}

function HexSwatch({ hex }: { hex: string }) {
  return (
    <View className="items-center" style={{ width: 56 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: hex,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        }}
      />
      <Text
        className="font-sans text-[10px] mt-1"
        style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }}
      >
        {hex}
      </Text>
    </View>
  );
}

function PaletteRow({ days }: { days: number }) {
  const palette = paletteForStreak(days);
  return (
    <View className="flex-row gap-2 items-center">
      <Text
        className="font-medium text-sm"
        style={{ width: 56, color: colors.textMuted, fontVariant: ['tabular-nums'] }}
      >
        DAY {String(days).padStart(2, ' ')}
      </Text>
      {palette.outer.map((c, i) => (
        <HexSwatch key={`o-${i}`} hex={c} />
      ))}
      <View
        style={{ width: 1, height: 32, backgroundColor: colors.borderSubtle, marginHorizontal: 4 }}
      />
      <HexSwatch hex={palette.halo} />
    </View>
  );
}

export default function DevFlamePaletteScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-2 pb-4 flex-row items-center gap-3">
        <IconButton
          icon={<ChevronLeft size={22} color={colors.text} strokeWidth={1.75} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          size={36}
        />
        <Text className="font-medium text-xl text-text">Flame palette</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 32 }}>
        <View>
          <Text
            className="font-medium text-2xs uppercase tracking-wider mb-3"
            style={{ color: colors.textMuted }}
          >
            Stops (hand-picked)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 24 }}
          >
            {STOPS.map((d) => (
              <FlameCell key={d} days={d} />
            ))}
          </ScrollView>
        </View>

        <View>
          <Text
            className="font-medium text-2xs uppercase tracking-wider mb-3"
            style={{ color: colors.textMuted }}
          >
            Interpolated (between stops)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 24 }}
          >
            {INTERPOLATED.map((d) => (
              <FlameCell key={d} days={d} />
            ))}
          </ScrollView>
        </View>

        <View>
          <Text
            className="font-medium text-2xs uppercase tracking-wider mb-3"
            style={{ color: colors.textMuted }}
          >
            Hex map per stop
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ gap: 16 }}>
              {STOPS.map((d) => (
                <PaletteRow key={d} days={d} />
              ))}
            </View>
          </ScrollView>
          <Text
            className="font-sans text-xs mt-4"
            style={{ color: colors.textSubtle, lineHeight: 18 }}
          >
            5 outer-flame stops + halo hue per row. Inner-flame uses the first 2 outer columns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
