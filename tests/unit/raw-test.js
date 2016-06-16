import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, equal, ok } = assert;

import Pretender from 'pretender';
import raw from 'ember-ajax/raw';

describe('raw', function() {
  beforeEach(function() {
    this.api = new Pretender();
  });
  afterEach(function() {
    this.api.shutdown();
  });

  it('raw() returns jqXHR', function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    this.api.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });
    return raw('/photos')
      .then(function(data) {
        deepEqual(data.response, photos, 'returned data is same as send data');
        ok(data.jqXHR, 'jqXHR is present');
        equal(data.textStatus, 'success', 'textStatus is success');
      });
  });

  it('raw() rejects promise when 404 is returned', function() {
    this.api.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    let errorCalled;
    return raw('/photos')
      .then(function() {
        errorCalled = false;
      })
      .catch(function(response) {
        const { errorThrown } = response;
        equal(errorThrown, 'Not Found');
        errorCalled = true;
      })
      .finally(function() {
        assert.equal(errorCalled, true, 'error handler was called');
      });
  });
});
