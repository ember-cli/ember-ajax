import { A } from '@ember/array';
import EmberError from '@ember/error';
import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { assign } from '@ember/polyfills';
import { run } from '@ember/runloop';
import { warn, runInDebug } from '@ember/debug';
import Ember from 'ember';
import {
  AjaxError,
  UnauthorizedError,
  InvalidError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  GoneError,
  TimeoutError,
  AbortError,
  ConflictError,
  ServerError,
  isAjaxError,
  isUnauthorizedError,
  isForbiddenError,
  isInvalidError,
  isBadRequestError,
  isNotFoundError,
  isGoneError,
  isConflictError,
  isAbortError,
  isServerError,
  isSuccess
} from '../errors';
import ajax from 'ember-ajax/utils/ajax';
import parseResponseHeaders from 'ember-ajax/-private/utils/parse-response-headers';
import getHeader from 'ember-ajax/-private/utils/get-header';
import {
  isFullURL,
  parseURL,
  haveSameHost
} from 'ember-ajax/-private/utils/url-helpers';
import isString from 'ember-ajax/-private/utils/is-string';
import AJAXPromise from 'ember-ajax/-private/promise';

import {
  AJAXOptions,
  Headers,
  Matcher,
  Method,
  RequestData,
  Response,
  RawResponse,
  RawErrorResponse
} from '../-private/types';

const { Test } = Ember;
const JSONContentType = /^application\/(?:vnd\.api\+)?json/i;

function isJSONContentType(header: any) {
  if (!isString(header)) {
    return false;
  }

  return !!header.match(JSONContentType);
}

function isJSONStringifyable(
  method: string,
  {
    contentType,
    data,
    headers
  }: { contentType?: string | false; data?: any; headers?: Headers }
) {
  if (method === 'GET') {
    return false;
  }

  if (
    !isJSONContentType(contentType) &&
    !isJSONContentType(getHeader(headers, 'Content-Type'))
  ) {
    return false;
  }

  if (typeof data !== 'object') {
    return false;
  }

  return true;
}

function startsWithSlash(string: string) {
  return string.charAt(0) === '/';
}

function endsWithSlash(string: string) {
  return string.charAt(string.length - 1) === '/';
}

function removeLeadingSlash(string: string) {
  return string.substring(1);
}

function removeTrailingSlash(string: string) {
  return string.slice(0, -1);
}

function stripSlashes(path: string) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = removeLeadingSlash(path);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = removeTrailingSlash(path);
  }
  return path;
}

let pendingRequestCount = 0;
if (Ember.testing) {
  Test.registerWaiter(function() {
    return pendingRequestCount === 0;
  });
}

/**
 * AjaxRequest Mixin
 */
