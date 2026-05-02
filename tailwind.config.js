/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#EAF2FB',
        surfaceDeep: '#DCE8F5',
        primary: {
          DEFAULT: '#6FA8DC',
          deep: '#4A7DB0',
          soft: '#A6C8E6',
        },
        accent: {
          DEFAULT: '#F0B27A',
          deep: '#D88947',
          soft: '#F8D5B3',
        },
        success: {
          DEFAULT: '#88B17A',
          deep: '#5F8A53',
        },
        warning: '#E0B341',
        danger: {
          DEFAULT: '#C77B7B',
          deep: '#9E5252',
        },
        text: {
          DEFAULT: '#1F2D3D',
          muted: '#6E7E8E',
          subtle: '#A6B0BC',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#C9D9EC',
          surface: '#B8CDE5',
          subtle: '#E5EDF6',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.6px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '22px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '30px', letterSpacing: '-0.5px' }],
        '3xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
        '4xl': ['32px', { lineHeight: '38px', letterSpacing: '-0.6px' }],
        display: ['44px', { lineHeight: '48px', letterSpacing: '-1px' }],
      },
      borderRadius: {
        pill: '999px',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
    },
  },
  plugins: [],
};
