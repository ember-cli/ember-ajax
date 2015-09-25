import Ember from 'ember';

import {
  AjaxError,
  UnauthorizedError,
  InvalidError,
  ForbiddenError
} from '../errors';
import parseResponseHeaders from '../utils/parse-response-headers';

const {
  get
} = Ember;

/**
  ### Headers customization

  Some APIs require HTTP headers, e.g. to provide an API key. Arbitrary
  headers can be set as key/value pairs on the `RESTAdapter`'s `headers`
  object and Ember Data will send them along with each ajax request.

  ```app/services/ajax
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    headers: {
      "API_KEY": "secret key",
      "ANOTHER_HEADER": "Some header value"
    }
  });
  ```

  `headers` can also be used as a computed property to support dynamic
  headers.

  ```app/services/ajax.js
  import Ember from 'ember';
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    session: Ember.inject.service(),
    headers: Ember.computed("session.authToken", function() {
      return {
        "API_KEY": this.get("session.authToken"),
        "ANOTHER_HEADER": "Some header value"
      };
    })
  });
  ```

  In some cases, your dynamic headers may require data from some
  object outside of Ember's observer system (for example
  `document.cookie`). You can use the
  [volatile](/api/classes/Ember.ComputedProperty.html#method_volatile)
  function to set the property into a non-cached mode causing the headers to
  be recomputed with every request.

  ```app/services/ajax.js
  import Ember from 'ember';
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    session: Ember.inject.service(),
    headers: Ember.computed("session.authToken", function() {
      return {
        "API_KEY": Ember.get(document.cookie.match(/apiKey\=([^;]*)/), "1"),
        "ANOTHER_HEADER": "Some header value"
      };
    }).volatile()
  });
  ```

**/
export default Ember.Service.extend({

  request(url, type, options) {
    const hash = this.options(url, type, options);

    return new Ember.RSVP.Promise((resolve, reject) => {

      hash.success = (payload, textStatus, jqXHR) => {
        let response = this.handleResponse(
          jqXHR.status,
          parseResponseHeaders(jqXHR.getAllResponseHeaders()),
          payload
        );

        if (response instanceof AjaxError) {
          reject(response);
        } else {
          resolve(response);
        }
      };

      hash.error = (jqXHR, textStatus, errorThrown) => {
        let error;

         if (!(error instanceof Error)) {
           if (errorThrown instanceof Error) {
             error = errorThrown;
           } else {
             error = this.handleResponse(
               jqXHR.status,
               parseResponseHeaders(jqXHR.getAllResponseHeaders()),
               this.parseErrorResponse(jqXHR.responseText) || errorThrown
             );
           }
         }
         reject(error);
      };

      Ember.$.ajax(hash);
    }, `ember-ajax: ${hash.type} to ${url}`);
  },

  /**
    @method options
    @private
    @param {String} url
    @param {String} type The request type GET, POST, PUT, DELETE etc.
    @param {Object} options
    @return {Object}
  */
  options(url, type, options) {
    var hash = options || {};
    hash.url = url;
    hash.type = type;
    hash.dataType = hash.dataType || 'json';
    hash.context = this;

    var headers = get(this, 'headers');
    if (headers !== undefined) {
      hash.beforeSend = function (xhr) {
        Object.keys(headers).forEach((key) =>  xhr.setRequestHeader(key, headers[key]));
      };
    }

    return hash;
  },

  /**
   Takes an ajax response, and returns the json payload or an error.

   By default this hook just returns the json payload passed to it.
   You might want to override it in two cases:

   1. Your API might return useful results in the response headers.
   Response headers are passed in as the second argument.

   2. Your API might return errors as successful responses with status code
   200 and an Errors text or object.
   @method handleResponse
   @param  {Number} status
   @param  {Object} headers
   @param  {Object} payload
   @return {Object | DS.AdapterError} response
 */
 handleResponse(status, headers, payload) {
   if (this.isSuccess(status, headers, payload)) {
     return payload;
   } else if (this.isUnauthorized(status, headers, payload)) {
     return new UnauthorizedError(payload.errors);
   } else if (this.isForbidden(status, headers, payload)){
     return new ForbiddenError(payload.errors);
   } else if (this.isInvalid(status, headers, payload)) {
     return new InvalidError(payload.errors);
   }

   let errors = this.normalizeErrorResponse(status, headers, payload);

   return new AjaxError(errors);
 },

  /**
   Default `handleResponse` implementation uses this hook to decide if the
   response is a an authorized error.
   @method isUnauthorized
   @param  {Number} status
   @param  {Object} headers
   @param  {Object} payload
   @return {Boolean}
 */
  isUnauthorized(status/*, headers, payload */) {
    return status === 401;
  },

  /**
     Default `handleResponse` implementation uses this hook to decide if the
     response is a forbidden error.
     @method isForbidden
     @param  {Number} status
     @param  {Object} headers
     @param  {Object} payload
     @return {Boolean}
   */
  isForbidden(status/*, headers, payload */) {
    return status === 403;
  },

  /**
    Default `handleResponse` implementation uses this hook to decide if the
    response is a an invalid error.
    @method isInvalid
    @param  {Number} status
    @param  {Object} headers
    @param  {Object} payload
    @return {Boolean}
  */
  isInvalid(status/*, headers, payload */) {
  return status === 422;
  },

   /**
    Default `handleResponse` implementation uses this hook to decide if the
    response is a success.
    @method isSuccess
    @param  {Number} status
    @param  {Object} headers
    @param  {Object} payload
    @return {Boolean}
  */
  isSuccess(status/*, headers, payload */) {
    return status >= 200 && status < 300 || status === 304;
  },

  /**
    @method parseErrorResponse
    @private
    @param {String} responseText
    @return {Object}
  */
  parseErrorResponse(responseText) {
    var json = responseText;

    try {
      json = Ember.$.parseJSON(responseText);
    } catch (e) {}

    return json;
  },

  /**
    @method normalizeErrorResponse
    @private
    @param  {Number} status
    @param  {Object} headers
    @param  {Object} payload
    @return {Object} errors payload
  */
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.errors) {
      return payload.errors;
    } else {
      return [
        {
          status: `${status}`,
          title: "The backend responded with an error",
          detail: `${payload}`
        }
      ];
    }
  }
});