export default Mixin.create({
  /**
   * The default value for the request `contentType`
   *
   * For now, defaults to the same value that jQuery would assign.  In the
   * future, the default value will be for JSON requests.
   * @property {string} contentType
   * @public
   */
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',

  /**
   * Headers to include on the request
   *
   * Some APIs require HTTP headers, e.g. to provide an API key. Arbitrary
   * headers can be set as key/value pairs on the `RESTAdapter`'s `headers`
   * object and Ember Data will send them along with each ajax request.
   *
   * ```javascript
   * // app/services/ajax.js
   * import AjaxService from 'ember-ajax/services/ajax';
   *
   * export default AjaxService.extend({
   *   headers: {
   *     'API_KEY': 'secret key',
   *     'ANOTHER_HEADER': 'Some header value'
   *   }
   * });
   * ```
   *
   * `headers` can also be used as a computed property to support dynamic
   * headers.
   *
   * ```javascript
   * // app/services/ajax.js
   * import Ember from 'ember';
   * import AjaxService from 'ember-ajax/services/ajax';
   *
   * const {
   *   computed,
   *   get,
   *   inject: { service }
   * } = Ember;
   *
   * export default AjaxService.extend({
   *   session: service(),
   *   headers: computed('session.authToken', function() {
   *     return {
   *       'API_KEY': get(this, 'session.authToken'),
   *       'ANOTHER_HEADER': 'Some header value'
   *     };
   *   })
   * });
   * ```
   *
   * In some cases, your dynamic headers may require data from some object
   * outside of Ember's observer system (for example `document.cookie`). You
   * can use the `volatile` function to set the property into a non-cached mode
   * causing the headers to be recomputed with every request.
   *
   * ```javascript
   * // app/services/ajax.js
   * import Ember from 'ember';
   * import AjaxService from 'ember-ajax/services/ajax';
   *
   * const {
   *   computed,
   *   get,
   *   inject: { service }
   * } = Ember;
   *
   * export default AjaxService.extend({
   *   session: service(),
   *   headers: computed('session.authToken', function() {
   *     return {
   *       'API_KEY': get(document.cookie.match(/apiKey\=([^;]*)/), '1'),
   *       'ANOTHER_HEADER': 'Some header value'
   *     };
   *   }).volatile()
   * });
   * ```
   *
   * @property {Headers} headers
   * @public
   */
  headers: undefined as undefined | Headers,

  /**
   * @property {string} host
   * @public
   */
  host: undefined as undefined | string,

  /**
   * @property {string} namespace
   * @public
   */
  namespace: undefined as undefined | string,

  /**
   * @property {Matcher[]} trustedHosts
   * @public
   */
  trustedHosts: undefined as undefined | Matcher[],

  /**
   * Make an AJAX request, ignoring the raw XHR object and dealing only with
   * the response
   */
  request<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    const hash = this.options(url, options);
    const internalPromise = this._makeRequest<T>(hash);

    const ajaxPromise = new AJAXPromise<T>((resolve, reject) => {
      internalPromise
        .then(({ response }) => {
          resolve(response);
        })
        .catch(({ response }) => {
          reject(response);
        });
    }, `ember-ajax: ${hash.type} ${hash.url} response`);

    ajaxPromise.xhr = internalPromise.xhr;

    return ajaxPromise;
  },

  /**
   * Make an AJAX request, returning the raw XHR object along with the response
   */
  raw<T = Response>(
    url: string,
    options?: AJAXOptions
  ): AJAXPromise<RawResponse<T>> {
    const hash = this.options(url, options);
    return this._makeRequest<T>(hash);
  },

  /**
   * Shared method to actually make an AJAX request
   */
  _makeRequest<T>(hash: AJAXOptions): AJAXPromise<RawResponse<T>> {
    const method = hash.method || hash.type || 'GET';
    const requestData = { method, type: method, url: hash.url };

    if (isJSONStringifyable(method, hash)) {
      hash.data = JSON.stringify(hash.data);
    }

    pendingRequestCount = pendingRequestCount + 1;

    const jqXHR = ajax(hash.url!, hash);

    const promise = new AJAXPromise<RawResponse>((resolve, reject) => {
      jqXHR
        .done((payload, textStatus, jqXHR) => {
          const response = this.handleResponse(
            jqXHR.status,
            parseResponseHeaders(jqXHR.getAllResponseHeaders()),
            payload,
            requestData
          );

          if (isAjaxError(response)) {
            const rejectionParam: RawErrorResponse = {
              payload,
              textStatus,
              jqXHR,
              response
            };
            run.join(null, reject, rejectionParam);
          } else {
            const resolutionParam: RawResponse = {
              payload,
              textStatus,
              jqXHR,
              response
            };
            run.join(null, resolve, resolutionParam);
          }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          runInDebug(function() {
            const message = `The server returned an empty string for ${
              requestData.type
            } ${
              requestData.url
            }, which cannot be parsed into a valid JSON. Return either null or {}.`;
            const validJSONString = !(
              textStatus === 'parsererror' && jqXHR.responseText === ''
            );

            warn(message, validJSONString, {
              id: 'ds.adapter.returned-empty-string-as-JSON'
            });
          });

          const payload =
            this.parseErrorResponse(jqXHR.responseText) || errorThrown;
          let response;

          if (textStatus === 'timeout') {
            response = new TimeoutError();
          } else if (textStatus === 'abort') {
            response = new AbortError();
          } else {
            response = this.handleResponse<typeof payload>(
              jqXHR.status,
              parseResponseHeaders(jqXHR.getAllResponseHeaders()),
              payload,
              requestData
            );
          }

          const rejectionParam: RawErrorResponse = {
            payload,
            textStatus,
            jqXHR,
            errorThrown,
            response
          };

          run.join(null, reject, rejectionParam);
        })
        .always(() => {
          pendingRequestCount = pendingRequestCount - 1;
        });
    }, `ember-ajax: ${hash.type} ${hash.url}`);

    promise.xhr = jqXHR;

    return promise;
  },

  /**
   * calls `request()` but forces `options.type` to `POST`
   */
  post<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    return this.request(url, this._addTypeToOptionsFor(options, 'POST'));
  },

  /**
   * calls `request()` but forces `options.type` to `PUT`
   */
  put<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    return this.request(url, this._addTypeToOptionsFor(options, 'PUT'));
  },

  /**
   * calls `request()` but forces `options.type` to `PATCH`
   */
  patch<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    return this.request(url, this._addTypeToOptionsFor(options, 'PATCH'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   */
  del<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    return this.request(url, this._addTypeToOptionsFor(options, 'DELETE'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   *
   * Alias for `del()`
   */
  delete<T = Response>(url: string, options?: AJAXOptions): AJAXPromise<T> {
    return this.del(url, options);
  },

  /**
   * Wrap the `.get` method so that we issue a warning if
   *
   * Since `.get` is both an AJAX pattern _and_ an Ember pattern, we want to try
   * to warn users when they try using `.get` to make a request
   */
  get(url: string): any {
    if (arguments.length > 1 || url.indexOf('/') !== -1) {
      throw new EmberError(
        'It seems you tried to use `.get` to make a request! Use the `.request` method instead.'
      );
    }
    return this._super(...arguments);
  },

  /**
   * Manipulates the options hash to include the HTTP method on the type key
   */
  _addTypeToOptionsFor(
    options: AJAXOptions | undefined,
    method: Method
  ): AJAXOptions {
    options = options || {};
    options.type = method;
    return options;
  },

  /**
   * Get the full "headers" hash, combining the service-defined headers with
   * the ones provided for the request
   */
  _getFullHeadersHash(headers?: Headers): Headers {
    const classHeaders = get(this, 'headers');
    return assign({}, classHeaders!, headers!);
  },

  /**
   * Created a normalized set of options from the per-request and
   * service-level settings
   */
  options(url: string, options: AJAXOptions = {}): AJAXOptions {
    options = assign({}, options);
    options.url = this._buildURL(url, options);
    options.type = options.type || 'GET';
    options.dataType = options.dataType || 'json';
    options.contentType = isEmpty(options.contentType)
      ? get(this, 'contentType')
      : options.contentType;

    if (this._shouldSendHeaders(options)) {
      options.headers = this._getFullHeadersHash(options.headers);
    } else {
      options.headers = options.headers || {};
    }

    return options;
  },

  /**
   * Build a URL for a request
   *
   * If the provided `url` is deemed to be a complete URL, it will be returned
   * directly.  If it is not complete, then the segment provided will be combined
   * with the `host` and `namespace` options of the request class to create the
   * full URL.
   */
  _buildURL(url: string, options: AJAXOptions = {}) {
    if (isFullURL(url)) {
      return url;
    }

    const urlParts = [];

    let host = options.host || get(this, 'host');
    if (host) {
      host = endsWithSlash(host) ? removeTrailingSlash(host) : host;
      urlParts.push(host);
    }

    let namespace = options.namespace || get(this, 'namespace');
    if (namespace) {
      // If host is given then we need to strip leading slash too( as it will be added through join)
      if (host) {
        namespace = stripSlashes(namespace);
      } else if (endsWithSlash(namespace)) {
        namespace = removeTrailingSlash(namespace);
      }

      // If the URL has already been constructed (presumably, by Ember Data), then we should just leave it alone
      const hasNamespaceRegex = new RegExp(`^(/)?${stripSlashes(namespace)}/`);
      if (!hasNamespaceRegex.test(url)) {
        urlParts.push(namespace);
      }
    }

    // *Only* remove a leading slash when there is host or namespace -- we need to maintain a trailing slash for
    // APIs that differentiate between it being and not being present
    if (startsWithSlash(url) && urlParts.length !== 0) {
      url = removeLeadingSlash(url);
    }
    urlParts.push(url);

    return urlParts.join('/');
  },

  /**
   * Takes an ajax response, and returns the json payload or an error.
   *
   * By default this hook just returns the json payload passed to it.
   * You might want to override it in two cases:
   *
   * 1. Your API might return useful results in the response headers.
   *    Response headers are passed in as the second argument.
   *
   * 2. Your API might return errors as successful responses with status code
   *    200 and an Errors text or object.
   */
  handleResponse<T>(
    status: number,
    headers: Headers,
    payload: T,
    requestData: RequestData
  ): AjaxError | T {
    if (this.isSuccess(status, headers, payload)) {
      return payload;
    }

    // Allow overriding of error payload
    payload = this.normalizeErrorResponse(status, headers, payload);

    return this._createCorrectError(status, headers, payload, requestData);
  },

  _createCorrectError(
    status: number,
    headers: Headers,
    payload: any,
    requestData: RequestData
  ) {
    let error;

    if (this.isUnauthorizedError(status, headers, payload)) {
      error = new UnauthorizedError(payload);
    } else if (this.isForbiddenError(status, headers, payload)) {
      error = new ForbiddenError(payload);
    } else if (this.isInvalidError(status, headers, payload)) {
      error = new InvalidError(payload);
    } else if (this.isBadRequestError(status, headers, payload)) {
      error = new BadRequestError(payload);
    } else if (this.isNotFoundError(status, headers, payload)) {
      error = new NotFoundError(payload);
    } else if (this.isGoneError(status, headers, payload)) {
      error = new GoneError(payload);
    } else if (this.isAbortError(status, headers, payload)) {
      error = new AbortError();
    } else if (this.isConflictError(status, headers, payload)) {
      error = new ConflictError(payload);
    } else if (this.isServerError(status, headers, payload)) {
      error = new ServerError(payload, status);
    } else {
      const detailedMessage = this.generateDetailedMessage(
        status,
        headers,
        payload,
        requestData
      );

      error = new AjaxError(payload, detailedMessage, status);
    }

    return error;
  },

  /**
   * Match the host to a provided array of strings or regexes that can match to a host
   */
  _matchHosts(host: string | undefined, matcher?: Matcher): boolean {
    if (!isString(host)) {
      return false;
    }

    if (matcher instanceof RegExp) {
      return matcher.test(host);
    } else if (typeof matcher === 'string') {
      return matcher === host;
    } else {
      console.warn(
        'trustedHosts only handles strings or regexes. ',
        matcher,
        ' is neither.'
      );
      return false;
    }
  },

  /**
   * Determine whether the headers should be added for this request
   *
   * This hook is used to help prevent sending headers to every host, regardless
   * of the destination, since this could be a security issue if authentication
   * tokens are accidentally leaked to third parties.
   *
   * To avoid that problem, subclasses should utilize the `headers` computed
   * property to prevent authentication from being sent to third parties, or
   * implement this hook for more fine-grain control over when headers are sent.
   *
   * By default, the headers are sent if the host of the request matches the
   * `host` property designated on the class.
   */
  _shouldSendHeaders({ url, host }: AJAXOptions) {
    url = url || '';
    host = host || get(this, 'host') || '';

    const trustedHosts = get(this, 'trustedHosts') || A<Matcher>();
    const { hostname } = parseURL(url);

    // Add headers on relative URLs
    if (!isFullURL(url)) {
      return true;
    } else if (
      trustedHosts.find(matcher => this._matchHosts(hostname, matcher))
    ) {
      return true;
    }

    // Add headers on matching host
    return haveSameHost(url, host);
  },

  /**
   * Generates a detailed ("friendly") error message, with plenty
   * of information for debugging (good luck!)
   */
  generateDetailedMessage(
    status: number,
    headers: Headers,
    payload: any,
    requestData: RequestData
  ): string {
    let shortenedPayload;
    const payloadContentType =
      getHeader(headers, 'Content-Type') || 'Empty Content-Type';

    if (
      payloadContentType.toLowerCase() === 'text/html' &&
      payload.length > 250
    ) {
      shortenedPayload = '[Omitted Lengthy HTML]';
    } else {
      shortenedPayload = JSON.stringify(payload);
    }

    const requestDescription = `${requestData.type} ${requestData.url}`;
    const payloadDescription = `Payload (${payloadContentType})`;

    return [
      `Ember AJAX Request ${requestDescription} returned a ${status}`,
      payloadDescription,
      shortenedPayload
    ].join('\n');
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a an authorized error.
   */
  isUnauthorizedError(status: number, _headers: Headers, _payload: any) {
    return isUnauthorizedError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a forbidden error.
   */
  isForbiddenError(status: number, _headers: Headers, _payload: any) {
    return isForbiddenError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a an invalid error.
   */
  isInvalidError(status: number, _headers: Headers, _payload: any) {
    return isInvalidError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a bad request error.
   */
  isBadRequestError(status: number, _headers: Headers, _payload: any) {
    return isBadRequestError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a "not found" error.
   */
  isNotFoundError(status: number, _headers: Headers, _payload: any) {
    return isNotFoundError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a "gone" error.
   */
  isGoneError(status: number, _headers: Headers, _payload: any) {
    return isGoneError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is an "abort" error.
   */
  isAbortError(status: number, _headers: Headers, _payload: any) {
    return isAbortError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a "conflict" error.
   */
  isConflictError(status: number, _headers: Headers, _payload: any) {
    return isConflictError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a server error.
   */
  isServerError(status: number, _headers: Headers, _payload: any) {
    return isServerError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a success.
   */
  isSuccess(status: number, _headers: Headers, _payload: any) {
    return isSuccess(status);
  },

  parseErrorResponse(responseText: string): any {
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return responseText;
    }
  },

  normalizeErrorResponse(_status: number, _headers: Headers, payload: any) {
    return payload;
  }
});
