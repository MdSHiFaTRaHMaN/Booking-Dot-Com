/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        shopify: {
          green: '#96bf48',
          dark: '#004c3f',
        },
        dark: {
          bg: '#0B0F17',
          card: '#111827',
          border: '#1F2937',
          input: '#1E293B',
        }
      },
    },
  },
  plugins: [],
};
