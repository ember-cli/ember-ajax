module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    'browser': true
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'curly': 'error',
    'dot-notation': 'error',
    'eqeqeq': ['error', 'smart'],
    'guard-for-in': 'error',
    'no-caller': 'error',
    'no-eval': 'error',
    'no-plusplus': 'error',
    'wrap-iife': ['error', 'inside']
  }
};
