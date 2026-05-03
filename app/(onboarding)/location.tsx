import { router } from 'expo-router';
import { Check, MapPin, Navigation, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

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

  const inputRef = useRef<TextInput>(null);

  const results = selected ? [] : search(query);

  function handleSelect(city: City) {
    haptics.select();
    setSelected(city);
    setQuery('');
    setUseCurrentLocation(false);
  }

  function handleClear() {
    haptics.tap();
    setSelected(null);
    setQuery('');
    setUseCurrentLocation(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleUseCurrentLocation() {
    haptics.select();
    setUseCurrentLocation((prev) => {
      if (!prev) {
        setSelected(MOCK_LOCATION);
        setQuery('');
        return true;
      } else {
        setSelected(null);
        return false;
      }
    });
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
          ]}
        >
          <MapPin
            size={18}
            color={colors.textMuted}
            strokeWidth={1.75}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />

          {selected ? (
            <>
              <Text style={styles.selectedText} numberOfLines={1}>
                {cityLabel(selected)}
              </Text>
              <Pressable
                onPress={handleClear}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Clear selected city"
              >
                <X size={16} color={colors.textMuted} strokeWidth={1.75} />
              </Pressable>
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
            <Navigation
              size={16}
              color={useCurrentLocation ? colors.successDeep : colors.textMuted}
              strokeWidth={1.75}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text
              style={[
                styles.toggleLabel,
                useCurrentLocation && styles.toggleLabelActive,
              ]}
            >
              Use my current location instead
            </Text>
          </View>
          {useCurrentLocation && (
            <Check
              size={16}
              color={colors.successDeep}
              strokeWidth={2}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          )}
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
    fontFamily: 'Onest_500Medium',
    color: colors.text,
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
