module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  semi: true,
  jsxSingleQuote: false,
  bracketSpacing: true,
  arrowParens: 'always',
  singleAttributePerLine: false,

  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindAttributes: ['className'],
};
