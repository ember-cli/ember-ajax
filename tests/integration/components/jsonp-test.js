import {
  moduleForComponent,
  test
} from 'ember-qunit';

import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';
import wait from 'ember-test-helpers/wait';

let server;
moduleForComponent('JSONP with wait()', {
  integration: true,
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('wait works with JSONP requests', function(assert) {
  assert.expect(1);

  let response;

  server.get('/jsonp', function(req) {
    return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
  }, 1000);

  const ajax = new AjaxRequest();
  ajax.request('/jsonp', { dataType: 'jsonp' })
    .then((value) => response = value);
  return wait().then(() => {
    assert.deepEqual(response, { foo: 'bar' });
  });
});
