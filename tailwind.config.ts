import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial de Tents ("Airbnb Católico")
        // Fondo principal: Crema / Hueso
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F0',
          200: '#F4EFE3',
          300: '#EDE4D1',
          400: '#E2D5BC',
          DEFAULT: '#FAF7F0',
        },
        // Acentos: Rojo Carmesí (simulando tela de tiendas bíblicas / caridad / cruz)
        crimson: {
          50: '#FDF2F2',
          100: '#FBE8E8',
          200: '#F6D0D0',
          500: '#A31D1D', // Carmesí principal
          600: '#8A1515',
          700: '#6E1010',
          800: '#520B0B',
          DEFAULT: '#A31D1D',
        },
        // Estructurales: Marrón Madera (madera rústica, vigas de tienda, monasterios)
        wood: {
          100: '#F2EDE9',
          200: '#DECFC6',
          400: '#9E7860',
          500: '#6B4A34', // Madera principal
          600: '#543928',
          700: '#3E2A1E',
          800: '#2A1C14',
          DEFAULT: '#6B4A34',
        },
        // Textos: Gris oscuro / Negro (legibilidad y contraste litúrgico sobrio)
        ink: {
          muted: '#63625E',
          soft: '#3B3A36',
          DEFAULT: '#1E1E1C',
          dark: '#141412',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'tent': '0 4px 20px -2px rgba(107, 74, 52, 0.12), 0 2px 6px -1px rgba(107, 74, 52, 0.08)',
        'tent-lg': '0 10px 30px -4px rgba(107, 74, 52, 0.18), 0 4px 10px -2px rgba(107, 74, 52, 0.1)',
      },
      borderRadius: {
        'tent': '14px',
      }
    },
  },
  plugins: [],
};

export default config;
