/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"depot-new-web"', '"depot-new"', 'sans-serif'],
      },
      colors: {
        judah: {
          black: '#121212',      // Preto Principal
          dark: '#363636',       // Cinza Escuro (Textos secundários fortes)
          medium: '#919191',     // O NOVO CINZA (Ótimo para legendas/inativos)
          light: '#CCCCCC',      // Cinza Claro (Bordas e detalhes sutis)
          white: '#e8e8e8',      // Branco Gelo
          pure: '#ffffff',       // Branco Puro
        }
      },
    },
  },
  plugins: [],
}