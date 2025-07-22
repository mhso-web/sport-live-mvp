/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          50: '#1a1a1a',
          100: '#171717',
          200: '#141414',
          300: '#111111',
          400: '#0e0e0e',
          500: '#0b0b0b',
          600: '#080808',
          700: '#050505',
          800: '#020202',
          900: '#000000',
        },
        // Gold accent colors
        gold: {
          50: '#fef9e8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Keep primary but adjust to gold theme
        primary: {
          50: '#fef9e8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 50%, #000000 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}