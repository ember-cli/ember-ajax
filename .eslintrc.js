module.exports = {
  extends: 'plugin:ember-suave/recommended',
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  env: {
    'browser': true
  },
  rules: {
    'ember-suave/no-const-outside-module-scope': 'off'
  }
};
