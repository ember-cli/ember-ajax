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
  ServerError,
  isUnauthorized,
  isForbidden,
  isInvalid,
  isBadRequest,
  isServerError,
  isSuccess
} from 'ember-ajax/errors';

module('unit/errors-test - AjaxError');

test('AjaxError', function(assert) {
  const error = new AjaxError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof Ember.Error);
});

test('InvalidError', function(assert) {
  const error = new InvalidError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof InvalidError);
});

test('UnauthorizedError', function(assert) {
  const error = new UnauthorizedError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof UnauthorizedError);
});

test('ForbiddenError', function(assert) {
  const error = new ForbiddenError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ForbiddenError);
});

test('BadRequestError', function(assert) {
  const error = new BadRequestError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof BadRequestError);
});

test('ServerError', function(assert) {
  const error = new ServerError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ServerError);
});

test('detects unauthorized request correctly', function(assert) {
  assert.ok(isUnauthorized(401));
});

test('detects forbidden request correctly', function(assert) {
  assert.ok(isForbidden(403));
});

test('detects invalid request correctly', function(assert) {
  assert.ok(isInvalid(422));
});

test('detects bad request correctly', function(assert) {
  assert.ok(isBadRequest(400));
});

test('detects server error correctly', function(assert) {
  assert.notOk(isServerError(499));
  assert.ok(isServerError(500));
  assert.ok(isServerError(599));
  assert.notOk(isServerError(600));
});

test('detects successful request correctly', function(assert) {
  assert.notOk(isSuccess(100));
  assert.notOk(isSuccess(199));
  assert.ok(isSuccess(200));
  assert.ok(isSuccess(299));
  assert.notOk(isSuccess(300));
  assert.ok(isSuccess(304));
  assert.notOk(isSuccess(400));
  assert.notOk(isSuccess(500));
});
