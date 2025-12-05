/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#fcb343', // ta couleur unique
      },
    },
  },
  plugins: [],

 
  extend: {
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    },
    keyframes: {
      'pulse-slow': {
        '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
        '50%': { opacity: '0.5', transform: 'scale(1.05)' },
      },
    },
    animation: {
      'pulse-slow': 'pulse-slow 6s ease-in-out infinite',
    },
  },
}

