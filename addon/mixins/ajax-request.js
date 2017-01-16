import Ember from 'ember';
import {
  AjaxError,
  UnauthorizedError,
  InvalidError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
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
  isConflictError,
  isAbortError,
  isServerError,
  isSuccess
} from '../errors';
import parseResponseHeaders from '../utils/parse-response-headers';
import getHeader from '../utils/get-header';
import { RequestURL } from '../utils/url-helpers';
import ajax from '../utils/ajax';

const {
  $,
  A,
  Error: EmberError,
  Logger,
  Mixin,
  RSVP: { Promise },
  Test,
  get,
  isArray,
  isEmpty,
  isNone,
  merge,
  run,
  runInDebug,
  testing,
  warn
} = Ember;
const JSONAPIContentType = /^application\/vnd\.api\+json/i;

function isJSONAPIContentType(header) {
  if (isNone(header)) {
    return false;
  }
  return !!header.match(JSONAPIContentType);
}

function startsWithSlash(string) {
  return string.charAt(0) === '/';
}

function endsWithSlash(string) {
  return string.charAt(string.length - 1) === '/';
}

function stripSlashes(path) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = path.substring(1);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = path.slice(0, -1);
  }
  return path;
}

function isObject(object) {
  return typeof object === 'object';
}

function isString(object) {
  return typeof object === 'string';
}

let pendingRequestCount = 0;
if (testing) {
  Test.registerWaiter(function() {
    return pendingRequestCount === 0;
  });
}

/**
 * AjaxRequest Mixin
 *
 * @public
 * @mixin
 */
