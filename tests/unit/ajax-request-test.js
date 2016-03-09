import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

let server;
module('AjaxRequest class', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('headers are set if the URL matches the host', function(assert) {
  assert.expect(2);

  server.get('http://example.com/test', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Content-Type'], 'application/json');
    assert.equal(requestHeaders['Other-key'], 'Other Value');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get host() {
      return 'http://example.com';
    }
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('http://example.com/test');
});

test('headers are set if the URL is relative', function(assert) {
  assert.expect(2);

  server.get('/some/relative/url', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Content-Type'], 'application/json');
    assert.equal(requestHeaders['Other-key'], 'Other Value');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('/some/relative/url');
});

test('headers are set if the URL matches one of the RegExp trustedHosts', function(assert) {
  assert.expect(1);

  server.get('http://my.example.com', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Other-key'], 'Other Value');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get host() {
      return 'some-other-host.com';
    }
    get trustedHosts() {
      return Ember.A([
        4,
        'notmy.example.com',
        /example\./
      ]);
    }
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('http://my.example.com');
});

test('headers are set if the URL matches one of the string trustedHosts', function(assert) {
  assert.expect(1);

  server.get('http://foo.bar.com', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Other-key'], 'Other Value');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get host() {
      return 'some-other-host.com';
    }
    get trustedHosts() {
      return Ember.A([
        'notmy.example.com',
        /example\./,
        'foo.bar.com'
      ]);
    }
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('http://foo.bar.com');
});

test('headers are not set if the URL does not match the host', function(assert) {
  assert.expect(1);

  server.get('http://example.com', (req) => {
    const { requestHeaders } = req;
    assert.notEqual(requestHeaders['Other-key'], 'Other Value');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get host() {
      return 'some-other-host.com';
    }
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('http://example.com');
});

test('headers can be supplied on a per-request basis', function(assert) {
  assert.expect(2);

  server.get('http://example.com', (req) => {
    const { requestHeaders } = req;
    assert.equal(requestHeaders['Per-Request-Key'], 'Some value', 'Request had per-request header');
    assert.equal(requestHeaders['Other-key'], 'Other Value', 'Request had default header');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get host() {
      return 'http://example.com';
    }
    get headers() {
      return { 'Content-Type': 'application/json', 'Other-key': 'Other Value' };
    }
  }
  const service = new RequestWithHeaders();
  return service.request('http://example.com', {
    headers: {
      'Per-Request-Key': 'Some value'
    }
  });
});

test('options() sets raw data', function(assert) {
  const service = new AjaxRequest();
  const url = 'test';
  const type = 'GET';
  const ajaxOptions = service.options(url, { type, data: { key: 'value' } });

  assert.deepEqual(ajaxOptions, {
    context: service,
    data: {
      key: 'value'
    },
    dataType: 'json',
    headers: {},
    type: 'GET',
    url: '/test'
  });
});

test('options() sets options correctly', function(assert) {
  const service = new AjaxRequest();
  const url  = 'test';
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
    headers: {},
    type: 'POST',
    url: '/test'
  });
});

test('options() empty data', function(assert) {
  const service = new AjaxRequest();
  const url = 'test';
  const type = 'POST';
  const ajaxOptions = service.options(url, { type });

  assert.deepEqual(ajaxOptions, {
    context: service,
    dataType: 'json',
    headers: {},
    type: 'POST',
    url: '/test'
  });
});

test('options() type defaults to GET', function(assert) {
  const service = new AjaxRequest();
  const url = 'test';
  const ajaxOptions = service.options(url);

  assert.equal(ajaxOptions.type, 'GET');
});

test('request() promise label is correct', function(assert) {
  const service = new AjaxRequest();
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
  assert.equal(getPromise._label, 'ember-ajax: GET /posts response');

  const postPromise = service.request(url, data);
  assert.equal(postPromise._label, 'ember-ajax: POST /posts response');
});

test('post() promise label is correct', function(assert) {
  const service = new AjaxRequest();
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
  assert.equal(postPromise._label, 'ember-ajax: POST /posts response');

  return postPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('put() promise label is correct', function(assert) {
  const service = new AjaxRequest();
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
  assert.equal(putPromise._label, 'ember-ajax: PUT /posts/1 response');

  return putPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('patch() promise label is correct', function(assert) {
  const service = new AjaxRequest();
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
  assert.equal(patchPromise._label, 'ember-ajax: PATCH /posts/1 response');

  return patchPromise.then(function(response) {
    assert.deepEqual(response.post, options.data.post);
  });
});

test('del() promise label is correct', function(assert) {
  const service = new AjaxRequest();
  const url = '/posts/1';
  const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

  server.delete(url, () => serverResponse);

  const delPromise = service.del(url);
  assert.equal(delPromise._label, 'ember-ajax: DELETE /posts/1 response');

  return delPromise.then(function(response) {
    assert.deepEqual(response, {});
  });
});

test('options() host is set on the url (url starting with `/`)', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
  }
  const service = new RequestWithHost();
  const url = '/users/me';
  const ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

test('options() host is set on the url (url not starting with `/`)', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
  }
  const service = new RequestWithHost();
  const url = 'users/me';
  const ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
});

test('options() host is overridable on a per-request basis', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
  }
  const service = new RequestWithHost();
  const url = 'users/me';
  const host = 'https://myurl.com';
  const ajaxoptions = service.options(url, { host });

  assert.equal(ajaxoptions.url, 'https://myurl.com/users/me');
});

test('explicit host in URL overrides host property of class', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
  }
  const service = new RequestWithHost();
  const url = 'http://myurl.com/users/me';
  const ajaxOptions = service.options(url);

  assert.equal(ajaxOptions.url, 'http://myurl.com/users/me');
});

test('explicit host in URL overrides host property in request config', function(assert) {
  const service = new AjaxRequest();
  const host = 'https://discuss.emberjs.com';
  const url = 'http://myurl.com/users/me';
  const ajaxOptions = service.options(url, { host });

  assert.equal(ajaxOptions.url, 'http://myurl.com/users/me');
});

test('explicit host in URL without a protocol does not override config property', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
  }
  const service = new RequestWithHost();
  const url = 'myurl.com/users/me';
  const ajaxOptions = service.options(url);

  assert.equal(ajaxOptions.url, 'https://discuss.emberjs.com/myurl.com/users/me');
});

