import {
  module,
  test
} from 'qunit';
import Pretender from 'pretender';
import raw from 'ember-ajax/raw';
import {parseArgs} from 'ember-ajax/raw';

let api;
module('raw', {
  beforeEach() {
    api = new Pretender();
  },
  afterEach() {
    api.shutdown();
  }
});

// Replace this with your real tests.
test('raw() returns jqXHR', function(assert) {
  const photos = [
    { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
    { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif'}
  ];
  api.get('/photos', function(){
    return [200, {"Content-Type": "application/json"}, JSON.stringify(photos)];
  });
  return raw('/photos').then(function(data){
    assert.deepEqual(data.response, photos, 'returned data is same as send data');
    assert.ok(data.jqXHR, 'jqXHR is present');
    assert.equal(data.textStatus, 'success', 'textStatus is success');
  });
});

test('raw() rejects promise when 404 is returned', function(assert){
  assert.expect(3);
  api.get('/photos', function(){
    return [404, {"Content-Type": "application/json"}];
  });

  let errorCalled;
  return raw('/photos')
    .then(function(){
      errorCalled = false;
    })
    .catch(function(response){
      const { errorThrown, textStatus } = response;
      assert.equal(errorThrown, 'Not Found');
      assert.equal(textStatus, textStatus);
      errorCalled = true;
    })
    .finally(function(){
      assert.equal(errorCalled, true, "error handler was called");
    });
});

test('parseArgs', function(assert){
  assert.deepEqual(parseArgs('http://example.com'), { url: 'http://example.com' },
    'single string argument treated as url');
  assert.deepEqual(parseArgs({data: {}}), { data: {}}, 'hash treated as settings');
  assert.deepEqual(parseArgs('http://example.com', {data: {}}), {url: 'http://example.com', data: {}},
    'first argument (string) merged into second argument as url');
});
