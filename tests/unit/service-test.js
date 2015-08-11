import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import Service from 'ember-ajax/service';

let service;
module('service', {
  afterEach(){
    Ember.run(service, 'destroy');
  }
});

test('options() headers are set', function(assert){

  service = Service.create({
    headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
  });

  const url = 'example.com';
  const type = 'GET';
  var ajaxOptions = service.options(url, type, {});
  var receivedHeaders = [];
  var fakeXHR = {
    setRequestHeader: function(key, value) {
      receivedHeaders.push([key, value]);
    }
  };
  ajaxOptions.beforeSend(fakeXHR);
  assert.deepEqual(receivedHeaders, [['Content-Type', 'application/json'], ['Other-key', 'Other Value']], 'headers assigned');
});

test("options() do not serializes data when GET", function(assert) {
  service = Service.create();

  var url = 'example.com';
  var type = 'GET';
  var ajaxOptions = service.options(url, type, { data: { key: 'value' } });

  assert.deepEqual(ajaxOptions, {
    context: service,
    data: {
      key: 'value'
    },
    dataType: 'json',
    type: 'GET',
    url: 'example.com'
  });
});

test("options() serializes data when not GET", function(assert) {
  service = Service.create();

  var url = 'example.com';
  var type = 'POST';
  var ajaxOptions = service.options(url, type, { data: { key: 'value' } });

  assert.deepEqual(ajaxOptions, {
    contentType: "application/json; charset=utf-8",
    context: service,
    data: '{"key":"value"}',
    dataType: 'json',
    type: 'POST',
    url: 'example.com'
  });
});

test("options() empty data", function(assert) {
  service = Service.create();

  var url = 'example.com';
  var type = 'POST';
  var ajaxOptions = service.options(url, type, {});

  assert.deepEqual(ajaxOptions, {
    context: service,
    dataType: 'json',
    type: 'POST',
    url: 'example.com'
  });
});
