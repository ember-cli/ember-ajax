module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: ['ember', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'prettier'
  ],
  env: {
    'browser': true
  },
  rules: {
    // Prettier config
    'prettier/prettier': ['error', {
      singleQuote: true,
      printWidth: 100
    }],

    // Built-in Rule Config
    'prefer-const': 'error'
  },
  overrides: [
    // node files
    {
      files: [
        './index.js',
        'testem.js',
        'ember-cli-build.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    },

    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true
      },
      rules: {
        // Useful for testing; not worried about leaking state
        'ember/avoid-leaking-state-in-ember-objects': 'off'
      }
    }
  ]
};
