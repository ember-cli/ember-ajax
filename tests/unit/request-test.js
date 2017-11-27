import {
  describe,
  beforeEach,
  afterEach,
  it
} from 'mocha';
import { expect } from 'chai';

import { isNotFoundError } from 'ember-ajax/errors';
import Pretender from 'pretender';
import request from 'ember-ajax/request';

describe('request', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });
  afterEach(function() {
    this.server.shutdown();
  });

  it('produces data', function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    this.server.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });
    return request('/photos').then(function(data) {
      expect(data).to.deep.equal(photos);
    });
  });

  it('rejects promise when 404 is returned', function() {
    this.server.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    let errorCalled;
    return request('/photos')
      .then(function() {
        errorCalled = false;
      })
      .catch(function(response) {
        expect(isNotFoundError(response)).to.be.ok;
        errorCalled = true;
      })
      .finally(function() {
        expect(errorCalled).to.be.ok;
      });
  });
});
