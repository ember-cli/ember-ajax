import EmberError from '@ember/error';

/**
 * @class AjaxError
 * @public
 * @extends Ember.Error
 */
export function AjaxError(payload, message = 'Ajax operation failed', status) {
  EmberError.call(this, message);

  this.payload = payload;
  this.status = status;
}

AjaxError.prototype = Object.create(EmberError.prototype);

/**
 * @class InvalidError
 * @public
 * @extends AjaxError
 */
export function InvalidError(payload) {
  AjaxError.call(
    this,
    payload,
    'Request was rejected because it was invalid',
    422
  );
}

InvalidError.prototype = Object.create(AjaxError.prototype);

/**
 * @class UnauthorizedError
 * @public
 * @extends AjaxError
 */
export function UnauthorizedError(payload) {
  AjaxError.call(this, payload, 'Ajax authorization failed', 401);
}

UnauthorizedError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ForbiddenError
 * @public
 * @extends AjaxError
 */
export function ForbiddenError(payload) {
  AjaxError.call(
    this,
    payload,
    'Request was rejected because user is not permitted to perform this operation.',
    403
  );
}

ForbiddenError.prototype = Object.create(AjaxError.prototype);

/**
 * @class BadRequestError
 * @public
 * @extends AjaxError
 */
export function BadRequestError(payload) {
  AjaxError.call(this, payload, 'Request was formatted incorrectly.', 400);
}

BadRequestError.prototype = Object.create(AjaxError.prototype);

/**
 * @class NotFoundError
 * @public
 * @extends AjaxError
 */
export function NotFoundError(payload) {
  AjaxError.call(this, payload, 'Resource was not found.', 404);
}

NotFoundError.prototype = Object.create(AjaxError.prototype);

/**
 * @class GoneError
 * @public
 * @extends AjaxError
 */
export function GoneError(payload) {
  AjaxError.call(this, payload, 'Resource is no longer available.', 410);
}

GoneError.prototype = Object.create(AjaxError.prototype);

/**
 * @class TimeoutError
 * @public
 * @extends AjaxError
 */
export function TimeoutError() {
  AjaxError.call(this, null, 'The ajax operation timed out', -1);
}

TimeoutError.prototype = Object.create(AjaxError.prototype);

/**
 * @class AbortError
 * @public
 * @extends AjaxError
 */
export function AbortError() {
  AjaxError.call(this, null, 'The ajax operation was aborted', 0);
}

AbortError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ConflictError
 * @public
 * @extends AjaxError
 */
export function ConflictError(payload) {
  AjaxError.call(
    this,
    payload,
    'The ajax operation failed due to a conflict',
    409
  );
}

ConflictError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ServerError
 * @public
 * @extends AjaxError
 */
export function ServerError(payload, status) {
  AjaxError.call(
    this,
    payload,
    'Request was rejected due to server error',
    status
  );
}

ServerError.prototype = Object.create(AjaxError.prototype);

/**
 * Checks if the given error is or inherits from AjaxError
 *
 * @method isAjaxError
 * @public
 * @param  {Error} error
 * @return {Boolean}
 */
export function isAjaxError(error) {
  return error instanceof AjaxError;
}

/**
 * Checks if the given status code or AjaxError object represents an
 * unauthorized request error
 *
 * @method isUnauthorizedError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isUnauthorizedError(error) {
  if (isAjaxError(error)) {
    return error instanceof UnauthorizedError;
  } else {
    return error === 401;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a forbidden
 * request error
 *
 * @method isForbiddenError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isForbiddenError(error) {
  if (isAjaxError(error)) {
    return error instanceof ForbiddenError;
  } else {
    return error === 403;
  }
}

/**
 * Checks if the given status code or AjaxError object represents an invalid
 * request error
 *
 * @method isInvalidError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isInvalidError(error) {
  if (isAjaxError(error)) {
    return error instanceof InvalidError;
  } else {
    return error === 422;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a bad request
 * error
 *
 * @method isBadRequestError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isBadRequestError(error) {
  if (isAjaxError(error)) {
    return error instanceof BadRequestError;
  } else {
    return error === 400;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a "not found"
 * error
 *
 * @method isNotFoundError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isNotFoundError(error) {
  if (isAjaxError(error)) {
    return error instanceof NotFoundError;
  } else {
    return error === 404;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a "gone"
 * error
 *
 * @method isGoneError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isGoneError(error) {
  if (isAjaxError(error)) {
    return error instanceof GoneError;
  } else {
    return error === 410;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a
 * "timeout" error
 *
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
 *
 * @method isAbortError
 * @public
 * @param  {AjaxError} error
 * @return {Boolean}
 */
export function isAbortError(error) {
  if (isAjaxError(error)) {
    return error instanceof AbortError;
  } else {
    return error === 0;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a
 * conflict error
 *
 * @method isConflictError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isConflictError(error) {
  if (isAjaxError(error)) {
    return error instanceof ConflictError;
  } else {
    return error === 409;
  }
}

/**
 * Checks if the given status code or AjaxError object represents a server error
 *
 * @method isServerError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isServerError(error) {
  if (isAjaxError(error)) {
    return error instanceof ServerError;
  } else {
    return error >= 500 && error < 600;
  }
}

/**
 * Checks if the given status code represents a successful request
 *
 * @method isSuccess
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isSuccess(status) {
  const s = parseInt(status, 10);

  return (s >= 200 && s < 300) || s === 304;
}
