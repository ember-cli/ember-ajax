import Ember from 'ember';
import Service from 'ember-ajax/services/ajax';
import { module, test } from 'qunit';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

const { computed, run } = Ember;

let service, server;
module('service:ajax', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    run(service, 'destroy');
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

test('it throws an error when the user tries to use `.get` to make a request', function(assert) {
  assert.expect(3);

  service = Service.create({
    someProperty: 'some value'
  });

  assert.equal(service.get('someProperty'), 'some value', 'Retrieved a regular property');

  assert.throws(function() {
    service.get('/users');
  }, 'Throws an error when using `.get` on the class with a relative URL');

  assert.throws(function() {
    service.get('/users', {});
  }, 'Throws an error when using `.get` with multiple parameters');
});
