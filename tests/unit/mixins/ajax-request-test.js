import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import wait from 'ember-test-helpers/wait';

import Ember from 'ember';
import AjaxRequest from 'ember-ajax/ajax-request';
import {
  ConflictError,
  InvalidError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ServerError,
  isTimeoutError
} from 'ember-ajax/errors';
import Pretender from 'pretender';
import { jsonResponse, jsonFactory } from 'dummy/tests/helpers/json';

const { A, typeOf } = Ember;

describe('Unit | Mixin | ajax request', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });

  afterEach(function() {
    this.server.shutdown();
  });

  it('headers are set if the URL matches the host', function() {
    this.server.get('http://example.com/test', (req) => {
      const { requestHeaders } = req;
      expect(requestHeaders['Content-Type']).to.equal('application/json');
      expect(requestHeaders['Other-key']).to.equal('Other Value');
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
      expect(requestHeaders['Content-Type']).to.equal('application/json');
      expect(requestHeaders['Other-key']).to.equal('Other Value');
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
      expect(requestHeaders['Other-key']).to.equal('Other Value');
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
      expect(requestHeaders['Other-key']).to.equal('Other Value');
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
      expect(requestHeaders['Other-key']).to.not.equal('Other Value');
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
      expect(requestHeaders['Per-Request-Key']).to.equal('Some value');
      expect(requestHeaders['Other-key']).to.equal('Other Value');
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

  describe('options method', function() {
    it('sets raw data', function() {
      const service = new AjaxRequest();
      const url = 'test';
      const type = 'GET';
      const ajaxOptions = service.options(url, { type, data: { key: 'value' } });

      expect(ajaxOptions).to.deep.equal({
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

    it('sets options correctly', function() {
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

      expect(ajaxOptions).to.deep.equal({
        contentType: 'application/json; charset=utf-8',
        data: '{"key":"value"}',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    it('does not override contentType when defined', function() {
      const service = new AjaxRequest();
      const url  = 'test';
      const type = 'POST';
      const data = JSON.stringify({ key: 'value' });
      const ajaxOptions = service.options(
        url,
        {
          type,
          data,
          contentType: false
        }
      );

      expect(ajaxOptions).to.deep.equal({
        contentType: false,
        data: '{"key":"value"}',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    it('can handle empty data', function() {
      const service = new AjaxRequest();
      const url = 'test';
      const type = 'POST';
      const ajaxOptions = service.options(url, { type });

      expect(ajaxOptions).to.deep.equal({
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    it('is only called once per call to request', function() {
      let numberOptionsCalls = 0;

      this.server.get('/foo', () => jsonResponse());

      const MonitorOptionsCalls = AjaxRequest.extend({
        options() {
          numberOptionsCalls = numberOptionsCalls + 1;
          return this._super(...arguments);
        }
      });

      const service = new MonitorOptionsCalls();
      return service.request('/foo')
        .then(function() {
          expect(numberOptionsCalls).to.equal(1);
        });
    });

    it('is only called once per call to raw', function() {
      let numberOptionsCalls = 0;

      this.server.get('/foo', () => jsonResponse());

      const MonitorOptionsCalls = AjaxRequest.extend({
        options() {
          numberOptionsCalls = numberOptionsCalls + 1;
          return this._super(...arguments);
        }
      });

      const service = new MonitorOptionsCalls();
      return service.raw('/foo')
        .then(function() {
          expect(numberOptionsCalls).to.equal(1);
        });
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
    expect(options.contentType).to.equal(defaultContentType);
  });

  it('options() type defaults to GET', function() {
    const service = new AjaxRequest();
    const url = 'test';
    const ajaxOptions = service.options(url);

    expect(ajaxOptions.type).to.equal('GET');
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
    expect(getPromise._label).to.equal('ember-ajax: GET /posts response');

    const postPromise = service.request(url, data);
    expect(postPromise._label).to.equal('ember-ajax: POST /posts response');
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
    expect(postPromise._label).to.equal('ember-ajax: POST /posts response');

    return postPromise.then(function(response) {
      expect(response.post).to.deep.equal(options.data.post);
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
    expect(putPromise._label).to.equal('ember-ajax: PUT /posts/1 response');

    return putPromise.then(function(response) {
      expect(response.post).to.deep.equal(options.data.post);
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
    expect(patchPromise._label).to.equal('ember-ajax: PATCH /posts/1 response');

    return patchPromise.then(function(response) {
      expect(response.post).to.deep.equal(options.data.post);
    });
  });

  it('del() promise label is correct', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.delete(url, () => serverResponse);

    const delPromise = service.del(url);
    expect(delPromise._label).to.equal('ember-ajax: DELETE /posts/1 response');

    return delPromise.then(function(response) {
      expect(response).to.deep.equal({});
    });
  });

  it('delete() promise label is correct', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.delete(url, () => serverResponse);

    const deletePromise = service.delete(url);
    expect(deletePromise._label).to.equal('ember-ajax: DELETE /posts/1 response');

    return deletePromise.then(function(response) {
      expect(response).to.deep.equal({});
    });
  });

  it('request with method option makes the correct type of request', function() {
    const service = new AjaxRequest();
    const url = '/posts/1';
    const serverResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify({})];

    this.server.get(url, () => {
      throw new Error("Shouldn't make an AJAX request");
    });

    this.server.post(url, () => {
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

    expect(ajaxoptions.url).to.equal('https://discuss.emberjs.com/users/me');
  });

  it('options() host is set on the url (url not starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'users/me';
    const ajaxoptions = service.options(url);

    expect(ajaxoptions.url).to.equal('https://discuss.emberjs.com/users/me');
  });

  it('options() host is overridable on a per-request basis', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'users/me';
    const host = 'https://myurl.com';
    const ajaxoptions = service.options(url, { host });

    expect(ajaxoptions.url).to.equal('https://myurl.com/users/me');
  });

  it('explicit host in URL overrides host property of class', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'http://myurl.com/users/me';
    const ajaxOptions = service.options(url);

    expect(ajaxOptions.url).to.equal('http://myurl.com/users/me');
  });

  it('explicit host in URL overrides host property in request config', function() {
    const service = new AjaxRequest();
    const host = 'https://discuss.emberjs.com';
    const url = 'http://myurl.com/users/me';
    const ajaxOptions = service.options(url, { host });

    expect(ajaxOptions.url).to.equal('http://myurl.com/users/me');
  });

  it('explicit host in URL without a protocol does not override config property', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com'
    });

    const service = new RequestWithHost();
    const url = 'myurl.com/users/me';
    const ajaxOptions = service.options(url);

    expect(ajaxOptions.url).to.equal('https://discuss.emberjs.com/myurl.com/users/me');
  });

  it('options() namespace is set on the url (namespace starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      namespace: '/api/v1'
    });

    const service = new RequestWithHost();

    expect(service.options('/users/me').url).to.equal('/api/v1/users/me');
    expect(service.options('users/me').url).to.equal('/api/v1/users/me');
  });

  it('namespace can be set on a per-request basis', function() {
    const service = new AjaxRequest();

    expect(service.options('users/me', { namespace: 'api' }).url).to.equal('/api/users/me');
  });

  it('options() namespace is set on the url (namespace not starting with `/`)', function() {
    const RequestWithHost = AjaxRequest.extend({
      namespace: 'api/v1'
    });

    const service = new RequestWithHost();

    expect(service.options('/users/me').url).to.equal('/api/v1/users/me');
    expect(service.options('users/me').url).to.equal('/api/v1/users/me');
  });

  it('options() both host and namespace are set on the url', function() {
    const RequestWithHost = AjaxRequest.extend({
      host: 'https://discuss.emberjs.com',
      namespace: '/api/v1'
    });

    const service = new RequestWithHost();
    const url = '/users/me';
    const ajaxoptions = service.options(url);

    expect(ajaxoptions.url).to.equal('https://discuss.emberjs.com/api/v1/users/me');
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
    expect(Object.keys(service._getFullHeadersHash()).length).to.equal(2);
    expect(Object.keys(service._getFullHeadersHash(headers)).length).to.equal(3);
    expect(Object.keys(service.headers).length).to.equal(2);
  });

  it('it creates a detailed error message for unmatched server errors with an AJAX payload', function() {
    const response = [408, { 'Content-Type': 'application/json' }, JSON.stringify(
      { errors: ['Some error response'] }
    )];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        expect(result.message).to.contain('Some error response');
        expect(result.message).to.contain('GET');
        expect(result.message).to.contain('/posts');
      });
  });

  it('it creates a detailed error message for unmatched server errors with a text payload', function() {
    const response = [408, { 'Content-Type': 'text/html' }, 'Some error response'];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        expect(result.message).to.contain('Some error response');
        expect(result.message).to.contain('GET');
        expect(result.message).to.contain('/posts');
      });
  });

  it('it always returns error objects with status codes as strings', function() {
    const response = [404, { 'Content-Type': 'application/json' }, ''];
    this.server.get('/posts', () => response);

    const service = new AjaxRequest();
    return service.request('/posts')
      .then(function() {
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        expect(result.errors[0].status).to.equal('404');
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
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        expect(result.errors[0].status).to.equal('403');
        expect(result.errors[0].message).to.equal('Permission Denied');
      });
  });

  it('it throws an error when the user tries to use `.get` to make a request', function() {
    const service = new AjaxRequest();
    service.set('someProperty', 'foo');

    expect(service.get('someProperty')).to.equal('foo');

    expect(function() {
      service.get('/users');
    }).to.throw();

    expect(function() {
      service.get('/users', {});
    }).to.throw();
  });

  it('it JSON encodes JSON:API request data automatically', function() {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      expect(foo).to.equal('bar');
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
      expect(foo).to.equal('bar');
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
      expect(foo).to.equal('bar');
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
    expect(jsonApiError).to.deep.equal([
        { status: '400', title: 'Foo' },
        { status: '400', title: 'Foo' }
    ]);

    const payloadWithErrorStrings = service.normalizeErrorResponse(400, {}, {
      errors: [
        'This is an error',
        'This is another error'
      ]
    });
    expect(payloadWithErrorStrings).to.deep.equal([
      { status: '400', title: 'This is an error' },
      { status: '400', title: 'This is another error' }
    ]);

    const payloadArrayOfObjects = service.normalizeErrorResponse(400, {}, [
      { status: 400, title: 'Foo' },
      { status: 400, title: 'Bar' }
    ]);
    expect(payloadArrayOfObjects).to.deep.equal([
      { status: '400', title: 'Foo', detail: { status: 400, title: 'Foo' } },
      { status: '400', title: 'Bar', detail: { status: 400, title: 'Bar' } }
    ]);

    const payloadArrayOfStrings = service.normalizeErrorResponse(400, {}, [
      'Foo', 'Bar'
    ]);
    expect(payloadArrayOfStrings).to.deep.equal([
      { status: '400', title: 'Foo' },
      { status: '400', title: 'Bar' }
    ]);

    const payloadIsString = service.normalizeErrorResponse(400, {}, 'Foo');
    expect(payloadIsString).to.deep.equal([
      {
        status: '400',
        title: 'Foo'
      }
    ]);

    const payloadIsObject = service.normalizeErrorResponse(400, {}, {
      title: 'Foo'
    });
    expect(payloadIsObject).to.deep.equal([
      {
        status: '400',
        title: 'Foo',
        detail: {
          title: 'Foo'
        }
      }
    ]);
  });

  describe('URL building', function() {
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
        const { host } = exampleHost;

        it(`correctly handles ${Klass.slashType} when the host has ${exampleHost.hostType}`, function() {
          ['/baz', 'baz'].forEach((segment) => {
            expect(req._buildURL(segment, { host })).to.equal('http://foo.com/bar/baz');
          });
          ['/baz/', 'baz/'].forEach((segment) => {
            expect(req._buildURL(segment, { host })).to.equal('http://foo.com/bar/baz/');
          });
        });
      });
    });

    it('correctly handles a host without a namespace', function() {
      class HostWithoutNamespace extends AjaxRequest {
        get host() {
          return 'http://foo.com';
        }
      }

      const req = new HostWithoutNamespace();
      expect(req._buildURL('baz')).to.equal('http://foo.com/baz');
    });

    it('correctly handles a host provided on the request options', function() {
      const req = new AjaxRequest();
      expect(req._buildURL('/baz', { host: 'http://foo.com' })).to.equal('http://foo.com/baz');
    });

    it('correctly handles no namespace or host', function() {
      const req = new AjaxRequest();
      expect(req._buildURL('/baz')).to.equal('/baz');
    });

    it('does not build the URL if the namespace is already present', function() {
      class RequestWithNamespace extends AjaxRequest {
        get namespace() {
          return 'api';
        }
      }

      const req = new RequestWithNamespace();
      expect(req._buildURL('/api/post')).to.equal('/api/post', 'URL provided with leading slash');
      expect(req._buildURL('api/post')).to.equal('api/post', 'URL provided without leading slash');
    });

    it('does not build the URL if the host is already present', function() {
      class RequestWithHost extends AjaxRequest {
        get host() {
          return 'https://foo.com';
        }
      }

      const req = new RequestWithHost();
      expect(req._buildURL('https://foo.com/posts')).to.equal('https://foo.com/posts');
    });
  });

  it('it doesn\'t reassign payloads which evaluate falsey but are not null or undefined', function() {
    const service = new AjaxRequest();

    const payloadWithFalseyString = service.handleResponse(200, {}, '');
    expect(payloadWithFalseyString).to.be.empty;

    const payloadWithFalseyNumber = service.handleResponse(200, {}, 0);
    expect(payloadWithFalseyNumber).to.equal(0);

    const payloadWithNaN = service.handleResponse(200, {}, NaN);
    expect(isNaN(payloadWithNaN)).to.be.ok;

    const payloadWithNull = service.handleResponse(200, {}, null);
    expect(payloadWithNull).to.be.deep.equal({});

    const payloadWithUndefined = service.handleResponse(200, {}, undefined);
    expect(payloadWithUndefined).to.be.deep.equal({});
  });

  describe('JSONP Requests', function() {
    it('should make JSONP requests', function() {
      this.server.get('/jsonp', function(req) {
        return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
      });

      const ajax = new AjaxRequest();
      return ajax.request('/jsonp', {
        dataType: 'jsonp'
      })
      .then((value) => {
        expect(value).to.deep.equal({ foo: 'bar' });
      });
    });
  });

  describe('error handlers', function() {
    it('handles a TimeoutError correctly', function() {
      this.server.get('/posts', jsonFactory(200), 2);
      const service = new AjaxRequest();
      return service.request('/posts', { timeout: 1 })
        .then(function() {
          throw new Error('success handler should not be called');
        })
        .catch(function(reason) {
          expect(isTimeoutError(reason)).to.be.ok;
          expect(reason.errors && typeOf(reason.errors) === 'array').to.be.ok;
        });
    });

    function errorHandlerTest(status, errorClass) {
      it(`handles a ${status} response correctly and preserves the payload`, function() {
        this.server.get('/posts', jsonFactory(status, { errors: [{ id: 1, message: 'error description' }] }));
        const service = new AjaxRequest();
        return service.request('/posts')
          .then(function() {
            throw new Error('success handler should not be called');
          })
          .catch(function(reason) {
            expect(reason instanceof errorClass).to.be.ok;
            expect(reason.errors && typeOf(reason.errors) === 'array').to.be.ok;
            expect(reason.errors[0].id).to.equal(1);
            expect(reason.errors[0].message).to.equal('error description');
          });
      });
    }

    errorHandlerTest(401, UnauthorizedError);
    errorHandlerTest(403, ForbiddenError);
    errorHandlerTest(409, ConflictError);
    errorHandlerTest(422, InvalidError);
    errorHandlerTest(400, BadRequestError);
    errorHandlerTest(500, ServerError);
    errorHandlerTest(502, ServerError);
    errorHandlerTest(510, ServerError);
  });

  describe('Custom waiter', function() {
    beforeEach(function() {
      this.requestMade = false;

      function handleRequest() {
        this.requestMade = true;
        return jsonResponse();
      }

      this.server.get('/test', handleRequest.bind(this));
      this.server.post('/test', handleRequest.bind(this));
    });

    it('can wait on an AJAX GET request', function() {
      const service = new AjaxRequest();
      service.request('/test');

      return wait().then(() => {
        expect(this.requestMade).to.be.ok;
      });
    });

    it('can wait on an AJAX POST request', function() {
      const service = new AjaxRequest();
      service.post('/test');

      return wait().then(() => {
        expect(this.requestMade).to.be.ok;
      });
    });

    it('can wait on a JSONP request', function() {
      let response;

      this.server.get('/jsonp', function(req) {
        return [200, {}, `${req.queryParams.callback}({ "foo": "bar" })`];
      });

      const ajax = new AjaxRequest();
      ajax.request('/jsonp', { dataType: 'jsonp' }).then((val) => response = val);
      return wait().then(() => {
        expect(response).to.deep.equal({ foo: 'bar' });
      });
    });
  });
});