export default Mixin.create({

  /**
   * The default value for the request `contentType`
   *
   * For now, defaults to the same value that jQuery would assign.  In the
   * future, the default value will be for JSON requests.
   * @property {string} contentType
   * @public
   * @default
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
   * @property {Object} headers
   * @public
   * @default
   */
  headers: {},

  /**
   * Make an AJAX request, ignoring the raw XHR object and dealing only with
   * the response
   *
   * @method request
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  request(url, options) {
    const hash = this.options(url, options);
    return new Promise((resolve, reject) => {
      this._makeRequest(hash)
        .then(({ response }) => {
          resolve(response);
        })
        .catch(({ response }) => {
          reject(response);
        });
    }, `ember-ajax: ${hash.type} ${hash.url} response`);
  },

  /**
   * Make an AJAX request, returning the raw XHR object along with the response
   *
   * @method raw
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  raw(url, options) {
    const hash = this.options(url, options);
    return this._makeRequest(hash);
  },

  /**
   * Shared method to actually make an AJAX request
   *
   * @method _makeRequest
   * @private
   * @param {Object} hash The options for the request
   * @param {string} hash.url The URL to make the request to
   * @return {Promise} The result of the request
   */
  _makeRequest(hash) {
    const method = hash.method || hash.type || 'GET';
    const requestData = { method, type: method, url: hash.url };

    if (isJSONAPIContentType(getHeader(hash.headers, 'Content-Type')) && requestData.type !== 'GET') {
      if (typeof hash.data === 'object') {
        hash.data = JSON.stringify(hash.data);
      }
    }

    return new Promise((resolve, reject) => {
      hash.success = (payload, textStatus, jqXHR) => {
        let response = this.handleResponse(
          jqXHR.status,
          parseResponseHeaders(jqXHR.getAllResponseHeaders()),
          payload,
          requestData
        );

        pendingRequestCount = pendingRequestCount - 1;

        if (isAjaxError(response)) {
          run.join(null, reject, { payload, textStatus, jqXHR, response });
        } else {
          run.join(null, resolve, { payload, textStatus, jqXHR, response });
        }
      };

      hash.error = (jqXHR, textStatus, errorThrown) => {
        runInDebug(function() {
          let message = `The server returned an empty string for ${requestData.type} ${requestData.url}, which cannot be parsed into a valid JSON. Return either null or {}.`;
          let validJSONString = !(textStatus === 'parsererror' && jqXHR.responseText === '');
          warn(message, validJSONString, {
            id: 'ds.adapter.returned-empty-string-as-JSON'
          });
        });

        const payload = this.parseErrorResponse(jqXHR.responseText) || errorThrown;
        let response;

        if (errorThrown instanceof Error) {
          response = errorThrown;
        } else if (textStatus === 'timeout') {
          response = new TimeoutError();
        } else if (textStatus === 'abort') {
          response = new AbortError();
        } else {
          response = this.handleResponse(
             jqXHR.status,
             parseResponseHeaders(jqXHR.getAllResponseHeaders()),
             payload,
             requestData
          );
        }

        pendingRequestCount = pendingRequestCount - 1;

        run.join(null, reject, { payload, textStatus, jqXHR, errorThrown, response });
      };

      pendingRequestCount = pendingRequestCount + 1;

      ajax(hash);
    }, `ember-ajax: ${hash.type} ${hash.url}`);
  },

  /**
   * calls `request()` but forces `options.type` to `POST`
   *
   * @method post
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  post(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'POST'));
  },

  /**
   * calls `request()` but forces `options.type` to `PUT`
   *
   * @method put
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  put(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PUT'));
  },

  /**
   * calls `request()` but forces `options.type` to `PATCH`
   *
   * @method patch
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  patch(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PATCH'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   *
   * @method del
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  del(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'DELETE'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   *
   * Alias for `del()`
   *
   * @method delete
   * @public
   * @param {string} url The url to make a request to
   * @param {Object} options The options for the request
   * @return {Promise} The result of the request
   */
  delete() {
    return this.del(...arguments);
  },

  /**
   * Wrap the `.get` method so that we issue a warning if
   *
   * Since `.get` is both an AJAX pattern _and_ an Ember pattern, we want to try
   * to warn users when they try using `.get` to make a request
   *
   * @method get
   * @public
   */
  get(url) {
    if (arguments.length > 1 || url.charAt(0) === '/') {
      throw new EmberError('It seems you tried to use `.get` to make a request! Use the `.request` method instead.');
    }
    return this._super(...arguments);
  },

  /**
   * Manipulates the options hash to include the HTTP method on the type key
   *
   * @method _addTypeToOptionsFor
   * @private
   * @param {Object} options The original request options
   * @param {string} method The method to enforce
   * @return {Object} The new options, with the method set
   */
  _addTypeToOptionsFor(options, method) {
    options = options || {};
    options.type = method;
    return options;
  },

  /**
   * Get the full "headers" hash, combining the service-defined headers with
   * the ones provided for the request
   *
   * @method _getFullHeadersHash
   * @private
   * @param {Object} headers
   * @return {Object}
   */
  _getFullHeadersHash(headers) {
    const classHeaders = get(this, 'headers');
    const _headers = merge({}, classHeaders);
    return merge(_headers, headers);
  },

  /**
   * @method options
   * @private
   * @param {string} url
   * @param {Object} options
   * @return {Object}
   */
  options(url, options = {}) {
    options = merge({}, options);
    options.url = this._buildURL(url, options);
    options.type = options.type || 'GET';
    options.dataType = options.dataType || 'json';
    options.contentType = isEmpty(options.contentType) ? get(this, 'contentType') : options.contentType;

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
   *
   * @private
   * @param {string} url the url, or url segment, to request
   * @param {Object} [options={}] the options for the request being made
   * @param {string} [options.host] the host to use for this request
   * @returns {string} the URL to make a request to
   */
  _buildURL(url, options = {}) {
    const urlObject = new RequestURL(url);

    // If the URL passed is not relative, return the whole URL
    if (urlObject.isComplete) {
      return urlObject.href;
    }

    const host = options.host || get(this, 'host');
    let namespace = options.namespace || get(this, 'namespace');
    if (namespace) {
      namespace = stripSlashes(namespace);
    }

    // If the URL has already been constructed (presumably, by Ember Data), then we should just leave it alone
    const hasNamespaceRegex = new RegExp(`^(\/)?${namespace}`);
    if (hasNamespaceRegex.test(url)) {
      return url;
    }

    let fullUrl = '';
    // Add the host, if it exists
    if (host) {
      fullUrl += host;
    }
    // Add the namespace, if it exists
    if (namespace) {
      if (!endsWithSlash(fullUrl)) {
        fullUrl += '/';
      }
      fullUrl += namespace;
    }
    // Add the URL segment, if it exists
    if (url) {
      if (!startsWithSlash(url)) {
        fullUrl += '/';
      }
      fullUrl += url;
    }

    return fullUrl;
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
   *
   * @method handleResponse
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @param  {Object} requestData the original request information
   * @return {Object | AjaxError} response
   */
  handleResponse(status, headers, payload, requestData) {
    payload = (payload === null || payload === undefined) ? {} : payload;
    const errors = this.normalizeErrorResponse(status, headers, payload);

    if (this.isSuccess(status, headers, payload)) {
      return payload;
    } else if (this.isUnauthorizedError(status, headers, payload)) {
      return new UnauthorizedError(errors);
    } else if (this.isForbiddenError(status, headers, payload)) {
      return new ForbiddenError(errors);
    } else if (this.isInvalidError(status, headers, payload)) {
      return new InvalidError(errors);
    } else if (this.isBadRequestError(status, headers, payload)) {
      return new BadRequestError(errors);
    } else if (this.isNotFoundError(status, headers, payload)) {
      return new NotFoundError(errors);
    } else if (this.isAbortError(status, headers, payload)) {
      return new AbortError(errors);
    } else if (this.isConflictError(status, headers, payload)) {
      return new ConflictError(errors);
    } else if (this.isServerError(status, headers, payload)) {
      return new ServerError(errors);
    }

    const detailedMessage = this.generateDetailedMessage(
      status,
      headers,
      payload,
      requestData
    );
    return new AjaxError(errors, detailedMessage);
  },

  /**
   * Match the host to a provided array of strings or regexes that can match to a host
   *
   * @method matchHosts
   * @private
   * @param {string} host the host you are sending too
   * @param {RegExp | string} matcher a string or regex that you can match the host to.
   * @returns {Boolean} if the host passed the matcher
   */
  _matchHosts(host, matcher) {
    if (matcher.constructor === RegExp) {
      return matcher.test(host);
    } else if (typeof matcher === 'string') {
      return matcher === host;
    } else {
      Logger.warn('trustedHosts only handles strings or regexes.', matcher, 'is neither.');
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
   *
   * @method _shouldSendHeaders
   * @private
   * @property {Object} hash request options hash
   * @returns {Boolean} whether or not headers should be sent
   */
  _shouldSendHeaders({ url, host }) {
    url = url || '';
    host = host || get(this, 'host') || '';

    const urlObject = new RequestURL(url);
    const trustedHosts = get(this, 'trustedHosts') || A();

    // Add headers on relative URLs
    if (!urlObject.isComplete) {
      return true;
    } else if (trustedHosts.find((matcher) => this._matchHosts(urlObject.hostname, matcher))) {
      return true;
    }

    // Add headers on matching host
    const hostObject = new RequestURL(host);
    return urlObject.sameHost(hostObject);
  },

  /**
   * Generates a detailed ("friendly") error message, with plenty
   * of information for debugging (good luck!)
   *
   * @method generateDetailedMessage
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @param  {Object} requestData the original request information
   * @return {Object} request information
   */
  generateDetailedMessage(status, headers, payload, requestData) {
    let shortenedPayload;
    const payloadContentType = getHeader(headers, 'Content-Type') || 'Empty Content-Type';

    if (payloadContentType.toLowerCase() === 'text/html' && payload.length > 250) {
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
   *
   * @method isUnauthorizedError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isUnauthorizedError(status) {
    return isUnauthorizedError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a forbidden error.
   *
   * @method isForbiddenError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isForbiddenError(status) {
    return isForbiddenError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a an invalid error.
   *
   * @method isInvalidError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isInvalidError(status) {
    return isInvalidError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a bad request error.
   *
   * @method isBadRequestError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isBadRequestError(status) {
    return isBadRequestError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a "not found" error.
   *
   * @method isNotFoundError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isNotFoundError(status) {
    return isNotFoundError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is an "abort" error.
   *
   * @method isAbortError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isAbortError(status) {
    return isAbortError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a "conflict" error.
   *
   * @method isConflictError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isConflictError(status) {
    return isConflictError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a server error.
   *
   * @method isServerError
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isServerError(status) {
    return isServerError(status);
  },

  /**
   * Default `handleResponse` implementation uses this hook to decide if the
   * response is a success.
   *
   * @method isSuccess
   * @private
   * @param {Number} status
   * @param {Object} headers
   * @param {Object} payload
   * @return {Boolean}
   */
  isSuccess(status) {
    return isSuccess(status);
  },

  /**
   * @method parseErrorResponse
   * @private
   * @param {string} responseText
   * @return {Object}
   */
  parseErrorResponse(responseText) {
    try {
      return JSON.parse(responseText);
    } catch(e) {
      return responseText;
    }
  },

  /**
   * Normalize the error from the server into the same format
   *
   * The format we normalize to is based on the JSON API specification.  The
   * return value should be an array of objects that match the format they
   * describe. More details about the object format can be found
   * [here](http://jsonapi.org/format/#error-objects)
   *
   * The basics of the format are as follows:
   *
   * ```javascript
   * [
   *   {
   *     status: 'The status code for the error',
   *     title: 'The human-readable title of the error'
   *     detail: 'The human-readable details of the error'
   *   }
   * ]
   * ```
   *
   * In cases where the server returns an array, then there should be one item
   * in the array for each of the payload.  If your server returns a JSON API
   * formatted payload already, it will just be returned directly.
   *
   * If your server returns something other than a JSON API format, it's
   * suggested that you override this method to convert your own errors into the
   * one described above.
   *
   * @method normalizeErrorResponse
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @return {Array} An array of JSON API-formatted error objects
   */
  normalizeErrorResponse(status, headers, payload) {
    if (isArray(payload.errors)) {
      return payload.errors.map(function(error) {
        if (isObject(error)) {
          let ret = merge({}, error);
          ret.status = `${error.status}`;
          return ret;
        } else {
          return {
            status: `${status}`,
            title: error
          };
        }
      });
    } else if (isArray(payload)) {
      return payload.map(function(error) {
        if (isObject(error)) {
          return {
            status: `${status}`,
            title: error.title || 'The backend responded with an error',
            detail: error
          };
        } else {
          return {
            status: `${status}`,
            title: `${error}`
          };
        }
      });
    } else {
      if (isString(payload)) {
        return [
          {
            status: `${status}`,
            title: payload
          }
        ];
      } else {
        return [
          {
            status: `${status}`,
            title: payload.title || 'The backend responded with an error',
            detail: payload
          }
        ];
      }
    }
  }
});
