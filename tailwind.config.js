/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}", // ← ✅ Ajoute tous les fichiers Remix
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
