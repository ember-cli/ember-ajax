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

  it('returns jqXHR', async function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    this.server.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });

    const data = await raw('/photos');
    expect(data.response).to.deep.equal(photos);
    expect(data.jqXHR).to.be.ok;
    expect(data.textStatus).to.equal('success');
  });

  it('rejects promise when 404 is returned', async function(done) {
    this.server.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    try {
      await raw('/photos');
    } catch (response) {
      const { errorThrown } = response;
      expect(errorThrown).to.equal('Not Found');

      done();
    }
  });
});
