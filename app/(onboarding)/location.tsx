import { router } from 'expo-router';
import { Check, MapPin, Navigation, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import * as haptics from '@/lib/haptics';
import { enter, stagger } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { City } from '@/types/profile';

// ─── City data ───────────────────────────────────────────────────────────────

const US_CITIES: City[] = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Fresno', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Buffalo', state: 'NY' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Aurora', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Grand Rapids', state: 'MI' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Savannah', state: 'GA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Boston', state: 'MA' },
  { city: 'Worcester', state: 'MA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Tacoma', state: 'WA' },
  { city: 'Spokane', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Portland', state: 'OR' },
  { city: 'Eugene', state: 'OR' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Reno', state: 'NV' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'St. Paul', state: 'MN' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Memphis', state: 'TN' },
  { city: 'New Orleans', state: 'LA' },
  { city: 'Baton Rouge', state: 'LA' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Raleigh', state: 'NC' },
  { city: 'Cleveland', state: 'OH' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Cincinnati', state: 'OH' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Madison', state: 'WI' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'St. Louis', state: 'MO' },
  { city: 'Albuquerque', state: 'NM' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Birmingham', state: 'AL' },
];

const MOCK_LOCATION: City = { city: 'San Francisco', state: 'CA' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cityLabel(c: City) {
  return `${c.city}, ${c.state}`;
}

function search(query: string): City[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return US_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      cityLabel(c).toLowerCase().includes(q),
  ).slice(0, 5);
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LocationScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const reduced = useReducedMotion();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<City | null>(null);
  const [focused, setFocused] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = selected || detecting ? [] : search(query);

  // ── Pinging-ring animation around the pin while detecting ───────────────────
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);
  useEffect(() => {
    if (detecting && !reduced) {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(2.2, { duration: 1000, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false,
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 0 }),
          withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
      ringScale.value = 0.6;
      ringOpacity.value = 0;
    }
  }, [detecting, reduced, ringScale, ringOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  // Cleanup the detect timer on unmount.
  useEffect(
    () => () => {
      if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    },
    [],
  );

  // ── Toggle animation: cross-fade icon color, tween label color, scale-in check ──
  const toggleT = useSharedValue(0);
  useEffect(() => {
    const target = useCurrentLocation ? 1 : 0;
    toggleT.value = reduced
      ? target
      : withSpring(target, { damping: 18, stiffness: 220, mass: 0.6 });
  }, [useCurrentLocation, reduced, toggleT]);

  const navIconMutedStyle = useAnimatedStyle(() => ({
    opacity: 1 - toggleT.value,
  }));
  const navIconActiveStyle = useAnimatedStyle(() => ({
    opacity: toggleT.value,
  }));
  const toggleLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      toggleT.value,
      [0, 1],
      [colors.textMuted, colors.successDeep],
    ),
  }));
  const toggleCheckStyle = useAnimatedStyle(() => ({
    opacity: toggleT.value,
    transform: [
      { scale: interpolate(toggleT.value, [0, 1], [0.4, 1], 'clamp') },
    ],
  }));

  function cancelDetect() {
    if (detectTimerRef.current) {
      clearTimeout(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    setDetecting(false);
  }

  function handleSelect(city: City) {
    haptics.select();
    cancelDetect();
    setSelected(city);
    setQuery('');
    setUseCurrentLocation(false);
  }

  function handleClear() {
    haptics.tap();
    cancelDetect();
    setSelected(null);
    setQuery('');
    setUseCurrentLocation(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleUseCurrentLocation() {
    haptics.select();
    if (useCurrentLocation || detecting) {
      // Toggle off: cancel any in-flight detect, clear selection.
      cancelDetect();
      setUseCurrentLocation(false);
      setSelected(null);
      return;
    }
    // Toggle on: enter detecting state, then reveal after a short beat.
    setUseCurrentLocation(true);
    setSelected(null);
    setQuery('');
    setDetecting(true);
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    detectTimerRef.current = setTimeout(() => {
      detectTimerRef.current = null;
      setDetecting(false);
      setSelected(MOCK_LOCATION);
      haptics.success();
    }, reduced ? 0 : 900);
  }

  function handleContinue() {
    if (!selected) return;
    setProfile({ city: { city: selected.city, state: selected.state } });
    router.push('/(onboarding)/background');
  }

  const inputEntering = reduced ? enter.fade(0) : enter.fadeUp(stagger(0));
  const toggleEntering = reduced ? enter.fade(0) : enter.fadeUp(stagger(1, 80));
  const reassuranceEntering = reduced ? enter.fade(0) : enter.fade(stagger(2, 80));

  return (
    <OnboardingShell
      step={2}
      header="Where are you right now?"
      subtext="We use this to find real local resources near you: shelters, jobs, legal aid."
      onContinue={handleContinue}
      continueDisabled={!selected}
    >
      {/* Input card */}
      <Animated.View entering={inputEntering}>
        <View
          style={[
            styles.inputCard,
            focused && !selected ? styles.inputCardFocused : null,
            detecting ? styles.inputCardDetecting : null,
          ]}
        >
          <View style={styles.pinWrap}>
            <Animated.View
              pointerEvents="none"
              style={[styles.pinRing, ringStyle]}
            />
            <MapPin
              size={18}
              color={detecting ? colors.primary : colors.textMuted}
              strokeWidth={1.75}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>

          {detecting ? (
            <Animated.Text
              key="detecting"
              entering={FadeIn.duration(180).easing(Easing.out(Easing.quad))}
              style={styles.detectingText}
              numberOfLines={1}
            >
              Finding your location…
            </Animated.Text>
          ) : selected ? (
            <>
              <Animated.View
                key={cityLabel(selected)}
                style={{ flex: 1 }}
                entering={
                  reduced
                    ? FadeIn.duration(0)
                    : FadeIn.duration(280)
                        .easing(Easing.out(Easing.cubic))
                        .withInitialValues({ transform: [{ translateY: 6 }] })
                }
              >
                <Text style={styles.selectedText} numberOfLines={1}>
                  {cityLabel(selected)}
                </Text>
              </Animated.View>
              <Animated.View
                entering={
                  reduced
                    ? FadeIn.duration(0)
                    : FadeIn.delay(120).duration(220).easing(Easing.out(Easing.quad))
                }
              >
                <Pressable
                  onPress={handleClear}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear selected city"
                >
                  <X size={16} color={colors.textMuted} strokeWidth={1.75} />
                </Pressable>
              </Animated.View>
            </>
          ) : (
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setUseCurrentLocation(false);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search your city..."
              placeholderTextColor={colors.textSubtle}
              autoCorrect={false}
              autoCapitalize="words"
              accessibilityLabel="Search your city"
              returnKeyType="search"
            />
          )}
        </View>

        {/* Autocomplete results */}
        {results.length > 0 && (
          <View style={styles.resultsList}>
            {results.map((city, i) => {
              const rowEntering = reduced
                ? enter.fade(0)
                : enter.fadeUp(stagger(i, 30));
              return (
                <Animated.View key={cityLabel(city)} entering={rowEntering}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.resultRow,
                      i < results.length - 1 && styles.resultRowBorder,
                      pressed && styles.resultRowPressed,
                    ]}
                    onPress={() => handleSelect(city)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${cityLabel(city)}`}
                  >
                    <View style={styles.resultRowInner}>
                      <Text style={styles.resultCity} numberOfLines={1}>
                        {city.city}
                      </Text>
                      <Text style={styles.resultStateTag} numberOfLines={1}>
                        {city.state}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}
      </Animated.View>

      {/* Current location toggle */}
      <Animated.View entering={toggleEntering} style={styles.toggleRow}>
        <Pressable
          style={styles.toggleInner}
          onPress={handleUseCurrentLocation}
          accessibilityRole="switch"
          accessibilityLabel="Use my current location instead"
          accessibilityState={{ checked: useCurrentLocation }}
        >
          <View style={styles.toggleLeft}>
            <View style={styles.toggleIconWrap}>
              <Animated.View style={[styles.toggleIconLayer, navIconMutedStyle]}>
                <Navigation
                  size={16}
                  color={colors.textMuted}
                  strokeWidth={1.75}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </Animated.View>
              <Animated.View style={[styles.toggleIconLayer, navIconActiveStyle]}>
                <Navigation
                  size={16}
                  color={colors.successDeep}
                  strokeWidth={1.75}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </Animated.View>
            </View>
            <Animated.Text
              style={[
                styles.toggleLabel,
                useCurrentLocation && styles.toggleLabelActive,
                toggleLabelStyle,
              ]}
            >
              Use my current location instead
            </Animated.Text>
          </View>
          <Animated.View style={toggleCheckStyle}>
            <Check
              size={16}
              color={colors.successDeep}
              strokeWidth={2}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Reassurance text */}
      <Animated.View entering={reassuranceEntering} style={styles.reassurance}>
        <Text style={styles.reassuranceText}>
          Your location is only used to find resources. It is never shared.
        </Text>
      </Animated.View>
    </OnboardingShell>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  },
  inputCardFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputCardDetecting: {
    borderColor: colors.primarySoft,
  },
  pinWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  detectingText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Onest_400Regular',
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Onest_400Regular',
    color: colors.text,
    paddingVertical: 0,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Onest_500Medium',
    color: colors.text,
    includeFontPadding: false,
  },
  resultsList: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  resultRow: {
    minHeight: 56,
  },
  resultRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  resultRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  resultRowPressed: {
    backgroundColor: colors.surface,
  },
  resultCity: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Onest_500Medium',
    color: colors.text,
    letterSpacing: -0.2,
  },
  resultStateTag: {
    fontSize: 12,
    fontFamily: 'Onest_500Medium',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  toggleRow: {
    marginTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  toggleInner: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleIconWrap: {
    width: 16,
    height: 16,
  },
  toggleIconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Onest_400Regular',
    color: colors.textMuted,
    flexShrink: 1,
  },
  toggleLabelActive: {
    color: colors.successDeep,
    fontFamily: 'Onest_500Medium',
  },
  reassurance: {
    marginTop: 20,
  },
  reassuranceText: {
    fontSize: 12,
    fontFamily: 'Onest_400Regular',
    color: colors.textSubtle,
    lineHeight: 18,
  },
});
