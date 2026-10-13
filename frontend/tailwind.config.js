/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d19',
          900: '#0a192f',
          850: '#0e223f',
          800: '#112240',
          700: '#1e3a5f',
          600: '#234876'
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#f97316',
          veryHigh: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
