import {
  module,
  test
} from 'qunit';
import ajax from 'ember-ajax';
import request from 'ember-ajax/request';

module('export');

// Replace this with your real tests.
test('ember-ajax exports request function', function(assert) {
    assert.equal(ajax, request);
});
