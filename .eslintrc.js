module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
  ],
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  env: {
    'browser': true
  },
  rules: {
    // Ember Suave
    'ember-suave/no-const-outside-module-scope': 'off',

    // Built-In Rules
    'prefer-const': 'error'
  }
};
