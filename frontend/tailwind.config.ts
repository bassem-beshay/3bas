import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#070707',
          900: '#0B0B0B',
          800: '#171717',
          700: '#262626',
          600: '#404040',
          500: '#525252',
          400: '#737373',
          300: '#A3A3A3',
          200: '#E5E5EA',
          100: '#F2F2F5',
          50: '#F9F9FB',
        },
        ecru: {
          DEFAULT: '#F7F7F5',
          dark: '#EFEFEA',
        },
        luxe: {
          gold: '#B89B72',
          sand: '#D8D1C5',
          bone: '#F4F3EF',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      letterSpacing: {
        editorial: '0.18em',
        luxury: '0.25em',
      },
      aspectRatio: {
        'fashion': '3 / 4',
        'portrait-tall': '2 / 3',
      }
    },
  },
  plugins: [],
};
export default config;
