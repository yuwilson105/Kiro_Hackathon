export const colors = {
  bg: '#FFFFFF',
  surface: '#EAF2FB',
  surfaceDeep: '#DCE8F5',
  primary: '#6FA8DC',
  primaryDeep: '#4A7DB0',
  primarySoft: '#A6C8E6',
  accent: '#F0B27A',
  accentDeep: '#D88947',
  accentSoft: '#F8D5B3',
  success: '#88B17A',
  successDeep: '#5F8A53',
  warning: '#E0B341',
  danger: '#C77B7B',
  dangerDeep: '#9E5252',
  text: '#1F2D3D',
  textMuted: '#6E7E8E',
  textSubtle: '#A6B0BC',
  textInverse: '#FFFFFF',
  border: '#C9D9EC',
  borderSurface: '#B8CDE5',
  borderSubtle: '#E5EDF6',
  shadow: 'rgba(31, 45, 61, 0.08)',
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const type = {
  fontFamily: {
    regular: 'Onest_400Regular',
    medium: 'Onest_500Medium',
    semibold: 'Onest_600SemiBold',
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    display: 44,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  fab: {
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;
