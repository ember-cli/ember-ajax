import {
  module,
  test
} from 'qunit';
import parseArgs from 'ember-ajax/utils/parse-args';

module('utils/parse-args');

test('ic-ajax compatible parsing', function(assert) {
  let args;

  // TODO: test that an assertion was raised
  args = parseArgs.call(null, { url: '/posts' });
  assert.deepEqual(args, ['/posts', undefined, {}], 'url is extracted');

  args = parseArgs.call(null, { url: '/posts', type: 'POST' });
  assert.deepEqual(args, ['/posts', 'POST', {}], 'type is extracted');

  args = parseArgs.call(null, { url: '/posts', method: 'POST' });
  assert.deepEqual(args, ['/posts', 'POST', {}], 'method is extracted');

  args = parseArgs.call(null, '/posts', { type: 'POST', data: {} });
  assert.deepEqual(args, ['/posts', 'POST', { data: {} }], 'type is extracted');

  args = parseArgs.call(null, '/posts', { method: 'POST', data: {} });
  assert.deepEqual(args, ['/posts', 'POST', { data: {} }], 'method is extracted');
});
