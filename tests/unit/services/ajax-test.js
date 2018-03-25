import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import Service from 'ember-ajax/services/ajax';

import { setupTest } from 'ember-mocha';
import { beforeEach, afterEach, it, describe } from 'mocha';
import { assert } from 'chai';

const { equal } = assert;

import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

let service, server;
describe('AJAX Service', function() {
  setupTest('service:ajax');

  beforeEach(function() {
    server = new Pretender();
  });
  afterEach(function() {
    run(service, 'destroy');
    server.shutdown();
  });

  it('allows headers to be specified as a computed property', function() {
    server.get('/example.com', req => {
      const { requestHeaders } = req;
      equal(requestHeaders['Content-Type'], 'application/json');
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const CustomService = Service.extend({
      headers: computed({
        get() {
          return {
            'Content-Type': 'application/json',
            'Other-key': 'Other Value'
          };
        }
      })
    });
    service = CustomService.create();
    return service.request('example.com');
  });
});