test('options() namespace is set on the url (namespace starting with `/`)', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get namespace() {
      return '/api/v1';
    }
  }
  const service = new RequestWithHost();

  assert.equal(service.options('/users/me').url, '/api/v1/users/me', 'url starting with `/`)');
  assert.equal(service.options('users/me').url, '/api/v1/users/me', 'url not starting with `/`)');
});

test('options() namespace is set on the url (namespace not starting with `/`)', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get namespace() {
      return 'api/v1';
    }
  }
  const service = new RequestWithHost();

  assert.equal(service.options('/users/me').url, '/api/v1/users/me', 'url starting with `/`)');
  assert.equal(service.options('users/me').url, '/api/v1/users/me', 'url not starting with `/`)');
});

test('options() both host and namespace are set on the url', function(assert) {
  class RequestWithHost extends AjaxRequest {
    get host() {
      return 'https://discuss.emberjs.com';
    }
    get namespace() {
      return '/api/v1';
    }
  }
  const service = new RequestWithHost();
  const url = '/users/me';
  const ajaxoptions = service.options(url);

  assert.equal(ajaxoptions.url, 'https://discuss.emberjs.com/api/v1/users/me');
});

test('it can get the full header list from class and request options', function(assert) {
  class RequestWithHeaders extends AjaxRequest {
    get headers() {
      return {
        'Content-Type': 'application/vnd.api+json',
        'Other-Value': 'Some Value'
      };
    }
  }
  const service = new RequestWithHeaders();
  const headers = { 'Third-Value': 'Other Thing' };
  assert.equal(Object.keys(service._getFullHeadersHash()).length, 2, 'Works without options');
  assert.equal(Object.keys(service._getFullHeadersHash(headers)).length, 3, 'Includes passed-in headers');
  assert.equal(Object.keys(service.headers).length, 2, 'Provided headers did not change default ones');
});

