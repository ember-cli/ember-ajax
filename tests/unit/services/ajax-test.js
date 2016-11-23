import Ember from 'ember';
import Service from 'ember-ajax/services/ajax';

import { describeModule } from 'ember-mocha';
import { beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { equal } = assert;

import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

const { computed, run } = Ember;

let service, server;
describeModule('service:ajax', 'AJAX Service', function() {
  beforeEach(function() {
    server = new Pretender();
  });
  afterEach(function() {
    run(service, 'destroy');
    server.shutdown();
  });

  it('allows headers to be specified as a computed property', function() {
    server.get('example.com', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Content-Type'], 'application/json');
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const CustomService = Service.extend({
      headers: computed({
        get() {
          return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
        }
      })
    });
    service = CustomService.create();
    return service.request('example.com');
  });
});
