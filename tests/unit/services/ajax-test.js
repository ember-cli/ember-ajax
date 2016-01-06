import Ember from 'ember';
import {
  module,
  test
} from 'qunit';

import Service from 'ember-ajax/services/ajax';
import {
  InvalidError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ServerError
 } from 'ember-ajax/errors';

import Pretender from 'pretender';
import json from 'dummy/tests/helpers/json';

const { typeOf } = Ember;

let service, server;
module('service:ajax', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
    Ember.run(service, 'destroy');
  }
});

test('options() headers are set', function(assert) {

  service = Service.create({
    headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
  });

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

test('options() sets raw data', function(assert) {
  service = Service.create();

  const url = 'example.com';
  const type = 'GET';
  const ajaxOptions = service.options(url, { type, data: { key: 'value' } });

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

test('options() sets options correctly', function(assert) {
  service = Service.create();

  const url  = 'example.com';
  const type = 'POST';
  const data = JSON.stringify({ key: 'value' });
  const ajaxOptions = service.options(
    url,
    {
      type,
      data,
      contentType: 'application/json; charset=utf-8'
    }
  );

  assert.deepEqual(ajaxOptions, {
    contentType: 'application/json; charset=utf-8',
    context: service,
    data: '{"key":"value"}',
    dataType: 'json',
    type: 'POST',
    url: 'example.com'
  });
});

test('options() empty data', function(assert) {
  service = Service.create();

  const url = 'example.com';
  const type = 'POST';
  const ajaxOptions = service.options(url, { type });

  assert.deepEqual(ajaxOptions, {
    context: service,
    dataType: 'json',
    type: 'POST',
    url: 'example.com'
  });
});

test('options() type defaults to GET', function(assert) {
  service = Service.create();

  const url = 'example.com';
  const ajaxOptions = service.options(url);

  assert.equal(ajaxOptions.type, 'GET');
});

test('request() promise label is correct', function(assert) {
  service = Service.create();
  let url = '/posts';
  let data = {
    type: 'POST',
    data: {
      post: { title: 'Title', description: 'Some description.' }
    }
  };
  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(data.data)];

  server.get(url, () => serverResponse);
  server.post(url, () => serverResponse);

  const getPromise = service.request(url);
  assert.equal(getPromise._label, 'ember-ajax: GET to /posts');

  const postPromise = service.request(url, data);
  assert.equal(postPromise._label, 'ember-ajax: POST to /posts');
});

test('post() promise label is correct', function(assert) {
  service = Service.create();
  const url = '/posts';
  const title = 'Title';
  const description = 'Some description.';
  let options = {
    data: {
      post: { title, description }
    }
  };
  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(options.data)];

  server.post(url, () => serverResponse);

  const postPromise = service.post(url, options);
  assert.equal(postPromise._label, 'ember-ajax: POST to /posts');

  return postPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('put() promise label is correct', function(assert) {
  service = Service.create();
  const url = '/posts/1';
  const title = 'Title';
  const description = 'Some description.';
  const id = 1;
  const options = {
    data: {
      post: { id, title, description }
    }
  };

  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(options.data)];

  server.put(url, () => serverResponse);

  const putPromise = service.put(url, options);
  assert.equal(putPromise._label, 'ember-ajax: PUT to /posts/1');

  return putPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('patch() promise label is correct', function(assert) {
  service = Service.create();
  const url = '/posts/1';
  const description = 'Some description.';
  const options = {
    data: {
      post: { description }
    }
  };

  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(options.data)];

  server.patch(url, () => serverResponse);

  const patchPromise = service.patch(url, options);
  assert.equal(patchPromise._label, 'ember-ajax: PATCH to /posts/1');

  return patchPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('del() promise label is correct', function(assert) {
  service = Service.create();
  const url = '/posts/1';

  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

  server.delete(url, () => serverResponse);

  const delPromise = service.del(url);
  assert.equal(delPromise._label, 'ember-ajax: DELETE to /posts/1');

  return delPromise.then(function(response) {
    assert.deepEqual(response, {});
  });
});

test('options() host is set on the url (url starting with `/`', function(assert) {
  service = Service.create({ host: 'https://discuss.emberjs.com' });

  const url = '/users/me';
  const ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

test('options() host is set on the url (url not starting with `/`', function(assert) {
  service = Service.create({ host: 'https://discuss.emberjs.com' });

  const url = 'users/me';
  const ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

const errorHandlerTest = (status, errorClass) => {
  test(`${status} handler`, function(assert) {
    server.get('/posts', json(status));
    service = Service.create();
    return service.request('/posts')
      .then(function() {
        assert.ok(false, 'success handler should not be called');
      })
      .catch(function(reason) {
        assert.ok(reason instanceof errorClass);
        assert.ok(reason.errors && typeOf(reason.errors) === 'array',
          'has errors array');
      });
  });
};

errorHandlerTest(401, UnauthorizedError);
errorHandlerTest(403, ForbiddenError);
errorHandlerTest(422, InvalidError);
errorHandlerTest(400, BadRequestError);
errorHandlerTest(500, ServerError);
errorHandlerTest(502, ServerError);
errorHandlerTest(510, ServerError);
