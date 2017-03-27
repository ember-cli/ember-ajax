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
    // Built-in Rule Config
    'prefer-const': 'error',

    // Ember Suave Rule Config
    'ember-suave/no-const-outside-module-scope': 'off'
  }
};
