/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          ink: '#0d0a08',
          coal: '#171310',
          stone: '#2a2320',
          iron: '#4a4340',
          steel: '#8b8078',
          ember: '#ff7a1a',
          gold: '#f0b429',
          blood: '#a3231f',
          mana: '#4aa3ff',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        emberrise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '20%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-120px) scale(0.4)', opacity: '0' },
        },
        forgepulse: {
          '0%,100%': { boxShadow: '0 0 0 rgba(255,122,26,0)' },
          '50%': { boxShadow: '0 0 24px rgba(255,122,26,.65)' },
        },
        cardin: {
          '0%': { transform: 'translateY(40px) rotate(-6deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        emberrise: 'emberrise 3.2s linear infinite',
        forgepulse: 'forgepulse 2.4s ease-in-out infinite',
        cardin: 'cardin .5s cubic-bezier(.2,.8,.2,1) both',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