test('it creates a detailed error message for unmatched server errors with an AJAX payload', function(assert) {
  assert.expect(3);

  const response = [408, { 'Content-Type': 'application/json' }, JSON.stringify(
    { errors: [ 'Some error response' ] }
  )];
  server.get('/posts', () => response);

  const service = new AjaxRequest();
  return service.request('/posts')
    .then(function() {
      assert.ok(false, 'success handler should not be called');
    })
    .catch(function(result) {
      assert.textContains(result.message, 'Some error response', 'Show payload as string');
      assert.textContains(result.message, 'GET', 'Show AJAX method');
      assert.textContains(result.message, '/posts', 'Show URL');
    });
});

test('it creates a detailed error message for unmatched server errors with a text payload', function(assert) {
  assert.expect(3);

  const response = [408, { 'Content-Type': 'text/html' }, 'Some error response'];
  server.get('/posts', () => response);

  const service = new AjaxRequest();
  return service.request('/posts')
    .then(function() {
      assert.ok(false, 'success handler should not be called');
    })
    .catch(function(result) {
      assert.textContains(result.message, 'Some error response', 'Show payload as string');
      assert.textContains(result.message, 'GET', 'Show AJAX method');
      assert.textContains(result.message, '/posts', 'Show URL');
    });
});

test('it throws an error when the user tries to use `.get` to make a request', function(assert) {
  assert.expect(3);

  const service = new AjaxRequest();

  assert.throws(function() {
    service.get('someProperty');
  }, 'Throws an error when using `.get` on the class with any property');

  assert.throws(function() {
    service.get('/users');
  }, 'Throws an error when using `.get` on the class with a relative URL');

  assert.throws(function() {
    service.get('/users', {});
  }, 'Throws an error when using `.get` with multiple parameters');
});

test('it JSON encodes JSON:API request data automatically', function(assert) {
  assert.expect(1);

  server.post('/test', ({ requestBody }) => {
    const { foo } = JSON.parse(requestBody);
    assert.equal(foo, 'bar', 'Recieved JSON-encoded data');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get headers() {
      return {
        'Content-Type': 'application/vnd.api+json'
      };
    }
  }
  const service = new RequestWithHeaders();
  return service.post('/test', {
    data: {
      foo: 'bar'
    }
  });
});

test('it JSON encodes JSON:API "extension" request data automatically', function(assert) {
  assert.expect(1);

  server.post('/test', ({ requestBody }) => {
    const { foo } = JSON.parse(requestBody);
    assert.equal(foo, 'bar', 'Recieved JSON-encoded data');
    return jsonResponse();
  });

  class RequestWithHeaders extends AjaxRequest {
    get headers() {
      return {
        'Content-Type': 'application/vnd.api+json; ext="ext1,ext2"'
      };
    }
  }
  const service = new RequestWithHeaders();
  return service.post('/test', {
    data: {
      foo: 'bar'
    }
  });
});

test('it does not remove trailing slashes, when building a relative url', function(assert) {
  assert.expect(3);

  class AjaxRequestWithNamespace extends AjaxRequest {
    get namespace() {
      return 'somenamespace/';
    }
  }

  let service = new AjaxRequest();
  let url = '/testurl';
  let options = { host: 'somehost' };
  let builtUrl = service._buildURL(url, options);
  assert.equal(builtUrl, 'somehost/testurl');

  url = '/testurl/';
  builtUrl = service._buildURL(url, options);
  assert.equal(builtUrl, 'somehost/testurl/');

  service = new AjaxRequestWithNamespace();
  builtUrl = service._buildURL(url, options);
  assert.equal(builtUrl, 'somehost/somenamespace/testurl/');
});
