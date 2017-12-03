/* eslint-env node */

const isTesting = process.env['NODE_ENV'] === 'test';

module.exports = {
  browsers: isTesting
    ? ['last 1 Chrome versions']
    : ['ie 9', 'last 1 Chrome versions', 'last 1 Firefox versions', 'last 1 Safari versions']
};
