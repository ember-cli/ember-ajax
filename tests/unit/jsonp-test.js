import {
  module,
  test
} from 'qunit';
import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';

let server;
module('JSONP Requests', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('it should make JSONP requests', function(assert) {
  assert.expect(1);

  server.get('/jsonp', function(req) {
    return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
  });

  const ajax = new AjaxRequest();
  return ajax.request('/jsonp', {
    dataType: 'jsonp'
  })
  .then((value) => {
    assert.deepEqual(value, { foo: 'bar' }, 'Promise resolved with correct value');
  });
});

