import { Canvas, Group, RoundedRect } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// ─── Physics constants ───────────────────────────────────────────────────────
const GRAVITY = 600; // px/s² downward
const LIFETIME = 2200; // ms total per particle
const FADE_START = 1600; // ms - begin opacity fade
const FADE_DURATION = 600; // ms - fade from 1 → 0

// Particle colors: peach and sage only (per Leader 02 §9 / Leader 06)
const COLORS = ['#F0B27A', '#88B17A', '#F8D5B3', '#5F8A53'] as const;

// ─── Particle shape - cached at module scope (Skia rule: never in render) ───
// Built dynamically per particle since each has unique w/h; we cache the
// rect factory values inside particle data instead.

type ParticleData = {
  color: string;
  w: number;
  h: number;
  angleDeg: number; // ±60° from straight up
  speed: number; // 200–450 px/s
  delay: number; // staggered emit, 0–400ms
  startX: number; // near center ± 30px
  rotationDeg: number; // 360–720° total spin
};

// Pre-compute once at module scope - never inside the component or render
const MODULE_PARTICLES: ParticleData[] = Array.from({ length: 80 }, (_, i) => ({
  color: COLORS[i % COLORS.length],
  w: 5 + Math.random() * 2,
  h: 9 + Math.random() * 2,
  angleDeg: (Math.random() - 0.5) * 120,
  speed: 200 + Math.random() * 250,
  delay: Math.random() * 400,
  startX: 195 + (Math.random() - 0.5) * 60,
  rotationDeg: 360 + Math.random() * 360,
}));

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  particleCount?: number;
  duration?: number;
  width: number;
  height: number;
};

// ─── Single particle rendered inside the Canvas ───────────────────────────────
type ParticleItemProps = {
  p: ParticleData;
  progress: ReturnType<typeof useSharedValue<number>>;
  opacity: ReturnType<typeof useSharedValue<number>>;
  lifetime: number;
};

