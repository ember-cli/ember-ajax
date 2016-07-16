import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';

import Pretender from 'pretender';
import raw from 'ember-ajax/raw';

describe('raw', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });
  afterEach(function() {
    this.server.shutdown();
  });

  it('returns jqXHR', function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    this.server.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });
    return raw('/photos')
      .then(function(data) {
        expect(data.response).to.deep.equal(photos);
        expect(data.jqXHR).to.be.ok;
        expect(data.textStatus).to.equal('success');
      });
  });

  it('rejects promise when 404 is returned', function() {
    this.server.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    let errorCalled;
    return raw('/photos')
      .then(function() {
        errorCalled = false;
      })
      .catch(function(response) {
        const { errorThrown } = response;
        expect(errorThrown).to.equal('Not Found');
        errorCalled = true;
      })
      .finally(function() {
        expect(errorCalled).to.be.ok;
      });
  });
});
