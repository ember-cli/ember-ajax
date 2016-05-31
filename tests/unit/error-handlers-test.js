import Ember from 'ember';
import { module, test } from 'qunit';
import AjaxRequest from 'ember-ajax/ajax-request';
import {
  ConflictError,
  InvalidError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ServerError,
  isTimeoutError
} from 'ember-ajax/errors';
import Pretender from 'pretender';
import { jsonFactory } from 'dummy/tests/helpers/json';

const { typeOf } = Ember;

module('unit/error-handlers-test', {
  beforeEach() {
    this.server = new Pretender();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it handles a TimeoutError correctly', function(assert) {
  assert.expect(2);
  this.server.get('/posts', jsonFactory(200), 2);
  const service = new AjaxRequest();
  return service.request('/posts', { timeout: 1 })
    .then(function() {
      assert.ok(false, 'success handler should not be called');
    })
    .catch(function(reason) {
      assert.ok(isTimeoutError(reason), 'responded with a TimeoutError');
      assert.ok(reason.errors && typeOf(reason.errors) === 'array', 'has errors array');
    });
});

function errorHandlerTest(status, errorClass) {
  test(`${status} handler`, function(assert) {
    this.server.get('/posts', jsonFactory(status));
    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        assert.ok(false, 'success handler should not be called');
      })
      .catch(function(reason) {
        assert.ok(reason instanceof errorClass);
        assert.ok(reason.errors && typeOf(reason.errors) === 'array',
          'has errors array');
      });
  });
}

errorHandlerTest(401, UnauthorizedError);
errorHandlerTest(403, ForbiddenError);
errorHandlerTest(409, ConflictError);
errorHandlerTest(422, InvalidError);
errorHandlerTest(400, BadRequestError);
errorHandlerTest(500, ServerError);
errorHandlerTest(502, ServerError);
errorHandlerTest(510, ServerError);
