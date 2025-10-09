import type { ESLintConfig } from 'eslint-define-config';

const config: ESLintConfig = {
  env: {
    browser: false,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser', // Typování pro TypeScript
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'], // ESLint plugin pro TypeScript
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended' // Používání doporučených pravidel
  ],
  rules: {
    // Přidání vlastních pravidel
    '@typescript-eslint/no-explicit-any': 'warn', // Varování při použití "any"
    '@typescript-eslint/no-unsafe-assignment': 'error', // Zakázání nebezpečných přiřazení
    '@typescript-eslint/no-unused-vars': 'warn'
  }
};

export default config;