import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, equal, notEqual, ok, strictEqual, throws } = assert;

function textContains(full, part, message) {
  ok(full.indexOf(part) >= 0, message);
}

import Ember from 'ember';
import AjaxRequest from 'ember-ajax/ajax-request';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

const { A } = Ember;

describe('AjaxRequest', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });

  afterEach(function() {
    this.server.shutdown();
  });

  it('headers are set if the URL matches the host', function() {
    this.server.get('http://example.com/test', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Content-Type'], 'application/json');
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      host: 'http://example.com',
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('http://example.com/test');
  });

  it('headers are set if the URL is relative', function() {
    this.server.get('/some/relative/url', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Content-Type'], 'application/json');
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('/some/relative/url');
  });

  it('headers are set if the URL matches one of the RegExp trustedHosts', function() {
    this.server.get('http://my.example.com', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      host: 'some-other-host.com',
      trustedHosts: A([
        4,
        'notmy.example.com',
        /example\./
      ]),
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('http://my.example.com');
  });

  it('headers are set if the URL matches one of the string trustedHosts', function() {
    this.server.get('http://foo.bar.com', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      host: 'some-other-host.com',
      trustedHosts: A([
        'notmy.example.com',
        /example\./,
        'foo.bar.com'
      ]),
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('http://foo.bar.com');
  });

  it('headers are not set if the URL does not match the host', function() {
    this.server.get('http://example.com', (req) => {
      const { requestHeaders } = req;
      notEqual(requestHeaders['Other-key'], 'Other Value');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      host: 'some-other-host.com',
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('http://example.com');
  });

  it('headers can be supplied on a per-request basis', function() {
    this.server.get('http://example.com', (req) => {
      const { requestHeaders } = req;
      equal(requestHeaders['Per-Request-Key'], 'Some value', 'Request had per-request header');
      equal(requestHeaders['Other-key'], 'Other Value', 'Request had default header');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      host: 'http://example.com',
      headers: { 'Content-Type': 'application/json', 'Other-key': 'Other Value' }
    });

    const service = new RequestWithHeaders();
    return service.request('http://example.com', {
      headers: {
        'Per-Request-Key': 'Some value'
      }
    });
  });

  it('options() sets raw data', function() {
    const service = new AjaxRequest();
    const url = 'test';
    const type = 'GET';
    const ajaxOptions = service.options(url, { type, data: { key: 'value' } });

    deepEqual(ajaxOptions, {
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: {
        key: 'value'
      },
      dataType: 'json',
      headers: {},
      type: 'GET',
      url: '/test'
    });
  });

  it('options() sets options correctly', function() {
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

    deepEqual(ajaxOptions, {
      contentType: 'application/json; charset=utf-8',
      data: '{"key":"value"}',
      dataType: 'json',
      headers: {},
      type: 'POST',
      url: '/test'
    });
  });

  it('options() empty data', function() {
    const service = new AjaxRequest();
    const url = 'test';
    const type = 'POST';
    const ajaxOptions = service.options(url, { type });

    deepEqual(ajaxOptions, {
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      dataType: 'json',
      headers: {},
      type: 'POST',
      url: '/test'
    });
  });

  it('can override the default `contentType` for the service', function() {
    const defaultContentType = 'application/json';

    class AjaxServiceWithDefaultContentType extends AjaxRequest {
      get contentType() {
        return defaultContentType;
      }
    }

    const service = new AjaxServiceWithDefaultContentType();
    const options = service.options('');
    equal(options.contentType, defaultContentType);
  });

  it('options() type defaults to GET', function() {
    const service = new AjaxRequest();
    const url = 'test';
    const ajaxOptions = service.options(url);

    equal(ajaxOptions.type, 'GET');
  });

  it('request() promise label is correct', function() {
    const service = new AjaxRequest();
    let url = '/posts';
    let data = {
      type: 'POST',
      data: {
        post: { title: 'Title', description: 'Some description.' }
      }
    };
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(data.data)];

    this.server.get(url, () => serverResponse);
    this.server.post(url, () => serverResponse);

    const getPromise = service.request(url);
    equal(getPromise._label, 'ember-ajax: GET /posts response');

    const postPromise = service.request(url, data);
    equal(postPromise._label, 'ember-ajax: POST /posts response');
  });

  it('post() promise label is correct', function() {
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

    this.server.post(url, () => serverResponse);

    const postPromise = service.post(url, options);
    equal(postPromise._label, 'ember-ajax: POST /posts response');

    return postPromise.then(function(response) {
      deepEqual(response.post, options.data.post);
    });
  });

  it('put() promise label is correct', function() {
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

    this.server.put(url, () => serverResponse);

    const putPromise = service.put(url, options);
    equal(putPromise._label, 'ember-ajax: PUT /posts/1 response');

    return putPromise.then(function(response) {
      deepEqual(response.post, options.data.post);
    });
  });

  it('patch() promise label is correct', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const description = 'Some description.';
    const options = {
      data: {
        post: { description }
      }
    };

    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(options.data)];

    this.server.patch(url, () => serverResponse);

    const patchPromise = service.patch(url, options);
    equal(patchPromise._label, 'ember-ajax: PATCH /posts/1 response');

    return patchPromise.then(function(response) {
      deepEqual(response.post, options.data.post);
    });
  });

  it('del() promise label is correct', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.delete(url, () => serverResponse);

    const delPromise = service.del(url);
    equal(delPromise._label, 'ember-ajax: DELETE /posts/1 response');

    return delPromise.then(function(response) {
      deepEqual(response, {});
    });
  });

  it('delete() promise label is correct', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.delete(url, () => serverResponse);

    const deletePromise = service.delete(url);
    equal(deletePromise._label, 'ember-ajax: DELETE /posts/1 response');

    return deletePromise.then(function(response) {
      deepEqual(response, {});
    });
  });

  it('request with method option makes the correct type of request', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.get(url, () => {
      ok(false, 'Made a GET request');
      return serverResponse;
    });

    this.server.post(url, () => {
      ok(true, 'Made a POST request');
      return serverResponse;
    });

    return service.request(url, { method: 'POST' });
  });

  it('options() host is set on the url (url starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = '/users/me';
    const ajaxoptions = service.options(url);

    equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
  });

  it('options() host is set on the url (url not starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'users/me';
    const ajaxoptions = service.options(url);

    equal(ajaxoptions.url, 'https://discuss.emberjs.com/users/me');
  });

  it('options() host is overridable on a per-request basis', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'users/me';
    const host = 'https://myurl.com';
    const ajaxoptions = service.options(url, { host });

    equal(ajaxoptions.url, 'https://myurl.com/users/me');
  });

  it('explicit host in URL overrides host property of class', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'http://myurl.com/users/me';
    const ajaxOptions = service.options(url);

    equal(ajaxOptions.url, 'http://myurl.com/users/me');
  });

  it('explicit host in URL overrides host property in request config', function() {
    const service = new AjaxRequest();
    const host = 'https://discuss.emberjs.com';
    const url = 'http://myurl.com/users/me';
    const ajaxOptions = service.options(url, { host });

    equal(ajaxOptions.url, 'http://myurl.com/users/me');
  });

  it('explicit host in URL without a protocol does not override config property', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'myurl.com/users/me';
    const ajaxOptions = service.options(url);

    equal(ajaxOptions.url, 'https://discuss.emberjs.com/myurl.com/users/me');
  });

  it('options() namespace is set on the url (namespace starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      namespace: '/api/v1'
    });

    const service = new RequestWithHost();

    equal(service.options('/users/me').url, '/api/v1/users/me', 'url starting with `/`)');
    equal(service.options('users/me').url, '/api/v1/users/me', 'url not starting with `/`)');
  });

  it('namespace can be set on a per-request basis', function() {
    const service = new AjaxRequest();

    equal(service.options('users/me', { namespace: 'api' }).url, '/api/users/me', 'url contains namespace');
  });

  it('options() namespace is set on the url (namespace not starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      namespace: 'api/v1'
    });

    const service = new RequestWithHost();

    equal(service.options('/users/me').url, '/api/v1/users/me', 'url starting with `/`)');
    equal(service.options('users/me').url, '/api/v1/users/me', 'url not starting with `/`)');
  });

  it('options() both host and namespace are set on the url', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com',
      namespace: '/api/v1'
    });

    const service = new RequestWithHost();
    const url = '/users/me';
    const ajaxoptions = service.options(url);

    equal(ajaxoptions.url, 'https://discuss.emberjs.com/api/v1/users/me');
  });

  it('it can get the full header list from class and request options', function() {
    const RequestWithHeaders = AjaxRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Other-Value': 'Some Value'
      }
    });

    const service = new RequestWithHeaders();
    const headers = { 'Third-Value': 'Other Thing' };
    equal(Object.keys(service._getFullHeadersHash()).length, 2, 'Works without options');
    equal(Object.keys(service._getFullHeadersHash(headers)).length, 3, 'Includes passed-in headers');
    equal(Object.keys(service.headers).length, 2, 'Provided headers did not change default ones');
  });

  it('it creates a detailed error message for unmatched server errors with an AJAX payload', function() {
    expect(3);

    const response = [408, { 'Content-Type': 'application/json' }, JSON.stringify(
      { errors: [ 'Some error response' ] }
    )];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        ok(false, 'success handler should not be called');
      })
      .catch(function(result) {
        textContains(result.message, 'Some error response', 'Show payload as string');
        textContains(result.message, 'GET', 'Show AJAX method');
        textContains(result.message, '/posts', 'Show URL');
      });
  });

  it('it creates a detailed error message for unmatched server errors with a text payload', function() {
    const response = [408, { 'Content-Type': 'text/html' }, 'Some error response'];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        ok(false, 'success handler should not be called');
      })
      .catch(function(result) {
        textContains(result.message, 'Some error response', 'Show payload as string');
        textContains(result.message, 'GET', 'Show AJAX method');
        textContains(result.message, '/posts', 'Show URL');
      });
  });

  it('it always returns error objects with status codes as strings', function() {
    const response = [404, { 'Content-Type': 'application/json' }, ''];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        ok(false, 'success handler should not be called');
      })
      .catch(function(result) {
        strictEqual(result.errors[0].status, '404', 'status must be a string');
      });
  });

  it('it coerces payload error response status codes to strings', function() {
    const body = {
      errors: [
        { status: 403, message: 'Permission Denied' }
      ]
    };
    const response = [403, { 'Content-Type': 'application/json' }, JSON.stringify(body)];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        ok(false, 'success handler should not be called');
      })
      .catch(function(result) {
        strictEqual(result.errors[0].status, '403', 'status must be a string');
        strictEqual(result.errors[0].message, 'Permission Denied');
      });
  });

  it('it throws an error when the user tries to use `.get` to make a request', function() {
    const service = new AjaxRequest();
    service.set('someProperty', 'foo');

    equal(service.get('someProperty'), 'foo', 'Can get a property');

    throws(function() {
      service.get('/users');
    });

    throws(function() {
      service.get('/users', {});
    });
  });

  it('it JSON encodes JSON:API request data automatically', function() {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      equal(foo, 'bar', 'Recieved JSON-encoded data');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    });

    const service = new RequestWithHeaders();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  it('it does not JSON encode query parameters when JSON:API headers are present', function() {
    this.server.get('/test', ({ queryParams }) => {
      const { foo } = queryParams;
      equal(foo, 'bar', 'Correctly received query param');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    });

    const service = new RequestWithHeaders();
    return service.request('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  it('it JSON encodes JSON:API "extension" request data automatically', function() {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      equal(foo, 'bar', 'Recieved JSON-encoded data');
      return jsonResponse();
    });

    const RequestWithHeaders = AjaxRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json; ext="ext1,ext2"'
      }
    });

    const service = new RequestWithHeaders();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  it('normalizes errors into the appropriate format', function() {
    const service = new AjaxRequest();

    const jsonApiError = service.normalizeErrorResponse(400, {}, {
      errors: [
        { status: 400, title: 'Foo' },
        { status: 400, title: 'Foo' }
      ]
    });
    deepEqual(jsonApiError, [
        { status: '400', title: 'Foo' },
        { status: '400', title: 'Foo' }
    ], 'Normalizes an error in the JSON API format');

    const payloadWithErrorStrings = service.normalizeErrorResponse(400, {}, {
      errors: [
        'This is an error',
        'This is another error'
      ]
    });
    deepEqual(payloadWithErrorStrings, [
      { status: '400', title: 'This is an error' },
      { status: '400', title: 'This is another error' }
    ], 'Normalizes error payload with strings in errors property');

    const payloadArrayOfObjects = service.normalizeErrorResponse(400, {}, [
      { status: 400, title: 'Foo' },
      { status: 400, title: 'Bar' }
    ]);
    deepEqual(payloadArrayOfObjects, [
      { status: '400', title: 'Foo', meta: { status: 400, title: 'Foo' } },
      { status: '400', title: 'Bar', meta: { status: 400, title: 'Bar' } }
    ], 'Normalizes error array of objects');

    const payloadArrayOfStrings = service.normalizeErrorResponse(400, {}, [
      'Foo', 'Bar'
    ]);
    deepEqual(payloadArrayOfStrings, [
      { status: '400', title: 'Foo' },
      { status: '400', title: 'Bar' }
    ], 'Normalizes error array of strings');

    const payloadIsString = service.normalizeErrorResponse(400, {}, 'Foo');
    deepEqual(payloadIsString, [
      {
        status: '400',
        title: 'Foo'
      }
    ], 'Normalizes error string');

    const payloadIsObject = service.normalizeErrorResponse(400, {}, {
      title: 'Foo'
    });
    deepEqual(payloadIsObject, [
      {
        status: '400',
        title: 'Foo',
        meta: {
          title: 'Foo'
        }
      }
    ], 'Normalizes error object');
  });

  it('it correctly creates the URL to request', function() {
    class NamespaceLeadingSlash extends AjaxRequest {
      static get slashType() {
        return 'leading slash';
      }
      get namespace() {
        return '/bar';
      }
    }

    class NamespaceTrailingSlash extends AjaxRequest {
      static get slashType() {
        return 'trailing slash';
      }
      get namespace() {
        return 'bar/';
      }
    }

    class NamespaceTwoSlash extends AjaxRequest {
      static get slashType() {
        return 'leading and trailing slash';
      }
      get namespace() {
        return '/bar/';
      }
    }

    class NamespaceNoSlash extends AjaxRequest {
      static get slashType() {
        return 'no slashes';
      }
      get namespace() {
        return 'bar';
      }
    }

    const hosts = [
      { hostType: 'trailing slash', host: 'http://foo.com/' },
      { hostType: 'no trailing slash', host: 'http://foo.com' }
    ];

    [NamespaceLeadingSlash, NamespaceTrailingSlash, NamespaceTwoSlash, NamespaceNoSlash].forEach((Klass) => {
      let req = new Klass();

      hosts.forEach((exampleHost) => {
        const { hostType, host } = exampleHost;
        ['/baz', 'baz'].forEach((segment) => {
          equal(
            req._buildURL(segment, { host }),
            'http://foo.com/bar/baz',
            `Host with ${hostType}, Namespace with ${Klass.slashType}, segment: ${segment}`
          );
        });
        ['/baz/', 'baz/'].forEach((segment) => {
          equal(
            req._buildURL(segment, { host }),
            'http://foo.com/bar/baz/',
            `Host with ${hostType}, Namespace with ${Klass.slashType}, segment: ${segment}`
          );
        });
      });
    });

    let req = new AjaxRequest();
    equal(req._buildURL('/baz', { host: 'http://foo.com' }), 'http://foo.com/baz', 'Builds URL correctly without namespace');
    equal(req._buildURL('/baz'), '/baz', 'Builds URL correctly without namespace or host');
  });
});

