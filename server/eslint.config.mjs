import js from '@eslint/js';
import googleConfig from 'eslint-config-google';

export default [
  js.configs.recommended,
  googleConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Google standard is quite strict, so we'll relax a few rules
      'max-len': ['error', { 'code': 120 }], // Increase line length limit
      'indent': ['error', 2], // Use 2 spaces (Google uses 2)
      'object-curly-spacing': ['error', 'always'], // Spaces inside braces
      'require-jsdoc': 'off', // Don't require JSDoc for all functions
      'valid-jsdoc': 'off', // Don't validate JSDoc
      'camelcase': 'off', // Allow snake_case for API responses
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }], // Allow unused vars starting with _
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
    ],
  },
];
