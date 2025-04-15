/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        dark: {
          DEFAULT: '#111827',
          lighter: '#1f2937',
          lightest: '#374151',
        },
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        lobster: ['var(--font-lobster)', 'cursive'],
      },
    },
  },
  plugins: [],
}; 