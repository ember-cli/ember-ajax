import {
  module,
  test
} from 'qunit';

import Ember from 'ember';
import {
  AjaxError,
  InvalidError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ServerError
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

test("ForbiddenError", function(assert){
  var error = new ForbiddenError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ForbiddenError);
});

test("BadRequestError", function(assert) {
  var error = new BadRequestError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof BadRequestError);
});

test("ServerError", function(assert) {
  var error = new ServerError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ServerError);
});
