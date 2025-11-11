import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF6F61',
          50: '#FFF1EF',
          100: '#FFE2DE',
          200: '#FFC3BE',
          300: '#FFA49E',
          400: '#FF867F',
          500: '#FF6F61',
          600: '#E85F52',
          700: '#CC4F44',
          800: '#A83F36',
          900: '#7D2F28'
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}

export default config

