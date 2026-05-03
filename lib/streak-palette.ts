// Streak-driven flame palette.
//
// Day 0 = current warm orange flame.
// Day 30+ = electric blue.
// Path: warm → coral/magenta → violet → cool indigo → electric blue.
// We hold chroma at every stop so intermediates never go muddy. Days between
// stops interpolate in OKLab (perceptually uniform), not RGB — RGB lerps
// through warm↔cool produce washed-out brown mids; OKLab preserves chroma.

export type FlamePalette = {
  outer: readonly [string, string, string, string, string];
  inner: readonly [string, string];
  halo: string;
};

type Stop = { day: number; palette: FlamePalette };

const STOPS: readonly Stop[] = [
  {
    day: 0,
    palette: {
      outer: ['#FFFAEB', '#FFE08A', '#FFAA48', '#FF6B2C', '#D44A1F'],
      inner: ['#FFFEF0', '#FFE08A'],
      halo: '#FFA64A',
    },
  },
  {
    day: 5,
    palette: {
      outer: ['#FFFAEB', '#FFDC8A', '#FF9E54', '#FF5C40', '#C83F46'],
      inner: ['#FFFEF0', '#FFDC8A'],
      halo: '#FF8C5A',
    },
  },
  {
    day: 10,
    palette: {
      outer: ['#FFF5EC', '#FFC894', '#FF7E78', '#E8447A', '#A8327A'],
      inner: ['#FFFCF0', '#FFC894'],
      halo: '#E85A8C',
    },
  },
  {
    day: 15,
    palette: {
      outer: ['#FFF0F0', '#F5B0C8', '#D87BB8', '#9C4ABF', '#6B2DA8'],
      inner: ['#FFFAF8', '#F5B0C8'],
      halo: '#B854C8',
    },
  },
  {
    day: 20,
    palette: {
      outer: ['#F4F0FF', '#C8B0E8', '#8C7FD8', '#5A4FC8', '#3D2EA8'],
      inner: ['#FAF8FF', '#C8B0E8'],
      halo: '#6E5FD8',
    },
  },
  {
    day: 25,
    palette: {
      outer: ['#EEF2FF', '#A8C0F0', '#6E8AE8', '#3F5FD8', '#2541B8'],
      inner: ['#F4F8FF', '#A8C0F0'],
      halo: '#4C6EE0',
    },
  },
  {
    day: 30,
    palette: {
      outer: ['#F0F8FF', '#BCD8FF', '#5A8FFF', '#2E5BF0', '#1E3FA8'],
      inner: ['#F4FAFF', '#BCD8FF'],
      halo: '#3B5BDB',
    },
  },
];

// ── sRGB ↔ OKLab (Björn Ottosson) ────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function srgbToLin(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linToSrgb(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const R = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [linToSrgb(R), linToSrgb(G), linToSrgb(B)].map((c) =>
    Math.max(0, Math.min(1, c)),
  ) as [number, number, number];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const [la, aa, ba] = rgbToOklab(ar, ag, ab);
  const [lb, ab2, bb2] = rgbToOklab(br, bg, bb);
  const [r, g, blu] = oklabToRgb(la + (lb - la) * t, aa + (ab2 - aa) * t, ba + (bb2 - ba) * t);
  return rgbToHex(r, g, blu);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function paletteForStreak(days: number): FlamePalette {
  if (days <= 0) return STOPS[0].palette;
  if (days >= 30) return STOPS[STOPS.length - 1].palette;

  let i = 0;
  for (let k = 0; k < STOPS.length - 1; k++) {
    if (days >= STOPS[k].day && days < STOPS[k + 1].day) {
      i = k;
      break;
    }
  }
  const lo = STOPS[i];
  const hi = STOPS[i + 1];
  const t = (days - lo.day) / (hi.day - lo.day);

  return {
    outer: [
      lerpHex(lo.palette.outer[0], hi.palette.outer[0], t),
      lerpHex(lo.palette.outer[1], hi.palette.outer[1], t),
      lerpHex(lo.palette.outer[2], hi.palette.outer[2], t),
      lerpHex(lo.palette.outer[3], hi.palette.outer[3], t),
      lerpHex(lo.palette.outer[4], hi.palette.outer[4], t),
    ],
    inner: [
      lerpHex(lo.palette.inner[0], hi.palette.inner[0], t),
      lerpHex(lo.palette.inner[1], hi.palette.inner[1], t),
    ],
    halo: lerpHex(lo.palette.halo, hi.palette.halo, t),
  };
}
