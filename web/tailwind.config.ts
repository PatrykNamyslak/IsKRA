const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './collections/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /bg-gradient-to-(t|tr|r|br|b|bl|l|tl)/,
    },
    {
      pattern: /(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)(\/\d+)?/,
    },
    {
      pattern: /bg-clip-text/,
    },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e58500',
          hover: '#cc7700',
          orange: '#e58500',
          'orange-hover': '#cc7700',
        },
        iskra: {
          DEFAULT: '#e58500',
          hover: '#cc7700',
          orange: '#e58500',
          50: '#fffaf0',
          100: '#fef3dc',
          200: '#fde4b4',
          300: '#fccd82',
          400: '#faab47',
          500: '#e58500',
          600: '#cc7700',
          700: '#9f5600',
          800: '#753e05',
          900: '#4a2603',
        },
        grain: {
          1: '#d9d9d9',
          2: '#c6bda9',
          3: '#e7e7e7',
          bg: '#f5f5f7',
        },
      },
    },
  },
  plugins: [],
}

export default config
