import Ember from 'ember';
import Service from 'ember-ajax/services/ajax';
import { module, test } from 'qunit';

const { computed } = Ember;

let service;
module('service:ajax', {
  afterEach() {
    Ember.run(service, 'destroy');
  }
});

test('allows headers to be specified as a computed property', function(assert) {
  const CustomService = Service.extend({
    headers: computed({
      get() {
        return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
      }
    })
  });
  service = CustomService.create();
  const url = 'example.com';
  const type = 'GET';
  const ajaxOptions = service.options(url, { type });
  const receivedHeaders = [];
  const fakeXHR = {
    setRequestHeader(key, value) {
      receivedHeaders.push([key, value]);
    }
  };
  ajaxOptions.beforeSend(fakeXHR);
  assert.deepEqual(receivedHeaders, [['Content-Type', 'application/json'], ['Other-key', 'Other Value']], 'headers assigned');
});
