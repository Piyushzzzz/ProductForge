/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1326',
        surface: {
          DEFAULT: '#0F172A',
          card: 'rgba(23, 31, 51, 0.75)',
          hover: 'rgba(30, 41, 59, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(99, 102, 241, 0.15)'
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        },
        cyanGlow: '#22d3ee',
        emeraldGlow: '#10b981'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        cyanGlow: '0 0 25px -5px rgba(34, 211, 238, 0.4)'
      }
    },
  },
  plugins: [],
}
