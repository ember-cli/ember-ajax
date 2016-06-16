import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, equal, ok } = assert;

import { isNotFoundError } from 'ember-ajax/errors';
import Pretender from 'pretender';
import request from 'ember-ajax/request';

let server;
describe('request', function() {
  beforeEach(function() {
    server = new Pretender();
  });
  afterEach(function() {
    server.shutdown();
  });

  it('request() produces data', function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    server.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });
    return request('/photos').then(function(data) {
      deepEqual(data, photos);
    });
  });

  it('request() rejects promise when 404 is returned', function() {
    server.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    let errorCalled;
    return request('/photos')
      .then(function() {
        errorCalled = false;
      })
      .catch(function(response) {
        ok(isNotFoundError(response));
        errorCalled = true;
      })
      .finally(function() {
        equal(errorCalled, true, 'error handler was called');
      });
  });
});