function ParticleItem({ p, progress, opacity, lifetime }: ParticleItemProps) {
  const angleRad = (p.angleDeg * Math.PI) / 180;
  const vx = p.speed * Math.sin(angleRad);
  const vy = -p.speed * Math.cos(angleRad);
  const startY = 80;

  const transform = useDerivedValue(() => {
    const t = (progress.value * lifetime) / 1000;
    const x = p.startX + vx * t;
    const y = startY + vy * t + 0.5 * GRAVITY * t * t;
    const rotate = ((progress.value * p.rotationDeg) / 180) * Math.PI;
    return [{ translateX: x }, { translateY: y }, { rotate }];
  });

  const particleOpacity = useDerivedValue(() => {
    const elapsed = progress.value * lifetime;
    const baseOpacity = opacity.value;
    if (elapsed < FADE_START) return baseOpacity;
    const fadeProgress = (elapsed - FADE_START) / FADE_DURATION;
    return Math.max(0, baseOpacity * (1 - fadeProgress));
  });

  return (
    <Group opacity={particleOpacity} transform={transform}>
      <RoundedRect x={-p.w / 2} y={-p.h / 2} width={p.w} height={p.h} r={1.5} color={p.color} />
    </Group>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ConfettiSkia({ particleCount = 80, duration = LIFETIME, width, height }: Props) {
  const reduced = useReducedMotion();

  // Stable particle data - cached in state so it never recreates across renders
  const [particles] = useState<ParticleData[]>(() =>
    MODULE_PARTICLES.slice(0, Math.min(particleCount, 80))
  );

  // One shared value per particle (hooks must not be called conditionally)
  const p0 = useSharedValue(0); const o0 = useSharedValue(0);
  const p1 = useSharedValue(0); const o1 = useSharedValue(0);
  const p2 = useSharedValue(0); const o2 = useSharedValue(0);
  const p3 = useSharedValue(0); const o3 = useSharedValue(0);
  const p4 = useSharedValue(0); const o4 = useSharedValue(0);
  const p5 = useSharedValue(0); const o5 = useSharedValue(0);
  const p6 = useSharedValue(0); const o6 = useSharedValue(0);
  const p7 = useSharedValue(0); const o7 = useSharedValue(0);
  const p8 = useSharedValue(0); const o8 = useSharedValue(0);
  const p9 = useSharedValue(0); const o9 = useSharedValue(0);
  const p10 = useSharedValue(0); const o10 = useSharedValue(0);
  const p11 = useSharedValue(0); const o11 = useSharedValue(0);
  const p12 = useSharedValue(0); const o12 = useSharedValue(0);
  const p13 = useSharedValue(0); const o13 = useSharedValue(0);
  const p14 = useSharedValue(0); const o14 = useSharedValue(0);
  const p15 = useSharedValue(0); const o15 = useSharedValue(0);
  const p16 = useSharedValue(0); const o16 = useSharedValue(0);
  const p17 = useSharedValue(0); const o17 = useSharedValue(0);
  const p18 = useSharedValue(0); const o18 = useSharedValue(0);
  const p19 = useSharedValue(0); const o19 = useSharedValue(0);
  const p20 = useSharedValue(0); const o20 = useSharedValue(0);
  const p21 = useSharedValue(0); const o21 = useSharedValue(0);
  const p22 = useSharedValue(0); const o22 = useSharedValue(0);
  const p23 = useSharedValue(0); const o23 = useSharedValue(0);
  const p24 = useSharedValue(0); const o24 = useSharedValue(0);
  const p25 = useSharedValue(0); const o25 = useSharedValue(0);
  const p26 = useSharedValue(0); const o26 = useSharedValue(0);
  const p27 = useSharedValue(0); const o27 = useSharedValue(0);
  const p28 = useSharedValue(0); const o28 = useSharedValue(0);
  const p29 = useSharedValue(0); const o29 = useSharedValue(0);
  const p30 = useSharedValue(0); const o30 = useSharedValue(0);
  const p31 = useSharedValue(0); const o31 = useSharedValue(0);
  const p32 = useSharedValue(0); const o32 = useSharedValue(0);
  const p33 = useSharedValue(0); const o33 = useSharedValue(0);
  const p34 = useSharedValue(0); const o34 = useSharedValue(0);
  const p35 = useSharedValue(0); const o35 = useSharedValue(0);
  const p36 = useSharedValue(0); const o36 = useSharedValue(0);
  const p37 = useSharedValue(0); const o37 = useSharedValue(0);
  const p38 = useSharedValue(0); const o38 = useSharedValue(0);
  const p39 = useSharedValue(0); const o39 = useSharedValue(0);
  const p40 = useSharedValue(0); const o40 = useSharedValue(0);
  const p41 = useSharedValue(0); const o41 = useSharedValue(0);
  const p42 = useSharedValue(0); const o42 = useSharedValue(0);
  const p43 = useSharedValue(0); const o43 = useSharedValue(0);
  const p44 = useSharedValue(0); const o44 = useSharedValue(0);
  const p45 = useSharedValue(0); const o45 = useSharedValue(0);
  const p46 = useSharedValue(0); const o46 = useSharedValue(0);
  const p47 = useSharedValue(0); const o47 = useSharedValue(0);
  const p48 = useSharedValue(0); const o48 = useSharedValue(0);
  const p49 = useSharedValue(0); const o49 = useSharedValue(0);
  const p50 = useSharedValue(0); const o50 = useSharedValue(0);
  const p51 = useSharedValue(0); const o51 = useSharedValue(0);
  const p52 = useSharedValue(0); const o52 = useSharedValue(0);
  const p53 = useSharedValue(0); const o53 = useSharedValue(0);
  const p54 = useSharedValue(0); const o54 = useSharedValue(0);
  const p55 = useSharedValue(0); const o55 = useSharedValue(0);
  const p56 = useSharedValue(0); const o56 = useSharedValue(0);
  const p57 = useSharedValue(0); const o57 = useSharedValue(0);
  const p58 = useSharedValue(0); const o58 = useSharedValue(0);
  const p59 = useSharedValue(0); const o59 = useSharedValue(0);
  const p60 = useSharedValue(0); const o60 = useSharedValue(0);
  const p61 = useSharedValue(0); const o61 = useSharedValue(0);
  const p62 = useSharedValue(0); const o62 = useSharedValue(0);
  const p63 = useSharedValue(0); const o63 = useSharedValue(0);
  const p64 = useSharedValue(0); const o64 = useSharedValue(0);
  const p65 = useSharedValue(0); const o65 = useSharedValue(0);
  const p66 = useSharedValue(0); const o66 = useSharedValue(0);
  const p67 = useSharedValue(0); const o67 = useSharedValue(0);
  const p68 = useSharedValue(0); const o68 = useSharedValue(0);
  const p69 = useSharedValue(0); const o69 = useSharedValue(0);
  const p70 = useSharedValue(0); const o70 = useSharedValue(0);
  const p71 = useSharedValue(0); const o71 = useSharedValue(0);
  const p72 = useSharedValue(0); const o72 = useSharedValue(0);
  const p73 = useSharedValue(0); const o73 = useSharedValue(0);
  const p74 = useSharedValue(0); const o74 = useSharedValue(0);
  const p75 = useSharedValue(0); const o75 = useSharedValue(0);
  const p76 = useSharedValue(0); const o76 = useSharedValue(0);
  const p77 = useSharedValue(0); const o77 = useSharedValue(0);
  const p78 = useSharedValue(0); const o78 = useSharedValue(0);
  const p79 = useSharedValue(0); const o79 = useSharedValue(0);

  // Stable arrays referencing the fixed shared values above
  const progresses = [
    p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,
    p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,
    p20,p21,p22,p23,p24,p25,p26,p27,p28,p29,
    p30,p31,p32,p33,p34,p35,p36,p37,p38,p39,
    p40,p41,p42,p43,p44,p45,p46,p47,p48,p49,
    p50,p51,p52,p53,p54,p55,p56,p57,p58,p59,
    p60,p61,p62,p63,p64,p65,p66,p67,p68,p69,
    p70,p71,p72,p73,p74,p75,p76,p77,p78,p79,
  ];
  const opacities = [
    o0,o1,o2,o3,o4,o5,o6,o7,o8,o9,
    o10,o11,o12,o13,o14,o15,o16,o17,o18,o19,
    o20,o21,o22,o23,o24,o25,o26,o27,o28,o29,
    o30,o31,o32,o33,o34,o35,o36,o37,o38,o39,
    o40,o41,o42,o43,o44,o45,o46,o47,o48,o49,
    o50,o51,o52,o53,o54,o55,o56,o57,o58,o59,
    o60,o61,o62,o63,o64,o65,o66,o67,o68,o69,
    o70,o71,o72,o73,o74,o75,o76,o77,o78,o79,
  ];

  useEffect(() => {
    if (reduced) return;
    particles.forEach((p, i) => {
      progresses[i].value = withDelay(
        p.delay,
        withTiming(1, { duration, easing: Easing.linear })
      );
      opacities[i].value = withDelay(
        p.delay,
        withTiming(1, { duration: 60, easing: Easing.out(Easing.quad) })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduced) {
    return <Canvas accessible={false} style={{ position: 'absolute', top: 0, left: 0, width, height }} />;
  }

  return (
    <Canvas
      accessible={false}
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
    >
      {particles.map((p, i) => (
        <ParticleItem
          key={i}
          p={p}
          progress={progresses[i]}
          opacity={opacities[i]}
          lifetime={duration}
        />
      ))}
    </Canvas>
  );
}
