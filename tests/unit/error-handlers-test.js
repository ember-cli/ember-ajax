import Ember from 'ember';
import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { ok } = assert;

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

describe('unit/error-handlers-test', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });

  afterEach(function() {
    this.server.shutdown();
  });

  it('handles a TimeoutError correctly', function() {
    this.server.get('/posts', jsonFactory(200), 2);
    const service = new AjaxRequest();
    return service.request('/posts', { timeout: 1 })
      .then(function() {
        ok(false, 'success handler should not be called');
      })
      .catch(function(reason) {
        ok(isTimeoutError(reason), 'responded with a TimeoutError');
        ok(reason.errors && typeOf(reason.errors) === 'array', 'has errors array');
      });
  });

  function errorHandlerTest(status, errorClass) {
    it(`handles a ${status} response correctly`, function() {
      this.server.get('/posts', jsonFactory(status));
      const service = new AjaxRequest();
      return service.request('/posts')
        .then(function() {
          ok(false, 'success handler should not be called');
        })
        .catch(function(reason) {
          ok(reason instanceof errorClass);
          ok(reason.errors && typeOf(reason.errors) === 'array',
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
});
