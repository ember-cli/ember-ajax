import Ember from 'ember';
import Service from 'ember-ajax/services/ajax';
import { module, test } from 'qunit';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

const { computed } = Ember;

let service, server;
module('service:ajax', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    Ember.run(service, 'destroy');
    server.shutdown();
  }
});

test('allows headers to be specified as a computed property', function(assert) {
  assert.expect(2);

  server.get('example.com', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Content-Type'], 'application/json');
    assert.equal(requestHeaders['Other-key'], 'Other Value');
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
