import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import storybook from 'eslint-plugin-storybook';
import importPlugin from 'eslint-plugin-import';

export default [
  // 1. Global Ignores
  {
    ignores: ['dist', 'node_modules', 'public'],
  },

  // 2. Base Configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...storybook.configs['flat/recommended'], // Storybook config

  // 3. Prettier Plugin
  prettierPlugin,

  // 4. TypeScript React Files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    // 5. Plugins & Rules
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      // --- React Hooks Rules ---
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // --- Custom Rules ---
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      'prettier/prettier': 'error',

      // --- Import Order Rule ---
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
