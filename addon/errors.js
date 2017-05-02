import Ember from 'ember';

const { Error: EmberError } = Ember;

/**
 * @class AjaxError
 * @private
 */
export function AjaxError(errors, message = 'Ajax operation failed') {
  EmberError.call(this, message);

  this.errors = errors || [
    {
      title: 'Ajax Error',
      detail: message
    }
  ];
}

AjaxError.prototype = Object.create(EmberError.prototype);

/**
 * @class HttpError
 * @public
 */
export function HttpError(errors) {
  AjaxError.call(this, errors, 'Http request failed');
}

HttpError.prototype = Object.create(AjaxError.prototype);

/**
 * @class InvalidError
 * @public
 */
export function InvalidError(errors) {
  HttpError.call(this, errors, 'Request was rejected because it was invalid');
}

InvalidError.prototype = Object.create(HttpError.prototype);

/**
 * @class UnauthorizedError
 * @public
 */
export function UnauthorizedError(errors) {
  HttpError.call(this, errors, 'Http authorization failed');
}

UnauthorizedError.prototype = Object.create(HttpError.prototype);

/**
 * @class ForbiddenError
 * @public
 */
export function ForbiddenError(errors) {
  HttpError.call(this, errors,
    'Request was rejected because user is not permitted to perform this operation.');
}

ForbiddenError.prototype = Object.create(HttpError.prototype);

/**
 * @class BadRequestError
 * @public
 */
export function BadRequestError(errors) {
  HttpError.call(this, errors, 'Request was formatted incorrectly.');
}

BadRequestError.prototype = Object.create(HttpError.prototype);

/**
 * @class NotFoundError
 * @public
 */
export function NotFoundError(errors) {
  HttpError.call(this, errors, 'Resource was not found.');
}

NotFoundError.prototype = Object.create(HttpError.prototype);

/**
 * @class TimeoutError
 * @public
 */
export function TimeoutError() {
  AjaxError.call(this, null, 'The http request timed out');
}

TimeoutError.prototype = Object.create(AjaxError.prototype);

/**
 * @class AbortError
 * @public
 */
export function AbortError() {
  AjaxError.call(this, null, 'The http request was aborted');
}

AbortError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ServerError
 * @public
 */
export function ServerError(errors) {
  HttpError.call(this, errors, 'Request was rejected due to server error');
}

ServerError.prototype = Object.create(HttpError.prototype);

/**
 * Checks if the given status code or AjaxError object represents a
 * http request error
 * @method isHttpError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isHttpError(error) {
  if (error instanceof AjaxError) {
    return error instanceof HttpError;
  } else {
    // error code 0 indicate a non-http error
    return error && error > 0;
  }
}

/**
 * Checks if the given status code or AjaxError object represents an
 * unauthorized request error
 * @method isUnauthorizedError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isUnauthorizedError(error) {
  if (error instanceof AjaxError) {
    return error instanceof UnauthorizedError;
  } else {
    return error === 401;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a forbidden
 * request error
 * @method isForbiddenError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isForbiddenError(error) {
  if (error instanceof AjaxError) {
    return error instanceof ForbiddenError;
  } else {
    return error === 403;
  }
}

/**
 * Checks if the given status code or AjaxError object represents an invalid
 * request error
 * @method isInvalidError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isInvalidError(error) {
  if (error instanceof AjaxError) {
    return error instanceof InvalidError;
  } else {
    return error === 422;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a bad request
 * error
 * @method isBadRequestError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isBadRequestError(error) {
  if (error instanceof AjaxError) {
    return error instanceof BadRequestError;
  } else {
    return error === 400;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a
 * "not found" error
 * @method isNotFoundError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isNotFoundError(error) {
  if (error instanceof AjaxError) {
    return error instanceof NotFoundError;
  } else {
    return error === 404;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a
 * "timeout" error
 * @method isTimeoutError
 * @public
 * @param  {AjaxError} error
 * @return {Boolean}
 */
export function isTimeoutError(error) {
  return error instanceof TimeoutError;
}

/**
 * Checks if the given status code or AjaxError object represents an
 * "abort" error
 * @method isAbortError
 * @public
 * @param  {AjaxError} error
 * @return {Boolean}
 */
export function isAbortError(error) {
  return error instanceof AbortError;
}

/**
 * Checks if the given status code or AjaxError object represents a server error
 * @method isServerError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isServerError(error) {
  if (error instanceof AjaxError) {
    return error instanceof ServerError;
  } else {
    return error >= 500 && error < 600;
  }
}

/**
 * Checks if the given status code represents a successful request
 * @method isSuccess
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isSuccess(status) {
  return status >= 200 && status < 300 || status === 304;
}
