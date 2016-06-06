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
import { RequestURL } from '../utils/url-helpers';
import ajax from '../utils/ajax';

const {
  $,
  Error: EmberError,
  Mixin,
  RSVP: { Promise },
  get,
  isNone,
  merge,
  run,
  Test,
  testing
} = Ember;
const JSONAPIContentType = 'application/vnd.api+json';

function isJSONAPIContentType(header) {
  if (isNone(header)) {
    return false;
  }
  return header.indexOf(JSONAPIContentType) === 0;
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

let pendingRequestCount = 0;
if (testing) {
  Test.registerWaiter(function() {
    return pendingRequestCount === 0;
  });
}

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

  request(url, options) {
    const hash = this.options(url, options);
    return new Promise((resolve, reject) => {
      this.raw(url, hash)
        .then(({ response }) => {
          resolve(response);
        })
        .catch(({ response }) => {
          reject(response);
        });
    }, `ember-ajax: ${hash.type} ${hash.url} response`);
  },

  raw(url, options) {
    const hash = this.options(url, options);
    const requestData = {
      type: hash.type,
      url: hash.url
    };

    if (isJSONAPIContentType(hash.headers['Content-Type']) && requestData.type !== 'GET') {
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

        pendingRequestCount--;

        if (isAjaxError(response)) {
          run.join(null, reject, { payload, textStatus, jqXHR, response });
        } else {
          run.join(null, resolve, { payload, textStatus, jqXHR, response });
        }
      };

      hash.error = (jqXHR, textStatus, errorThrown) => {
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

        pendingRequestCount--;

        run.join(null, reject, { payload, textStatus, jqXHR, errorThrown, response });
      };

      pendingRequestCount++;

      ajax(hash);
    }, `ember-ajax: ${hash.type} ${hash.url}`);
  },

  /**
   * calls `request()` but forces `options.type` to `POST`
   * @public
   */
  post(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'POST'));
  },

  /**
   * calls `request()` but forces `options.type` to `PUT`
   * @public
   */
  put(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PUT'));
  },

  /**
   * calls `request()` but forces `options.type` to `PATCH`
   * @public
   */
  patch(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PATCH'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   * @public
   */
  del(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'DELETE'));
  },

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   * alias for `del()`
   * @public
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

  // forcibly manipulates the options hash to include the HTTP method on the type key
  _addTypeToOptionsFor(options, method) {
    options = options || {};
    options.type = method;
    return options;
  },

  /**
   * @method _getFullHeadersHash
   * @private
   * @param {Object} headers
   * @return {Object}
   */
  _getFullHeadersHash(headers) {
    const classHeaders = get(this, 'headers') || {};
    const _headers = merge({}, classHeaders);
    return merge(_headers, headers);
  },

  /**
   * @method options
   * @private
   * @param {String} url
   * @param {Object} options
   * @return {Object}
   */
  options(url, options = {}) {
    options.url = this._buildURL(url, options);
    options.type = options.type || 'GET';
    options.dataType = options.dataType || 'json';
    options.contentType = options.contentType || get(this, 'contentType');

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
   * @param {object} [options] the options for the request being made
   * @param {object.host} [host] the host to use for this request
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

  _normalizePath(path) {
    if (path) {
      // make sure path starts with `/`
      if (path.charAt(0) !== '/') {
        path = `/${path}`;
      }

      // remove end `/`
      if (path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
      }
    }
    return path;
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
    payload = payload || {};
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
   * @param {String} host the host you are sending too
   * @param {RegExp | String} matcher a string or regex that you can match the host to.
   * @returns {Boolean} if the host passed the matcher
   */
  _matchHosts(host, matcher) {
    if (matcher.constructor === RegExp) {
      return matcher.test(host);
    } else if (typeof matcher === 'string') {
      return matcher === host;
    } else {
      Ember.Logger.warn('trustedHosts only handles strings or regexes.', matcher, 'is neither.');
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
    const trustedHosts = get(this, 'trustedHosts') || Ember.A();

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
    const payloadContentType = headers['Content-Type'] || 'Empty Content-Type';

    if (payloadContentType === 'text/html' && payload.length > 250) {
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
   * @param {String} responseText
   * @return {Object}
   */
  parseErrorResponse(responseText) {
    let json = responseText;

    try {
      json = $.parseJSON(responseText);
    } catch (e) {}

    return json;
  },

  /**
   * @method normalizeErrorResponse
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @return {Array} errors payload
   */
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.errors) {
      if (!Ember.isArray(payload.errors)) {
        return payload.errors;
      }

      return payload.errors.map(function(error) {
        let ret = merge({}, error);

        if (typeof ret.status === 'number') {
          ret.status = `${ret.status}`;
        }

        return ret;
      });
    } else {
      return [
        {
          status: `${status}`,
          title: 'The backend responded with an error',
          detail: payload
        }
      ];
    }
  }
});
