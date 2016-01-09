import Ember from 'ember';
import {
  AjaxError,
  UnauthorizedError,
  InvalidError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  ServerError,
  isUnauthorizedError,
  isForbiddenError,
  isInvalidError,
  isBadRequestError,
  isNotFoundError,
  isServerError,
  isSuccess
} from './errors';
import parseResponseHeaders from './utils/parse-response-headers';

const {
  $,
  RSVP: { Promise },
  get,
  isBlank,
  run
} = Ember;

export default class AjaxRequest {

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
  }

  raw(url, options) {
    const hash = this.options(url, options);
    return new Promise((resolve, reject) => {
      hash.success = (payload, textStatus, jqXHR) => {
        let response = this.handleResponse(
          jqXHR.status,
          parseResponseHeaders(jqXHR.getAllResponseHeaders()),
          payload
        );

        if (response instanceof AjaxError) {
          run.join(null, reject, { payload, textStatus, jqXHR, response });
        } else {
          run.join(null, resolve, { payload, textStatus, jqXHR, response });
        }
      };

      hash.error = (jqXHR, textStatus, errorThrown) => {
        const payload = this.parseErrorResponse(jqXHR.responseText) || errorThrown;
        const response = this.handleResponse(
           jqXHR.status,
           parseResponseHeaders(jqXHR.getAllResponseHeaders()),
           payload
        );
        run.join(null, reject, { payload, textStatus, jqXHR, errorThrown, response });
      };

      $.ajax(hash);
    }, `ember-ajax: ${hash.type} ${hash.url}`);
  }

  /**
   * calls `request()` but forces `options.type` to `POST`
   * @public
   */
  post(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'POST'));
  }

  /**
   * calls `request()` but forces `options.type` to `PUT`
   * @public
   */
  put(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PUT'));
  }

  /**
   * calls `request()` but forces `options.type` to `PATCH`
   * @public
   */
  patch(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'PATCH'));
  }

  /**
   * calls `request()` but forces `options.type` to `DELETE`
   * @public
   */
  del(url, options) {
    return this.request(url, this._addTypeToOptionsFor(options, 'DELETE'));
  }

  // forcibly manipulates the options hash to include the HTTP method on the type key
  _addTypeToOptionsFor(options, method) {
    options = options || {};
    options.type = method;
    return options;
  }

  /**
   * @method options
   * @private
   * @param {String} url
   * @param {Object} options
   * @return {Object}
   */
  options(url, options) {
    const hash = options || {};
    hash.url = this._buildURL(url);
    hash.type = hash.type || 'GET';
    hash.dataType = hash.dataType || 'json';
    hash.context = this;

    const headers = get(this, 'headers');
    if (headers !== undefined) {
      hash.beforeSend = function(xhr) {
        Object.keys(headers).forEach((key) =>  xhr.setRequestHeader(key, headers[key]));
      };
    }

    return hash;
  }

  _buildURL(url) {
    const host = get(this, 'host');
    if (isBlank(host)) {
      return url;
    }
    const startsWith = String.prototype.startsWith || function(searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
    if (startsWith.call(url, '/')) {
      return `${host}${url}`;
    } else {
      return `${host}/${url}`;
    }
  }

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
   * @return {Object | DS.AdapterError} response
   */
  handleResponse(status, headers, payload) {
    payload = payload || {};
    if (this.isSuccess(status, headers, payload)) {
      return payload;
    } else if (this.isUnauthorizedError(status, headers, payload)) {
      return new UnauthorizedError(payload.errors);
    } else if (this.isForbiddenError(status, headers, payload)) {
      return new ForbiddenError(payload.errors);
    } else if (this.isInvalidError(status, headers, payload)) {
      return new InvalidError(payload.errors);
    } else if (this.isBadRequestError(status, headers, payload)) {
      return new BadRequestError(payload.errors);
    } else if (this.isNotFoundError(status, headers, payload)) {
      return new NotFoundError(payload.errors);
    } else if (this.isServerError(status, headers, payload)) {
      return new ServerError(payload.errors);
    }

    let errors = this.normalizeErrorResponse(status, headers, payload);
    return new AjaxError(errors);
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  /**
   * @method parseErrorResponse
   * @private
   * @param {String} responseText
   * @return {Object}
   */
  parseErrorResponse(responseText) {
    let json = responseText;

    try {
      json = Ember.$.parseJSON(responseText);
    } catch (e) {}

    return json;
  }

  /**
   * @method normalizeErrorResponse
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @return {Object} errors payload
   */
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.errors) {
      return payload.errors;
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
}
