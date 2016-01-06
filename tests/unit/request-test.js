import {
  module,
  test
} from 'qunit';
import Pretender from 'pretender';
import request from 'ember-ajax/request';

let server;
module('request', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

// Replace this with your real tests.
test('request() produces data', function(assert) {
  const photos = [
    { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
    { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' }
  ];
  server.get('/photos', function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(photos)];
  });
  return request('/photos').then(function(data) {
    assert.deepEqual(data, photos);
  });
});

test('request() rejects promise when 404 is returned', function(assert) {
  assert.expect(3);
  server.get('/photos', function() {
    return [404, { 'Content-Type': 'application/json' }];
  });

  let errorCalled;
  return request('/photos')
    .then(function() {
      errorCalled = false;
    })
    .catch(function(response) {
      const { errorThrown, textStatus } = response;
      assert.equal(errorThrown, 'Not Found');
      assert.equal(textStatus, textStatus);
      errorCalled = true;
    })
    .finally(function() {
      assert.equal(errorCalled, true, 'error handler was called');
    });
});
