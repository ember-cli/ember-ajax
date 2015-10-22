import Ember from 'ember';
import {
  module,
  test
} from 'qunit';

import Service from 'ember-ajax/services/ajax';
import {
  InvalidError,
  UnauthorizedError,
  ForbiddenError
 } from 'ember-ajax/errors';

import Pretender from 'pretender';
import json from 'dummy/tests/helpers/json';

const { typeOf } = Ember;

let service, server;
module('service:ajax', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach(){
    server.shutdown();
    Ember.run(service, 'destroy');
  }
});

test('options() headers are set', function(assert){

  service = Service.create({
    headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
  });

  const url = 'example.com';
  const type = 'GET';
  var ajaxOptions = service.options(url, { type: type });
  var receivedHeaders = [];
  var fakeXHR = {
    setRequestHeader: function(key, value) {
      receivedHeaders.push([key, value]);
    }
  };
  ajaxOptions.beforeSend(fakeXHR);
  assert.deepEqual(receivedHeaders, [['Content-Type', 'application/json'], ['Other-key', 'Other Value']], 'headers assigned');
});

test("options() sets raw data", function(assert) {
  service = Service.create();

  var url = 'example.com';
  var type = 'GET';
  var ajaxOptions = service.options(url, { type: type, data: { key: 'value' } });

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

test("options() sets options correctly", function(assert) {
  service = Service.create();

  var url  = 'example.com';
  var type = 'POST';
  var data = JSON.stringify({ key: 'value' });
  var ajaxOptions = service.options(
    url,
    {
      type: type,
      data: data,
      contentType: "application/json; charset=utf-8"
    }
  );

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
  var ajaxOptions = service.options(url, { type: type });

  assert.deepEqual(ajaxOptions, {
    context: service,
    dataType: 'json',
    type: 'POST',
    url: 'example.com'
  });
});

test("options() type defaults to GET", function(assert) {
  service = Service.create();

  var url = 'example.com';
  var ajaxOptions = service.options(url);

  assert.equal(ajaxOptions.type, 'GET');
});

test("request() promise label is correct", function(assert) {
  service = Service.create();
  const url = '/posts';
  const data = {
    type: 'POST',
    data: {
      post: { title: 'Title', description: 'Some description.' }
    }
  };
  const serverResponse = [200, { "Content-Type": "application/json" }, JSON.stringify(data.data)];

  server.get(url, () => serverResponse);
  server.post(url, () => serverResponse);

  var getPromise = service.request(url);
  assert.equal(getPromise._label, 'ember-ajax: GET to /posts');

  var postPromise = service.request(url, data);
  assert.equal(postPromise._label, 'ember-ajax: POST to /posts');
});

test("options() host is set on the url (url starting with `/`", function(assert) {
  service = Service.create({ host: 'https://discuss.emberjs.com' });

  var url = '/users/me';
  var ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

test("options() host is set on the url (url not starting with `/`", function(assert) {
  service = Service.create({ host: 'https://discuss.emberjs.com' });

  var url = 'users/me';
  var ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

const errorHandlerTest = ( status, errorClass ) => {
  test(`${status} handler`, function(assert){
    server.get('/posts', json(status));
    service = Service.create();
    return service.request('/posts')
      .then(function(){
        assert.ok(false, 'success handler should not be called');
      })
      .catch(function(reason){
        assert.ok(reason instanceof errorClass);
        assert.ok(reason.errors && typeOf(reason.errors) === 'array',
          "has errors array");
      });
  });
};

errorHandlerTest(401, UnauthorizedError);
errorHandlerTest(403, ForbiddenError);
errorHandlerTest(422, InvalidError);
