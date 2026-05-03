import { LocateFixed, MapPin, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import * as haptics from '@/lib/haptics';
import { duration, ease, enter, spring, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

// ─── City pool ───────────────────────────────────────────────────────────────

const CITIES = [
  'Brooklyn, NY',
  'Atlanta, GA',
  'Detroit, MI',
  'Houston, TX',
  'Phoenix, AZ',
  'Los Angeles, CA',
  'Chicago, IL',
  'Memphis, TN',
  'Philadelphia, PA',
  'Newark, NJ',
  'New Orleans, LA',
  'Oakland, CA',
] as const;

const GEO_CITY = 'Brooklyn, NY';
const GEO_DETECT_MS = 800;

function suggest(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 3);
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = { onContinue: (data: { city: string; usedGeo: boolean }) => void };

export function StepLocation({ onContinue }: Props) {
  const reduced = useReducedMotion();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [usedGeo, setUsedGeo] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ready = query.trim().length >= 3;
  const suggestions = useMemo(
    () => (detecting || usedGeo ? [] : suggest(query)),
    [query, detecting, usedGeo],
  );

  // Continue button enable animation: scale pop + color cross-fade
  const continueProgress = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      continueProgress.value = withTiming(ready ? 1 : 0, { duration: duration.short });
    } else if (ready) {
      continueProgress.value = withSequence(
        withSpring(1.04, spring.bouncy),
        withSpring(1, spring.snap),
      );
    } else {
      continueProgress.value = withTiming(0, { duration: duration.short });
    }
  }, [ready, reduced, continueProgress]);

  const continueWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.98 + continueProgress.value * 0.02 }],
    opacity: 0.5 + continueProgress.value * 0.5,
  }));

  // Shimmer for "Finding you…" — a bar that sweeps across, not a spinner.
  const shimmerX = useSharedValue(-1);
  const shimmerFade = useSharedValue(0);

  useEffect(() => {
    if (detecting) {
      shimmerFade.value = withTiming(1, { duration: 120 });
      if (reduced) {
        // Reduced motion: gentle pulse instead of sweep
        shimmerX.value = 0;
        shimmerFade.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
      } else {
        shimmerX.value = -1;
        shimmerX.value = withRepeat(
          withTiming(1, { duration: 900, easing: ease.inOut }),
          -1,
          false,
        );
      }
    } else {
      cancelAnimation(shimmerX);
      cancelAnimation(shimmerFade);
      shimmerFade.value = withTiming(0, { duration: 160 });
    }
  }, [detecting, reduced, shimmerX, shimmerFade]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerFade.value,
    transform: [{ translateX: `${shimmerX.value * 100}%` }],
  }));

  const handleSelectSuggestion = (city: string) => {
    haptics.select();
    setQuery(city);
    setUsedGeo(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    haptics.tap();
    setQuery('');
    setUsedGeo(false);
    setDetecting(false);
    if (detectTimer.current) clearTimeout(detectTimer.current);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleUseGeo = () => {
    if (detecting) return;
    haptics.tap();
    setQuery('');
    setUsedGeo(false);
    setDetecting(true);
    inputRef.current?.blur();
    if (detectTimer.current) clearTimeout(detectTimer.current);
    detectTimer.current = setTimeout(() => {
      setDetecting(false);
      setQuery(GEO_CITY);
      setUsedGeo(true);
      haptics.success();
    }, GEO_DETECT_MS);
  };

  useEffect(
    () => () => {
      if (detectTimer.current) clearTimeout(detectTimer.current);
    },
    [],
  );

  const handleContinue = () => {
    if (!ready) return;
    onContinue({ city: query.trim(), usedGeo });
  };

  const headerEnter = reduced ? enter.fade(0) : enter.fadeUp(0);
  const inputEnter = reduced ? enter.fade(40) : enter.fadeUp(stagger(1, 80));
  const geoEnter = reduced ? enter.fade(80) : enter.fadeUp(stagger(2, 80));
  const reassureEnter = reduced ? enter.fade(120) : enter.fade(stagger(3, 80));

  return (
    <View style={styles.root}>
      {/* Header */}
      <Animated.View entering={headerEnter} style={styles.header}>
        <Text style={styles.title}>Where are you now?</Text>
        <Text style={styles.subtitle}>
          We use this to find help that&apos;s actually nearby.
        </Text>
      </Animated.View>

      {/* Input + suggestions */}
      <Animated.View entering={inputEnter}>
        <View
          style={[
            styles.inputCard,
            focused && !detecting ? styles.inputCardFocused : null,
            detecting ? styles.inputCardDetecting : null,
          ]}
        >
          <MapPin
            size={18}
            color={focused ? colors.primaryDeep : colors.textMuted}
            strokeWidth={1.75}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={detecting ? '' : query}
            onChangeText={(t) => {
              setQuery(t);
              setUsedGeo(false);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={detecting ? 'Finding you…' : 'Type your city'}
            placeholderTextColor={detecting ? colors.primaryDeep : colors.textSubtle}
            editable={!detecting}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="done"
            accessibilityLabel="Type your city"
          />
          {!detecting && query.length > 0 ? (
            <Pressable
              onPress={handleClear}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Clear city"
            >
              <X size={16} color={colors.textMuted} strokeWidth={1.75} />
            </Pressable>
          ) : null}

          {/* Shimmer bar — only visible while detecting */}
          <View pointerEvents="none" style={styles.shimmerTrack}>
            <Animated.View style={[styles.shimmerBar, shimmerStyle]} />
          </View>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <View style={styles.suggestList}>
            {suggestions.map((city, i) => (
              <SuggestionRow
                key={city}
                label={city}
                isLast={i === suggestions.length - 1}
                index={i}
                reduced={reduced}
                onPress={() => handleSelectSuggestion(city)}
              />
            ))}
          </View>
        ) : null}
      </Animated.View>

      {/* Geo row */}
      <Animated.View entering={geoEnter} style={styles.geoWrap}>
        <Pressable
          onPress={handleUseGeo}
          disabled={detecting}
          style={({ pressed }) => [
            styles.geoRow,
            pressed && !detecting ? styles.geoRowPressed : null,
            detecting ? styles.geoRowActive : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Use my current location instead"
          accessibilityState={{ busy: detecting }}
        >
          <LocateFixed
            size={16}
            color={detecting ? colors.primaryDeep : colors.textMuted}
            strokeWidth={1.75}
          />
          <Text
            style={[
              styles.geoLabel,
              detecting ? styles.geoLabelActive : null,
            ]}
          >
            {detecting ? 'Finding you…' : 'Use my current location instead'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Reassurance */}
      <Animated.View entering={reassureEnter}>
        <Text style={styles.reassure}>Your location is used here, not shared.</Text>
      </Animated.View>

      {/* Continue */}
      <View style={styles.continueWrap}>
        <Animated.View style={continueWrapStyle}>
          <Button
            label="Continue"
            onPress={handleContinue}
            disabled={!ready}
            fullWidth
          />
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Suggestion row ──────────────────────────────────────────────────────────

function SuggestionRow({
  label,
  isLast,
  index,
  reduced,
  onPress,
}: {
  label: string;
  isLast: boolean;
  index: number;
  reduced: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const entering = reduced
    ? enter.fade(stagger(index, 30))
    : enter.fadeUp(stagger(index, 40));

  return (
    <Animated.View entering={entering}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, spring.press);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring.press);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Choose ${label}`}
      >
        <Animated.View
          style={[
            styles.suggestRow,
            !isLast && styles.suggestRowDivider,
            animStyle,
          ]}
        >
          <MapPin size={14} color={colors.textSubtle} strokeWidth={1.75} />
          <Text style={styles.suggestText}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    fontFamily: 'Onest_600SemiBold',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    fontFamily: 'Onest_400Regular',
  },
  inputCard: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  inputCardFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputCardDetecting: {
    borderColor: colors.primarySoft,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Onest_400Regular',
    color: colors.text,
    paddingVertical: 0,
  },
  shimmerTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    overflow: 'hidden',
  },
  shimmerBar: {
    height: '100%',
    width: '60%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  suggestList: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  suggestRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  suggestText: {
    fontSize: 16,
    fontFamily: 'Onest_500Medium',
    color: colors.text,
  },
  geoWrap: {
    marginTop: 4,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 4,
  },
  geoRowPressed: {
    opacity: 0.6,
  },
  geoRowActive: {
    opacity: 1,
  },
  geoLabel: {
    fontSize: 14,
    fontFamily: 'Onest_400Regular',
    color: colors.textMuted,
  },
  geoLabelActive: {
    color: colors.primaryDeep,
    fontFamily: 'Onest_500Medium',
  },
  reassure: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    fontFamily: 'Onest_400Regular',
  },
  continueWrap: {
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 8,
  },
});
