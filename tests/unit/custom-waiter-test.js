import { module, test } from 'qunit';
import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

let server;
let requestMade = false;

function handleRequest() {
  requestMade = true;
  return jsonResponse();
}

module('Custom waiter', {
  beforeEach() {
    server = new Pretender();

    server.get('/test', handleRequest);
    server.post('/test', handleRequest);
  },
  afterEach() {
    server.shutdown();
    requestMade = false;
  }
});

test('an AJAX GET request can be waited on', function(assert) {
  assert.expect(1);

  const service = new AjaxRequest();
  service.request('/test');

  return wait().then(function() {
    assert.ok(requestMade, 'wait resolved after request was made');
  });
});

test('an AJAX POST request can be waited on', function(assert) {
  assert.expect(1);

  const service = new AjaxRequest();
  service.post('/test');

  return wait().then(function() {
    assert.ok(requestMade, 'wait resolved after request was made');
  });
});

test('a JSONP request can be waited on', function(assert) {
  assert.expect(1);

  let response;

  server.get('/jsonp', function(req) {
    return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
  });

  const ajax = new AjaxRequest();
  ajax.request('/jsonp', { dataType: 'jsonp' }).then((val) => response = val);
  return wait().then(() => {
    assert.deepEqual(response, { foo: 'bar' });
  });
});
