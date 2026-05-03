import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlameLogo } from '@/components/animations/flame-logo';
import { generatePlanFromAPI } from '@/lib/api';
import { duration, enter } from '@/lib/motion';
import { generatePlan } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Plan } from '@/types/plan';

const SUBTEXT_LINES = [
  'Looking at what changed while you were away…',
  'Mapping out your first weeks…',
  'Finding real local resources near you…',
  'Getting ready.',
] as const;

const FADE_IN_MS = 250;
const HOLD_MS = 450;
const FADE_OUT_MS = 250;

export default function BuildingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const profile = useStore((s) => s.profile);
  const setPlan = useStore((s) => s.setPlan);
  const finishOnboarding = useStore((s) => s.finishOnboarding);

  const [lineIndex, setLineIndex] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigatedRef = useRef(false);

  // Fire the API call immediately on mount — don't wait for animation.
  const planPromiseRef = useRef<Promise<Plan>>(generatePlanFromAPI(profile));

  useEffect(() => {
    const push = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    const navigate = async () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      // Await the API call (may already be resolved if animation took longer).
      let plan: Plan = await planPromiseRef.current;

      // Fall back to local generator if API returned an empty plan.
      if (plan.weeks.length === 0) {
        plan = generatePlan(profile);
      }

      setPlan(plan);
      finishOnboarding();
      router.replace('/(tabs)');
    };

    // Reduced motion: skip straight to navigate after 600ms.
    if (reduced) {
      push(() => { void navigate(); }, 600);
      return () => timersRef.current.forEach(clearTimeout);
    }

    // Cycle through subtext lines with fade transitions.
    // Each line: FADE_IN_MS visible → HOLD_MS hold → FADE_OUT_MS exit → next line.
    // Line 0 is already visible from mount; schedule its fade-out first.
    let cursor = 0;

    SUBTEXT_LINES.forEach((_, i) => {
      if (i < SUBTEXT_LINES.length - 1) {
        // Schedule advance to next line after this line's hold + fade-out.
        cursor += FADE_IN_MS + HOLD_MS + FADE_OUT_MS;
        push(() => setLineIndex(i + 1), cursor);
      }
      // Last line: just hold until duration.building fires navigate.
    });

    // Navigate at total duration.building (2400ms).
    push(() => { void navigate(); }, duration.building);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      accessible
      accessibilityLabel="Building your plan based on what you shared."
      accessibilityLiveRegion="polite"
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Flame */}
      <FlameLogo size={140} loop={reduced ? false : true} />

      {/* Title */}
      <Animated.Text
        entering={enter.fadeUp(120)}
        style={{
          marginTop: 28,
          fontFamily: 'Onest_500Medium',
          fontSize: 24,
          color: colors.text,
          letterSpacing: -0.5,
        }}
      >
        Building your plan…
      </Animated.Text>

      {/* Subtext - keyed on lineIndex so Reanimated re-mounts with fresh anim */}
      {!reduced && (
        <Animated.Text
          key={lineIndex}
          entering={FadeIn.duration(FADE_IN_MS)}
          exiting={FadeOut.duration(FADE_OUT_MS)}
          style={{
            marginTop: 12,
            fontFamily: 'Onest_400Regular',
            fontSize: 14,
            color: colors.textMuted,
            textAlign: 'center',
            paddingHorizontal: 40,
            lineHeight: 20,
          }}
        >
          {SUBTEXT_LINES[lineIndex]}
        </Animated.Text>
      )}
    </View>
  );
}
