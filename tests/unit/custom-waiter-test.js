import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, ok } = assert;

import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

let requestMade = false;

function handleRequest() {
  requestMade = true;
  return jsonResponse();
}

describe('Custom waiter', function() {
  beforeEach(function() {
    this.server = new Pretender();

    this.server.get('/test', handleRequest);
    this.server.post('/test', handleRequest);
  });
  afterEach(function() {
    this.server.shutdown();
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

    this.server.get('/jsonp', function(req) {
      return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
    });

    const ajax = new AjaxRequest();
    ajax.request('/jsonp', { dataType: 'jsonp' }).then((val) => response = val);
    return wait().then(() => {
      deepEqual(response, { foo: 'bar' });
    });
  });
});
