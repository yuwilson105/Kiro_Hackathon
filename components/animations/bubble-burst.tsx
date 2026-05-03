import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ─── Physics constants ────────────────────────────────────────────────────────
const MAX_PARTICLES = 16;
const UPWARD_ACCEL = -200; // px/s² - negative = upward float (anti-gravity)
const DRIFT_AMPLITUDE = 8; // ±8 px horizontal sine drift
const DRIFT_PERIOD_MS = 600; // ms per sine cycle

// ─── Module-scope particle data (never recreated in render) ──────────────────
type ParticleSeed = {
  angleRad: number; // full 360° random launch angle
  speed: number; // 80–180 px/s (gentle - bubbles are lighter than confetti)
  radius: number; // 4–9 px
  driftOffset: number; // per-particle sine phase offset (0–2π)
};

const MODULE_SEEDS: ParticleSeed[] = Array.from({ length: MAX_PARTICLES }, () => ({
  angleRad: Math.random() * 2 * Math.PI,
  speed: 80 + Math.random() * 100,
  radius: 4 + Math.random() * 5,
  driftOffset: Math.random() * 2 * Math.PI,
}));

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  width: number;
  height: number;
  originX: number;
  originY: number;
  color?: string;
  particleCount?: number;
  duration?: number;
  trigger?: number;
};

// ─── Single bubble rendered inside Canvas ────────────────────────────────────
type BubbleProps = {
  seed: ParticleSeed;
  progress: ReturnType<typeof useSharedValue<number>>;
  originX: number;
  originY: number;
  color: string;
  lifetime: number;
};

function Bubble({ seed, progress, originX, originY, color, lifetime }: BubbleProps) {
  // Decompose launch velocity into x/y components
  const vx = seed.speed * Math.cos(seed.angleRad);
  const vy = seed.speed * Math.sin(seed.angleRad);

  // cx: initial vx spread + sine drift over time
  const cx = useDerivedValue(() => {
    const t = (progress.value * lifetime) / 1000;
    const drift = DRIFT_AMPLITUDE * Math.sin((2 * Math.PI * t * 1000) / DRIFT_PERIOD_MS + seed.driftOffset);
    return originX + vx * t + drift;
  });

  // cy: initial vy spread + upward acceleration (negative = rising in RN screen coords)
  const cy = useDerivedValue(() => {
    const t = (progress.value * lifetime) / 1000;
    return originY + vy * t + 0.5 * UPWARD_ACCEL * t * t;
  });

  // Opacity: linear 1 → 0 over full lifetime
  const opacity = useDerivedValue(() => Math.max(0, 1 - progress.value));

  // Radius: shrinks from seed.radius → seed.radius * 0.4 over lifetime
  const r = useDerivedValue(() => seed.radius * (1 - 0.6 * progress.value));

  return (
    <Group opacity={opacity}>
      <Circle cx={cx} cy={cy} r={r} color={color} />
    </Group>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BubbleBurst({
  width,
  height,
  originX,
  originY,
  color = '#F0B27A',
  particleCount = 16,
  duration = 900,
  trigger,
}: Props) {
  const reduced = useReducedMotion();
  const prevTrigger = useRef<number | undefined>(undefined);

  const count = Math.min(particleCount, MAX_PARTICLES);

  // Fixed 16 shared values - hooks must never be called conditionally
  const p0 = useSharedValue(0);
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);
  const p4 = useSharedValue(0);
  const p5 = useSharedValue(0);
  const p6 = useSharedValue(0);
  const p7 = useSharedValue(0);
  const p8 = useSharedValue(0);
  const p9 = useSharedValue(0);
  const p10 = useSharedValue(0);
  const p11 = useSharedValue(0);
  const p12 = useSharedValue(0);
  const p13 = useSharedValue(0);
  const p14 = useSharedValue(0);
  const p15 = useSharedValue(0);

  const progresses = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15];

  const triggerBurst = () => {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      progresses[i].value = 0;
    }
    for (let i = 0; i < count; i++) {
      progresses[i].value = withTiming(1, {
        duration,
        easing: Easing.linear,
      });
    }
  };

  // Fire on mount (if trigger is defined) and whenever trigger changes
  useEffect(() => {
    if (reduced) return;
    if (trigger === undefined) return;
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;
    triggerBurst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, reduced]);

  if (reduced) {
    return (
      <Canvas
        accessible={false}
        style={{ position: 'absolute', top: 0, left: 0, width, height }}
        pointerEvents="none"
      />
    );
  }

  return (
    <Canvas
      accessible={false}
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      pointerEvents="none"
    >
      {MODULE_SEEDS.slice(0, count).map((seed, i) => (
        <Bubble
          key={i}
          seed={seed}
          progress={progresses[i]}
          originX={originX}
          originY={originY}
          color={color}
          lifetime={duration}
        />
      ))}
    </Canvas>
  );
}
