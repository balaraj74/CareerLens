/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        primary: {
          DEFAULT: '#00E5FF',
          light: '#33EAFF',
          dark: '#00BFD9',
        },
        secondary: {
          DEFAULT: '#A57CFF',
          light: '#B896FF',
          dark: '#8A5CE6',
        },
        accent: {
          DEFAULT: '#00FFC6',
          light: '#33FFD1',
          dark: '#00D9A6',
        },
        dark: {
          DEFAULT: '#050816',
          lighter: '#0A0F24',
          card: '#0D1425',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 229, 255, 0.5)',
        'glow-lg': '0 0 40px rgba(0, 229, 255, 0.6)',
        'glow-purple': '0 0 20px rgba(165, 124, 255, 0.5)',
        'glow-accent': '0 0 20px rgba(0, 255, 198, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
