module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'google',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
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
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
  ],
};
