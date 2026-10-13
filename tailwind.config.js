/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#FEF2F2',
          100: '#FDE8E8',
          200: '#FBD0D0',
          300: '#F8A8A8',
          400: '#F07575',
          500: '#E63946',
          600: '#C8102E',
          700: '#A50D24',
          800: '#820A1D',
          900: '#5E0716',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FFF8DC',
          200: '#FFEEB3',
          300: '#FFE08A',
          400: '#FFD266',
          500: '#FFC72C',
          600: '#E0B019',
          700: '#B89012',
          800: '#8A6B0E',
          900: '#5C4708',
        },
        ink: {
          900: '#0D0D0D',
          800: '#1A1A1A',
          700: '#262626',
          600: '#333333',
          500: '#4D4D4D',
          400: '#666666',
          300: '#999999',
          200: '#CCCCCC',
          100: '#E6E6E6',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F8F4ED',
          200: '#F0E9DD',
          300: '#E6DCC8',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
        hanzi: ['"Noto Serif SC"', '"Ma Shan Zheng"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'flip': 'flipIn 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flipIn: {
          '0%': { opacity: '0', transform: 'rotateY(-90deg)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(200,16,46,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(200,16,46,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
