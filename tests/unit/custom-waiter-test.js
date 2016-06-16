import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, ok } = assert;

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

describe('Custom waiter', function() {
  beforeEach(function() {
    server = new Pretender();

    server.get('/test', handleRequest);
    server.post('/test', handleRequest);
  });
  afterEach(function() {
    server.shutdown();
    requestMade = false;
  });

  it('an AJAX GET request can be waited on', function() {
    const service = new AjaxRequest();
    service.request('/test');

    return wait().then(function() {
      ok(requestMade, 'wait resolved after request was made');
    });
  });

  it('an AJAX POST request can be waited on', function() {
    const service = new AjaxRequest();
    service.post('/test');

    return wait().then(function() {
      ok(requestMade, 'wait resolved after request was made');
    });
  });

  it('a JSONP request can be waited on', function() {
    let response;

    server.get('/jsonp', function(req) {
      return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
    });

    const ajax = new AjaxRequest();
    ajax.request('/jsonp', { dataType: 'jsonp' }).then((val) => response = val);
    return wait().then(() => {
      deepEqual(response, { foo: 'bar' });
    });
  });
});
