import {
  module,
  test
} from 'qunit';
import {
  isUnauthorized,
  isForbidden,
  isInvalid,
  isBadRequest,
  isServerError,
  isSuccess
} from 'ember-ajax/utils/check-status-code';

module('utils/check-response');

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
