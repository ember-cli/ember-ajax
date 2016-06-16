import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual } = assert;

import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';

describe('JSONP Requests', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });
  afterEach(function() {
    this.server.shutdown();
  });

  it('it should make JSONP requests', function() {
    this.server.get('/jsonp', function(req) {
      return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
    });

    const ajax = new AjaxRequest();
    return ajax.request('/jsonp', {
      dataType: 'jsonp'
    })
    .then((value) => {
      deepEqual(value, { foo: 'bar' }, 'Promise resolved with correct value');
    });
  });
});
