module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'prettier'
  ],
  env: {
    browser: true
  },
  globals: {
    FastBoot: true
  },
  rules: {
    'prettier/prettier': 'error',

    'ember/no-global-jquery': 'off',

    'no-console': 'off'
  },
  overrides: [
    // tests
    {
      env: {
        mocha: true
      },
      files: [
        'fastboot-tests/*-test.js',
        'tests/**/*.js'
      ],
      excludedFiles: [
        'tests/dummy/**/*.js',
        'fastboot-tests/fixtures/**/*.js'
      ],
      rules: {
        'ember/avoid-leaking-state-in-ember-objects': 'off'
      }
    },
    // node files
    {
      files: [
        'commitlint.config.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'fastboot-tests/*-test.js',
        'fastboot-tests/helpers/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon-test-support/**',
        'addon/**',
        'app/**',
        'fastboot-tests/fixtures/**/*.js',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
        'node/no-unpublished-require': 'off'
      })
    }
  ]
};
