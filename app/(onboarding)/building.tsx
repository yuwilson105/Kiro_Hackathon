import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FlameLogo } from '@/components/animations/flame-logo';
import { generatePlan } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import { enter, duration, ease } from '@/lib/motion';
import { colors } from '@/lib/theme';

const SUBTEXT_LINES = [
  'Looking at what changed while you were away…',
  'Mapping out your first weeks…',
  'Finding real local resources near you…',
  'Getting ready.',
] as const;

const FADE_IN_MS = 250;
const HOLD_MS = 450;
const FADE_OUT_MS = 250;
const LINE_TOTAL_MS = FADE_IN_MS + HOLD_MS + FADE_OUT_MS; // 950ms per line

export default function BuildingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const profile = useStore((s) => s.profile);
  const setPlan = useStore((s) => s.setPlan);
  const finishOnboarding = useStore((s) => s.finishOnboarding);

  const [lineIndex, setLineIndex] = useState(0);
  const [lineVisible, setLineVisible] = useState(true);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigatedRef = useRef(false);

  const navigate = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    const plan = generatePlan(profile);
    setPlan(plan);
    finishOnboarding();
    router.replace('/(tabs)');
  };

  useEffect(() => {
    const push = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    // Reduced motion: skip straight to navigate after 600ms.
    if (reduced) {
      push(navigate, 600);
      return () => timersRef.current.forEach(clearTimeout);
    }

    // Cycle through subtext lines with fade transitions.
    // Line 0 is visible from mount. For lines 1-3, schedule fade-out → index
    // advance → fade-in. After all lines, navigate.
    let cursor = 0; // ms elapsed

    SUBTEXT_LINES.forEach((_, i) => {
      if (i === 0) {
        // Line 0 is already visible; schedule its fade-out.
        cursor += FADE_IN_MS + HOLD_MS;
        push(() => setLineVisible(false), cursor);
        cursor += FADE_OUT_MS;
        // Advance to next line and make it visible.
        push(() => {
          setLineIndex(1);
          setLineVisible(true);
        }, cursor);
      } else if (i < SUBTEXT_LINES.length - 1) {
        // Middle lines: schedule fade-out then advance.
        cursor += FADE_IN_MS + HOLD_MS;
        push(() => setLineVisible(false), cursor);
        cursor += FADE_OUT_MS;
        push(() => {
          setLineIndex(i + 1);
          setLineVisible(true);
        }, cursor);
      } else {
        // Last line: hold a bit, then navigate when total duration elapses.
        // The last line fades in; we navigate once duration.building completes.
      }
    });

    // Navigate at total duration.building (2400ms).
    push(navigate, duration.building);

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
          fontFamily: 'HankenGrotesk_500Medium',
          fontSize: 24,
          color: colors.text,
          letterSpacing: -0.5,
        }}
      >
        Building your plan…
      </Animated.Text>

      {/* Subtext — keyed on lineIndex so Reanimated re-mounts with fresh anim */}
      {!reduced && (
        <Animated.Text
          key={lineIndex}
          entering={FadeIn.duration(FADE_IN_MS)}
          exiting={FadeOut.duration(FADE_OUT_MS)}
          style={{
            marginTop: 12,
            fontFamily: 'HankenGrotesk_400Regular',
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
