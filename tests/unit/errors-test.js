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
  NotFoundError,
  BadRequestError,
  ServerError,
  TimeoutError,
  AbortError,
  ConflictError,
  isAjaxError,
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
  isInvalidError,
  isBadRequestError,
  isServerError,
  isSuccess,
  isTimeoutError,
  isAbortError,
  isConflictError
} from 'ember-ajax/errors';

const { Error: EmberError } = Ember;

module('unit/errors-test - AjaxError');

test('AjaxError', function(assert) {
  const error = new AjaxError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof EmberError);
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

test('NotFoundError', function(assert) {
  const error = new NotFoundError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof NotFoundError);
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

test('TimeoutError', function(assert) {
  const error = new TimeoutError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof TimeoutError);
});

test('AbortError', function(assert) {
  const error = new AbortError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof AbortError);
});

test('ConflictError', function(assert) {
  const error = new ConflictError();
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ConflictError);
});

test('isUnauthorizedError: detects error code correctly', function(assert) {
  assert.ok(isUnauthorizedError(401));
});

test('isUnauthorizedError: detects error class correctly', function(assert) {
  const error = new UnauthorizedError();
  assert.ok(isUnauthorizedError(error));
});

test('isForbiddenError: detects error code correctly', function(assert) {
  assert.ok(isForbiddenError(403));
});

test('isForbiddenError: detects error class correctly', function(assert) {
  const error = new ForbiddenError();
  assert.ok(isForbiddenError(error));
});

test('isNotFoundError: detects error code correctly', function(assert) {
  assert.ok(isNotFoundError(404));
  assert.notOk(isNotFoundError(400));
});

test('isNotFoundError: detects error class correctly', function(assert) {
  const error = new NotFoundError();
  const otherError = new Error();
  assert.ok(isNotFoundError(error));
  assert.notOk(isNotFoundError(otherError));
});

test('isInvalidError: detects error code correctly', function(assert) {
  assert.ok(isInvalidError(422));
});

test('isInvalidError: detects error class correctly', function(assert) {
  const error = new InvalidError();
  assert.ok(isInvalidError(error));
});

test('isBadRequestError: detects error code correctly', function(assert) {
  assert.ok(isBadRequestError(400));
});

test('isBadRequestError: detects error class correctly', function(assert) {
  const error = new BadRequestError();
  assert.ok(isBadRequestError(error));
});

test('isServerError: detects error code correctly', function(assert) {
  assert.notOk(isServerError(499));
  assert.ok(isServerError(500));
  assert.ok(isServerError(599));
  assert.notOk(isServerError(600));
});

test('isAjaxError: detects error class correctly', function(assert) {
  const ajaxError = new AjaxError();
  const notAjaxError = new Error();
  const ajaxErrorSubtype = new BadRequestError();
  assert.ok(isAjaxError(ajaxError));
  assert.notOk(isAjaxError(notAjaxError));
  assert.ok(isAjaxError(ajaxErrorSubtype));
});

test('isServerError: detects error class correctly', function(assert) {
  const error = new ServerError();
  assert.ok(isServerError(error));
});

test('isTimeoutError: detects error class correctly', function(assert) {
  const error = new TimeoutError();
  assert.ok(isTimeoutError(error));
});

test('isAbortError: detects error class correctly', function(assert) {
  const error = new AbortError();
  assert.ok(isAbortError(error));
});

test('isConflictError: detects error code correctly', function(assert) {
  assert.ok(isConflictError(409));
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
