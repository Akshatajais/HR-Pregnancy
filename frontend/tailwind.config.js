/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#e0f2f1',
          DEFAULT: '#0d9488',
          dark: '#0f766e',
        },
        risk: {
          low: '#16a34a',
          moderate: '#eab308',
          high: '#dc2626',
        },
      },
      boxShadow: {
        card: '0 15px 35px rgba(15, 118, 110, 0.12)',
      },
    },
  },
  plugins: [],
}

