import Ember from 'ember';

const EmberError = Ember.Error;

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
 * @class InvalidError
 * @public
 */
export function InvalidError(errors) {
  AjaxError.call(this, errors, 'Request was rejected because it was invalid');
}

InvalidError.prototype = Object.create(AjaxError.prototype);

/**
 * @class UnauthorizedError
 * @public
 */
export function UnauthorizedError(errors) {
  AjaxError.call(this, errors, 'Ajax authorization failed');
}

UnauthorizedError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ForbiddenError
 * @public
 */
export function ForbiddenError(errors) {
  AjaxError.call(this, errors,
    'Request was rejected because user is not permitted to perform this operation.');
}

ForbiddenError.prototype = Object.create(AjaxError.prototype);

/**
 * @class BadRequestError
 * @public
 */
export function BadRequestError(errors) {
  AjaxError.call(this, errors, 'Request was formatted incorrectly.');
}

BadRequestError.prototype = Object.create(AjaxError.prototype);

/**
 * @class NotFoundError
 * @public
 */
export function NotFoundError(errors) {
  AjaxError.call(this, errors, 'Resource was not found.');
}

NotFoundError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ServerError
 * @public
 */
export function ServerError(errors) {
  AjaxError.call(this, errors, 'Request was rejected due to server error');
}

ServerError.prototype = Object.create(AjaxError.prototype);

/**
 * Checks if the given status code represents an unauthorized request error
 * @method isUnauthorizedError
 * @public
 * @param  {Number | AjaxError} error
 * @return {Boolean}
 */
export function isUnauthorizedError(error) {
  return error === 401;
}

/**
 * Checks if the given status code represents a forbidden request error
 * @method isForbiddenError
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isForbiddenError(status) {
  return status === 403;
}

/**
 * Checks if the given status code represents an invalid request error
 * @method isInvalidError
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isInvalidError(status) {
  return status === 422;
}

/**
 * Checks if the given status code represents a bad request error
 * @method isBadRequestError
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isBadRequestError(status) {
  return status === 400;
}

/**
 * Checks if the given status code represents a "not found" error
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
 * Checks if the given status code represents a server error
 * @method isServerError
 * @public
 * @param {Number} status
 * @return {Boolean}
 */
export function isServerError(status) {
  return status >= 500 && status < 600;
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
