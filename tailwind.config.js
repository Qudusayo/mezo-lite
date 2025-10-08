/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi-Regular', 'sans-serif'],
        satoshi: ['Satoshi-Regular', 'sans-serif'],
        satoshiMedium: ['Satoshi-Medium', 'sans-serif'],
        satoshiSemiBold: ['Satoshi-Bold', 'sans-serif'],
        satoshiBold: ['Satoshi-Black', 'sans-serif'],
      },
      colors: {
        primary: '#FFBB00',
        light: '#36363620',
        success: '#4CAF50',
        error: '#F44336',
      },
    },
  },
  plugins: [],
};
