import {
  module,
  test
} from 'qunit';

import Ember from 'ember';
import {
  AjaxError,
  InvalidError,
  UnauthorizedError
} from 'ember-ajax/errors';

module("unit/errors-test - AjaxError");

test("AjaxError", function(assert) {
  var error = new AjaxError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof Ember.Error);
});

test("InvalidError", function(assert) {
  var error = new InvalidError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof InvalidError);
});

test("UnauthorizedError", function(assert){
  var error = new UnauthorizedError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof UnauthorizedError);
});
