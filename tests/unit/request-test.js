import { describe, beforeEach, afterEach, it } from 'mocha';
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

  it('produces data', async function() {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
    ];
    this.server.get('/photos', function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
    });

    const data = await request('/photos');
    expect(data).to.deep.equal(photos);
  });

  it('rejects promise when 404 is returned', async function(done) {
    this.server.get('/photos', function() {
      return [404, { 'Content-Type': 'application/json' }];
    });

    try {
      await request('/photos');
    } catch (response) {
      expect(isNotFoundError(response)).to.be.ok;

      done();
    }
  });
});
